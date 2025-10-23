import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Search, Users } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const MainSearchBar = () => {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState<string>('2');
  const [location, setLocation] = useState<string>('all');

  const handleSearch = () => {
    if (!checkIn || !checkOut) {
      return;
    }

    const params = new URLSearchParams({
      checkin: format(checkIn, 'yyyy-MM-dd'),
      checkout: format(checkOut, 'yyyy-MM-dd'),
      guests: guests,
    });

    if (location !== 'all') {
      params.append('location', location);
    }

    navigate(`/search-results?${params.toString()}`);
  };

  return (
    <Card className="p-6 shadow-xl bg-card/95 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        {/* Location */}
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">Location</label>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="Eugene">Eugene</SelectItem>
              <SelectItem value="Springfield">Springfield</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Check-in Date */}
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">Check-in</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !checkIn && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkIn ? format(checkIn, 'PPP') : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={checkIn}
                onSelect={setCheckIn}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Check-out Date */}
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">Check-out</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !checkOut && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkOut ? format(checkOut, 'PPP') : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={setCheckOut}
                disabled={(date) => 
                  date < new Date(new Date().setHours(0, 0, 0, 0)) || 
                  (checkIn ? date <= checkIn : false)
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Guests */}
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">Guests</label>
          <Select value={guests} onValueChange={setGuests}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {num} {num === 1 ? 'Guest' : 'Guests'}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search Button */}
        <Button 
          onClick={handleSearch}
          size="lg"
          disabled={!checkIn || !checkOut}
          className="md:min-w-[120px]"
        >
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>
    </Card>
  );
};

export default MainSearchBar;
