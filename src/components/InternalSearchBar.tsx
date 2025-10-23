import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Calendar, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const InternalSearchBar = () => {
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const [guests, setGuests] = useState('1');
  const navigate = useNavigate();

  const isInvalid = !checkin || !checkout || checkout <= checkin;

  const handleSearch = () => {
    if (!checkin || !checkout) {
      toast.error('Please select both check-in and check-out dates');
      return;
    }
    if (checkout <= checkin) {
      toast.error('Check-out must be after check-in');
      return;
    }

    const params = new URLSearchParams();
    if (checkin) params.set('checkin', checkin);
    if (checkout) params.set('checkout', checkout);
    if (guests) params.set('guests', guests);
    
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="text-center mb-4 sm:mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Find Your Perfect Stay</h3>
        <p className="text-gray-600 text-sm sm:text-base">Search and book your ideal vacation rental</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Check-in
          </label>
          <input 
            type="date"
            value={checkin}
            onChange={(e) => setCheckin(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Check-out
          </label>
          <input 
            type="date"
            value={checkout}
            onChange={(e) => setCheckout(e.target.value)}
            min={checkin || new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Guests
          </label>
          <select 
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          >
            <option value="1">1 Guest</option>
            <option value="2">2 Guests</option>
            <option value="3">3 Guests</option>
            <option value="4">4 Guests</option>
            <option value="5">5 Guests</option>
            <option value="6">6+ Guests</option>
          </select>
        </div>
      </div>
      <div className="mt-4 sm:mt-6 text-center">
        <Button size="lg" onClick={handleSearch} disabled={isInvalid} className="px-6 sm:px-8 w-full sm:w-auto">
          <Search className="h-4 w-4 mr-2" />
          Search Properties
        </Button>
      </div>
    </div>
  );
};

export default InternalSearchBar;