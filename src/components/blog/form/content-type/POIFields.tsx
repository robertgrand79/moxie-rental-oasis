
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CONTENT_TYPE_CATEGORIES } from '@/types/blogPost';
import { ExtendedBlogFormData } from '@/hooks/useBlogForm';

interface POIFieldsProps {
  form: UseFormReturn<ExtendedBlogFormData>;
}

const POIFields = ({ form }: POIFieldsProps) => {
  const { register, setValue, watch, formState: { errors } } = form;
  const watchedValues = watch();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📍 Point of Interest Details
        </CardTitle>
        <CardDescription>
          Location and business information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">POI Category</Label>
            <Select value={watchedValues.category} onValueChange={(value) => setValue('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CONTENT_TYPE_CATEGORIES.poi.map((cat) => (
                  <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="location">Location Name *</Label>
            <Input {...register('location', { required: 'Location name is required' })} />
            {errors.location && <p className="text-sm text-red-500">{errors.location.message}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="address">Full Address *</Label>
          <Textarea {...register('address', { required: 'Address is required for POI' })} />
          {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              type="number"
              step="any"
              {...register('latitude', { valueAsNumber: true })}
              placeholder="44.0521"
            />
          </div>
          
          <div>
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              type="number"
              step="any"
              {...register('longitude', { valueAsNumber: true })}
              placeholder="-123.0868"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input {...register('phone')} placeholder="(541) 555-0123" />
          </div>
          
          <div>
            <Label htmlFor="website_url">Website URL</Label>
            <Input {...register('website_url')} placeholder="https://..." />
          </div>
        </div>

        <div>
          <Label htmlFor="rating">Rating (1-5)</Label>
          <Input
            type="number"
            min="1"
            max="5"
            step="0.1"
            {...register('rating', { valueAsNumber: true })}
            placeholder="4.5"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_featured"
            checked={watchedValues.is_featured}
            onCheckedChange={(checked) => setValue('is_featured', checked as boolean)}
          />
          <Label htmlFor="is_featured">Featured POI</Label>
        </div>
      </CardContent>
    </Card>
  );
};

export default POIFields;
