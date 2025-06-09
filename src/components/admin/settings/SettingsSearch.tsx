
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SettingsSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SettingsSearch = ({ searchQuery, setSearchQuery }: SettingsSearchProps) => {
  return (
    <div className="max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search settings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
};

export default SettingsSearch;
