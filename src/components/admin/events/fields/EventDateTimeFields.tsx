
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface EventDateTimeFieldsProps {
  eventDate: string;
  endDate: string;
  timeStart: string;
  timeEnd: string;
  onEventDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onTimeStartChange: (time: string) => void;
  onTimeEndChange: (time: string) => void;
}

const EventDateTimeFields = ({
  eventDate,
  endDate,
  timeStart,
  timeEnd,
  onEventDateChange,
  onEndDateChange,
  onTimeStartChange,
  onTimeEndChange
}: EventDateTimeFieldsProps) => {
  return (
    <>
      <div>
        <Label htmlFor="event_date">Start Date *</Label>
        <Input
          id="event_date"
          type="date"
          value={eventDate}
          onChange={(e) => onEventDateChange(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="end_date">End Date</Label>
        <Input
          id="end_date"
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="time_start">Start Time</Label>
        <Input
          id="time_start"
          placeholder="e.g., 7:00 PM"
          value={timeStart}
          onChange={(e) => onTimeStartChange(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="time_end">End Time</Label>
        <Input
          id="time_end"
          placeholder="e.g., 10:00 PM"
          value={timeEnd}
          onChange={(e) => onTimeEndChange(e.target.value)}
        />
      </div>
    </>
  );
};

export default EventDateTimeFields;
