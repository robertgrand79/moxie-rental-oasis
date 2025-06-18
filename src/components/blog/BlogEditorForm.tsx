
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { UseFormReturn } from 'react-hook-form';
import ReactQuillEditor from '@/components/ReactQuillEditor';
import ImageUploader from '@/components/ImageUploader';

interface BlogFormData {
  title: string;
  excerpt: string;
  content: string;
  tags: string;
  status: 'draft' | 'published';
  author: string;
  published_at: Date | null;
}

interface BlogEditorFormProps {
  form: UseFormReturn<BlogFormData>;
  content: string;
  onContentChange: (content: string) => void;
  uploadedImage: string | null;
  onImageChange: (image: string | null) => void;
  onSubmit: (data: BlogFormData) => void;
  isEditing: boolean;
  onCancel: () => void;
}

const BlogEditorForm = ({
  form,
  content,
  onContentChange,
  uploadedImage,
  onImageChange,
  onSubmit,
  isEditing,
  onCancel
}: BlogEditorFormProps) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = form;
  const watchedAuthor = watch('author');
  const watchedPublishedAt = watch('published_at');

  const predefinedAuthors = [
    { value: 'Admin', label: 'Admin' },
    { value: 'Robert', label: 'Robert' },
    { value: 'Shelly', label: 'Shelly' },
    { value: 'Robert & Shelly', label: 'Robert & Shelly' },
    { value: 'custom', label: 'Custom Author...' }
  ];

  const handleEditorChange = (newContent: string) => {
    console.log('📝 ReactQuill content changed:', newContent.substring(0, 100));
    onContentChange(newContent);
    setValue('content', newContent);
  };

  const handleSaveDraft = () => {
    setValue('status', 'draft');
    handleSubmit(onSubmit)();
  };

  const handlePublish = () => {
    setValue('status', 'published');
    handleSubmit(onSubmit)();
  };

  const handleAuthorChange = (value: string) => {
    setValue('author', value);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setValue('published_at', date || null);
  };

  return (
    <div className="space-y-6">
      {/* Top Section: Basic Info Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            {...register('title', { required: 'Title is required' })}
            placeholder="Enter blog post title"
          />
          {errors.title && (
            <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="author">Author</Label>
          <Select value={watchedAuthor} onValueChange={handleAuthorChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select author" />
            </SelectTrigger>
            <SelectContent>
              {predefinedAuthors.map((author) => (
                <SelectItem key={author.value} value={author.value}>
                  {author.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {watchedAuthor === 'custom' && (
            <Input
              className="mt-2"
              placeholder="Enter custom author name"
              {...register('author', { required: 'Author is required' })}
            />
          )}
          {errors.author && (
            <p className="text-sm text-red-600 mt-1">{errors.author.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="published_at">Publication Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !watchedPublishedAt && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {watchedPublishedAt ? (
                  format(watchedPublishedAt, "PPP")
                ) : (
                  <span>Pick a date (optional)</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={watchedPublishedAt || undefined}
                onSelect={handleDateSelect}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            {...register('excerpt')}
            placeholder="Brief description of the post..."
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            {...register('tags')}
            placeholder="travel, eugene, accommodation"
          />
        </div>
      </div>

      {/* Middle Section: Featured Image */}
      <div>
        <ImageUploader
          uploadedImage={uploadedImage}
          onImageChange={onImageChange}
        />
      </div>

      {/* Bottom Section: Content Editor (Full Width) */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="content">Content</Label>
          <div className="border rounded-lg overflow-hidden">
            <ReactQuillEditor
              content={content}
              onChange={handleEditorChange}
              placeholder="Start writing your blog post..."
              className="min-h-[500px]"
            />
          </div>
          {errors.content && (
            <p className="text-sm text-red-600 mt-1">{errors.content.message}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
        >
          Cancel
        </Button>
        
        <div className="space-x-2">
          <Button 
            type="button" 
            variant="outline"
            onClick={handleSaveDraft}
          >
            Save as Draft
          </Button>
          <Button 
            type="button"
            onClick={handlePublish}
          >
            {isEditing ? 'Update Post' : 'Publish Post'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BlogEditorForm;
