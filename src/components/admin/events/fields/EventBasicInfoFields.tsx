
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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
        <Label htmlFor="title">Event Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          required
        />
      </div>

      <div className="md:col-span-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={3}
        />
      </div>
    </>
  );
};

export default EventBasicInfoFields;
