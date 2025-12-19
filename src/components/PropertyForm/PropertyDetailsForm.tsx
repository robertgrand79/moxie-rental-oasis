
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import BasicInfoFields from './BasicInfoFields';
import PropertySpecsFields from './PropertySpecsFields';
import AmenitiesField from './AmenitiesField';
import LocationCoordinatesField from './LocationCoordinatesField';
import { PropertyFormData } from './types';

interface PropertyDetailsFormProps {
  form: UseFormReturn<PropertyFormData>;
  disabled?: boolean;
}

const PropertyDetailsForm = ({ form, disabled = false }: PropertyDetailsFormProps) => {
  return (
    <div className="space-y-6">
      <BasicInfoFields form={form} disabled={disabled} />
      <LocationCoordinatesField form={form} disabled={disabled} />
      <PropertySpecsFields form={form} disabled={disabled} />
      <AmenitiesField form={form} disabled={disabled} />
    </div>
  );
};

export default PropertyDetailsForm;
