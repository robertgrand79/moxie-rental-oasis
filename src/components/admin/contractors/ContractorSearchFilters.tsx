
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ContractorSearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  specialtyFilter: string;
  onSpecialtyFilterChange: (specialty: string) => void;
}

const ContractorSearchFilters = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  specialtyFilter,
  onSpecialtyFilterChange,
}: ContractorSearchFiltersProps) => {
  return (
    <div className="flex flex-1 gap-4 w-full lg:w-auto">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search contractors..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Status Filter */}
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>

      {/* Specialty Filter */}
      <Select value={specialtyFilter} onValueChange={onSpecialtyFilterChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All Specialties" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Specialties</SelectItem>
          <SelectItem value="plumbing">Plumbing</SelectItem>
          <SelectItem value="electrical">Electrical</SelectItem>
          <SelectItem value="hvac">HVAC</SelectItem>
          <SelectItem value="painting">Painting</SelectItem>
          <SelectItem value="flooring">Flooring</SelectItem>
          <SelectItem value="roofing">Roofing</SelectItem>
          <SelectItem value="landscaping">Landscaping</SelectItem>
          <SelectItem value="cleaning">Cleaning</SelectItem>
          <SelectItem value="maintenance">General Maintenance</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ContractorSearchFilters;
