
import React from 'react';
import EventBasicInfoFields from './fields/EventBasicInfoFields';
import EventDateTimeFields from './fields/EventDateTimeFields';
import EventLocationCategoryFields from './fields/EventLocationCategoryFields';
import EventUrlFields from './fields/EventUrlFields';
import EventOptionsFields from './fields/EventOptionsFields';

export interface EventFormData {
  title: string;
  description: string;
  event_date: string;
  end_date: string;
  time_start: string;
  time_end: string;
  location: string;
  category: string;
  image_url: string;
  website_url: string;
  ticket_url: string;
  price_range: string;
  is_featured: boolean;
  is_active: boolean;
  is_recurring: boolean;
  recurrence_pattern: string;
  status: string;
  created_by: string;
}

interface EventFormFieldsProps {
  formData: EventFormData;
  setFormData: (data: EventFormData) => void;
  categories: Array<{ value: string; label: string }>;
  onLocationChange: (location: string) => void;
  onCategoryChange: (category: string) => void;
}

const EventFormFields = ({ 
  formData, 
  setFormData, 
  categories, 
  onLocationChange, 
  onCategoryChange 
}: EventFormFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <EventBasicInfoFields
        title={formData.title}
        description={formData.description}
        onTitleChange={(title) => setFormData({ ...formData, title })}
        onDescriptionChange={(description) => setFormData({ ...formData, description })}
      />

      <EventDateTimeFields
        eventDate={formData.event_date}
        endDate={formData.end_date}
        timeStart={formData.time_start}
        timeEnd={formData.time_end}
        onEventDateChange={(event_date) => setFormData({ ...formData, event_date })}
        onEndDateChange={(end_date) => setFormData({ ...formData, end_date })}
        onTimeStartChange={(time_start) => setFormData({ ...formData, time_start })}
        onTimeEndChange={(time_end) => setFormData({ ...formData, time_end })}
      />

      <EventLocationCategoryFields
        location={formData.location}
        category={formData.category}
        priceRange={formData.price_range}
        status={formData.status}
        categories={categories}
        onLocationChange={onLocationChange}
        onCategoryChange={onCategoryChange}
        onPriceRangeChange={(price_range) => setFormData({ ...formData, price_range })}
        onStatusChange={(status) => setFormData({ ...formData, status })}
      />

      <EventUrlFields
        imageUrl={formData.image_url}
        websiteUrl={formData.website_url}
        ticketUrl={formData.ticket_url}
        onImageUrlChange={(image_url) => setFormData({ ...formData, image_url })}
        onWebsiteUrlChange={(website_url) => setFormData({ ...formData, website_url })}
        onTicketUrlChange={(ticket_url) => setFormData({ ...formData, ticket_url })}
      />

      <EventOptionsFields
        isFeatured={formData.is_featured}
        isActive={formData.is_active}
        isRecurring={formData.is_recurring}
        recurrencePattern={formData.recurrence_pattern}
        onFeaturedChange={(is_featured) => setFormData({ ...formData, is_featured })}
        onActiveChange={(is_active) => setFormData({ ...formData, is_active })}
        onRecurringChange={(is_recurring) => setFormData({ ...formData, is_recurring })}
        onRecurrencePatternChange={(recurrence_pattern) => setFormData({ ...formData, recurrence_pattern })}
      />
    </div>
  );
};

export default EventFormFields;
