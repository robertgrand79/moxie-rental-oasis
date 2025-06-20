
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  SortAsc, 
  Grid3X3, 
  Table,
  Download,
  RefreshCw,
  Users,
  UserCheck,
  UserX
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ModernContractorsHeaderProps {
  totalContractors: number;
  activeContractors: number;
  inactiveContractors: number;
  topSpecialties: Array<{ specialty: string; count: number }>;
  onCreateContractor: () => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  specialtyFilter: string;
  onSpecialtyFilterChange: (specialty: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  onRefresh: () => void;
}

const ModernContractorsHeader = ({
  totalContractors,
  activeContractors,
  inactiveContractors,
  topSpecialties,
  onCreateContractor,
  statusFilter,
  onStatusFilterChange,
  specialtyFilter,
  onSpecialtyFilterChange,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onRefresh,
}: ModernContractorsHeaderProps) => {
  return (
    <div className="space-y-6">
      {/* Title and Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contractors</h1>
          <p className="text-gray-600 mt-1">Manage your contractor network</p>
        </div>
        <Button onClick={onCreateContractor} size="lg" className="shadow-lg">
          <Plus className="h-5 w-5 mr-2" />
          Add Contractor
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{totalContractors}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{activeContractors}</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-red-600">{inactiveContractors}</p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <UserX className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Top Specialty</p>
              <p className="text-lg font-bold text-purple-600">
                {topSpecialties[0]?.specialty || 'N/A'}
              </p>
              <p className="text-xs text-gray-500">
                {topSpecialties[0]?.count || 0} contractors
              </p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Badge className="bg-purple-100 text-purple-800 border-0">★</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl p-4 border shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
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

            {/* Filters */}
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

          {/* View Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('table')}
              >
                <Table className="h-4 w-4" />
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <SortAsc className="h-4 w-4 mr-2" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={onRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Export to CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernContractorsHeader;
