
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { PropertyFormData } from './types';
import BasicInfoFields from './BasicInfoFields';
import PropertySpecsFields from './PropertySpecsFields';
import AmenitiesField from './AmenitiesField';

interface PropertyDetailsFormProps {
  form: UseFormReturn<PropertyFormData>;
}

const PropertyDetailsForm = ({ form }: PropertyDetailsFormProps) => {
  return (
    <>
      <BasicInfoFields form={form} />
      <PropertySpecsFields form={form} />
      <AmenitiesField form={form} />
    </>
  );
};

export default PropertyDetailsForm;
