
# Plan: Fix Blog Image Upload Not Saving on Published Site

## Problem Summary

When uploading a featured image for blog posts on the published site (moxievacationrentals.com), the image appears to process but never saves. The database confirms the `image_url` field remains `null` for the affected blog post.

## Root Cause Analysis

After tracing the complete upload flow, I identified several potential failure points:

1. **Image Optimization Timeout** - The `loadImage` function has a 10-second timeout that may not be enough for large images on slower connections
2. **Silent Failures** - When uploads fail, the error is logged to console but the user sees only a generic "Upload failed" toast
3. **No Retry Mechanism** - If the upload fails due to a transient network issue, there's no automatic retry
4. **Session Expiration** - On the published site, if the user's authentication session expires, Supabase storage uploads will fail with an RLS error (bucket requires `auth.role() = 'authenticated'`)

## Solution

### 1. Add Better Error Diagnostics

**File: `src/hooks/useBlogImageUpload.ts`**

Enhance error handling to provide specific feedback about what went wrong:
- Distinguish between authentication errors, network errors, and other failures
- Show more actionable error messages in toast notifications
- Add explicit session validation before attempting upload

### 2. Add Upload Retry Logic

**File: `src/hooks/useBlogImageUpload.ts`**

Implement retry mechanism:
- Retry failed uploads up to 3 times with exponential backoff
- Only retry on transient errors (network issues, timeouts)
- Don't retry on permanent errors (authentication, permission denied)

### 3. Add Session Check Before Upload

**File: `src/components/ImageUploader.tsx`**

Before attempting upload:
- Check if user is authenticated
- If not authenticated, show a message asking user to log in again
- Prevent the upload attempt if session is invalid

### 4. Improve Image Optimization Fallback

**File: `src/hooks/useImageOptimization.ts`**

Make the fallback more robust:
- Increase timeout for image loading to 15 seconds
- If optimization fails, attempt to upload original file without optimization
- Add progress indication during upload

---

## Implementation Details

### Changes to `src/hooks/useBlogImageUpload.ts`

```typescript
// Add at the beginning of uploadBlogImage function:
// 1. Check if user is authenticated
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  toast({
    title: 'Authentication required',
    description: 'Please log in again to upload images.',
    variant: 'destructive'
  });
  return null;
}

// 2. Add retry logic to uploadSingleImage
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second initial delay

const uploadWithRetry = async (file: File, sizeLabel: string, attempt = 1) => {
  try {
    // existing upload code
  } catch (error) {
    if (attempt < MAX_RETRIES && isRetryableError(error)) {
      await delay(RETRY_DELAY * attempt);
      return uploadWithRetry(file, sizeLabel, attempt + 1);
    }
    throw error;
  }
};

// 3. Enhance error messages
if (uploadError) {
  const errorMessage = uploadError.message || 'Unknown error';
  if (errorMessage.includes('permission') || errorMessage.includes('policy')) {
    toast({
      title: 'Permission denied',
      description: 'Your session may have expired. Please refresh and try again.',
      variant: 'destructive'
    });
  } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    toast({
      title: 'Network error',
      description: 'Please check your connection and try again.',
      variant: 'destructive'
    });
  }
  // ... rest of error handling
}
```

### Changes to `src/components/ImageUploader.tsx`

```typescript
// Add authentication check before processing file
const processFile = async (file: File) => {
  // Check authentication first
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    toast({
      title: 'Please log in',
      description: 'You need to be logged in to upload images.',
      variant: 'destructive'
    });
    return;
  }
  
  // Continue with existing processing
  // ...
};
```

### Changes to `src/hooks/useImageOptimization.ts`

```typescript
// Increase timeout from 10 seconds to 15 seconds
const timeout = setTimeout(() => {
  URL.revokeObjectURL(objectUrl);
  reject(new Error('Image load timeout'));
}, 15000); // 15 second timeout
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useBlogImageUpload.ts` | Add session check, retry logic, and improved error messages |
| `src/components/ImageUploader.tsx` | Add pre-upload authentication check |
| `src/hooks/useImageOptimization.ts` | Increase timeout to 15 seconds |

---

## Expected Result

After these changes:
- Users will see specific error messages when uploads fail
- Authentication issues will prompt users to log in again
- Transient network failures will be automatically retried
- Image optimization will have more time to complete
- The upload flow will be more reliable on the published site
