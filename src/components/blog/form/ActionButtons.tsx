
import React from 'react';
import { Button } from '@/components/ui/button';
import { UseFormReturn } from 'react-hook-form';
import { ExtendedBlogFormData } from '@/hooks/useBlogForm';

interface ActionButtonsProps {
  form: UseFormReturn<ExtendedBlogFormData>;
  onSubmit: (data: ExtendedBlogFormData) => void;
  isEditing: boolean;
  onCancel: () => void;
}

const ActionButtons = ({ form, onSubmit, isEditing, onCancel }: ActionButtonsProps) => {
  const { handleSubmit, formState: { isSubmitting } } = form;

  return (
    <div className="flex gap-4 pt-6 border-t">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      
      <Button
        type="button"
        variant="outline"
        onClick={handleSubmit((data) => {
          onSubmit({ ...data, status: 'draft' });
        })}
        disabled={isSubmitting}
      >
        Save as Draft
      </Button>
      
      <Button
        type="button"
        onClick={handleSubmit((data) => {
          onSubmit({ ...data, status: 'published' });
        })}
        disabled={isSubmitting}
      >
        {isEditing ? 'Update & Publish' : 'Publish'}
      </Button>
    </div>
  );
};

export default ActionButtons;
