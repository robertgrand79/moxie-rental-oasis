
import React from 'react';
import { AIInput } from '@/components/ui/ai-input';
import { AITextarea } from '@/components/ui/ai-textarea';

interface EventBasicInfoFieldsProps {
  title: string;
  description: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
}

const EventBasicInfoFields = ({
  title,
  description,
  onTitleChange,
  onDescriptionChange
}: EventBasicInfoFieldsProps) => {
  return (
    <>
      <div className="md:col-span-2">
        <AIInput
          label="Event Title *"
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          onValueChange={(value) => onTitleChange(value)}
          required
          aiPrompt="Generate an engaging, attention-grabbing event title for a local community event. It should be concise, descriptive, and create excitement."
          aiTooltip="Generate event title with AI"
        />
      </div>

      <div className="md:col-span-2">
        <AITextarea
          label="Description"
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          onValueChange={(value) => onDescriptionChange(value)}
          rows={3}
          aiPrompt="Write an engaging event description that captures the essence of the event, what attendees can expect, and why they should attend. 3-4 sentences."
          aiTooltip="Generate event description with AI"
        />
      </div>
    </>
  );
};

export default EventBasicInfoFields;
