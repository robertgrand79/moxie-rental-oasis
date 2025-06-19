
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { UseFormReturn } from 'react-hook-form';

interface BlogFormData {
  title: string;
  excerpt: string;
  content: string;
  tags: string;
  status: 'draft' | 'published';
  author: string;
  published_at: Date | null;
  image_credit: string;
}

interface BasicInfoSectionProps {
  form: UseFormReturn<BlogFormData>;
}

const BasicInfoSection = ({ form }: BasicInfoSectionProps) => {
  const { register, formState: { errors }, setValue, watch } = form;
  const watchedAuthor = watch('author');
  const watchedPublishedAt = watch('published_at');
  
  const predefinedAuthors = ['Moxie Team', 'Robert', 'Shelly', 'Robert & Shelly'];

  const handleAuthorChange = (value: string) => {
    console.log('Author changed to:', value);
    setValue('author', value, { shouldDirty: true, shouldTouch: true });
  };

  const handleDateSelect = (date: Date | undefined) => {
    setValue('published_at', date || null);
  };

  return (
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
        <Select value={watchedAuthor || 'Moxie Team'} onValueChange={handleAuthorChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select author" />
          </SelectTrigger>
          <SelectContent>
            {predefinedAuthors.map((author) => (
              <SelectItem key={author} value={author}>
                {author}
              </SelectItem>
            ))}
            <SelectItem value="custom">Custom Author...</SelectItem>
          </SelectContent>
        </Select>
        {watchedAuthor === 'custom' && (
          <Input
            className="mt-2"
            placeholder="Enter custom author name"
            value=""
            onChange={(e) => handleAuthorChange(e.target.value)}
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
  );
};

export default BasicInfoSection;
