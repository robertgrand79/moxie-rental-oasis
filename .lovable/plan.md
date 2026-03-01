

## Plan: Elevate Single Property Template to Match Multi-Property Quality

### Current State
The **multi-property template** has a rich, marketing-driven layout with 12+ sections including social proof, booking benefits, testimonials, "why choose us," and final features. The **single-property template** is comparatively sparse — it goes straight from hero/gallery into description and amenities with no marketing polish in between.

### Approach
Reuse the existing multi-property marketing components within the single property page, weaving the property-specific content (gallery, description, booking) into the richer page structure. The property data still drives the hero and booking sections, but the surrounding page feels like a full branded homepage.

### Proposed New Section Order

```text
 1. Hero (keep SinglePropertyHero with cover image)
 2. Sticky Booking Bar (keep, desktop only)
 3. Social Proof strip (reuse SocialProofSection)
 4. Photo Gallery (keep PhotoSpotlight)
 5. YouTube Video (keep, conditional)
 6. Property Description + Amenities (keep)
 7. Booking Benefits (reuse BookingBenefitsSection)
 8. Reviews / Testimonials (keep PropertyReviewsSection)
 9. Why Choose Us (reuse WhyChooseUsSection)
10. Local Events (keep EnhancedLocalEventsSection)
11. What's Nearby (keep EnhancedWhatsNearbySection)
12. Newsletter (keep TravelNewsletterSignup, match multi-property styling)
13. Final Features (reuse FinalFeaturesSection)
14. Mobile Sticky Booking Bar (keep StickyBookingBar)
```

### Changes

**File: `src/components/home/SinglePropertyHome.tsx`**
- Import `SocialProofSection`, `BookingBenefitsSection`, `WhyChooseUsSection`, `FinalFeaturesSection` from existing `@/components/home/` modules
- Import `FeatureErrorBoundary` for consistency with multi-property template
- Add Social Proof strip after the sticky booking bar
- Add Booking Benefits section between amenities and reviews
- Add Why Choose Us section after reviews
- Add Final Features section before the mobile sticky bar
- Wrap new sections in `FeatureErrorBoundary`
- Update newsletter section styling to match multi-property (rounded-3xl, backdrop-blur, larger padding)

No new components needed — purely assembling existing pieces into the single property layout.

