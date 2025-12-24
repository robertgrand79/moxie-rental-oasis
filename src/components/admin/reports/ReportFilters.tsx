import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, startOfYear } from 'date-fns';
import { usePropertyFetch } from '@/hooks/usePropertyFetch';

interface ReportFiltersProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  propertyFilter?: string;
  onPropertyFilterChange?: (value: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (value: string) => void;
  showPropertyFilter?: boolean;
  showStatusFilter?: boolean;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  propertyFilter = 'all',
  onPropertyFilterChange,
  statusFilter = 'all',
  onStatusFilterChange,
  showPropertyFilter = true,
  showStatusFilter = false,
}) => {
  const { properties } = usePropertyFetch();

  const setQuickRange = (range: 'this-month' | 'last-month' | 'last-3-months' | 'last-6-months' | 'ytd' | 'last-year') => {
    const now = new Date();
    switch (range) {
      case 'this-month':
        onStartDateChange(format(startOfMonth(now), 'yyyy-MM-dd'));
        onEndDateChange(format(endOfMonth(now), 'yyyy-MM-dd'));
        break;
      case 'last-month':
        onStartDateChange(format(startOfMonth(subMonths(now, 1)), 'yyyy-MM-dd'));
        onEndDateChange(format(endOfMonth(subMonths(now, 1)), 'yyyy-MM-dd'));
        break;
      case 'last-3-months':
        onStartDateChange(format(startOfMonth(subMonths(now, 2)), 'yyyy-MM-dd'));
        onEndDateChange(format(endOfMonth(now), 'yyyy-MM-dd'));
        break;
      case 'last-6-months':
        onStartDateChange(format(startOfMonth(subMonths(now, 5)), 'yyyy-MM-dd'));
        onEndDateChange(format(endOfMonth(now), 'yyyy-MM-dd'));
        break;
      case 'ytd':
        onStartDateChange(format(startOfYear(now), 'yyyy-MM-dd'));
        onEndDateChange(format(now, 'yyyy-MM-dd'));
        break;
      case 'last-year':
        const lastYear = new Date(now.getFullYear() - 1, 0, 1);
        onStartDateChange(format(lastYear, 'yyyy-MM-dd'));
        onEndDateChange(format(new Date(now.getFullYear() - 1, 11, 31), 'yyyy-MM-dd'));
        break;
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {/* Quick date buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={() => setQuickRange('this-month')}>
            This Month
          </Button>
          <Button variant="outline" size="sm" onClick={() => setQuickRange('last-month')}>
            Last Month
          </Button>
          <Button variant="outline" size="sm" onClick={() => setQuickRange('last-3-months')}>
            Last 3 Months
          </Button>
          <Button variant="outline" size="sm" onClick={() => setQuickRange('last-6-months')}>
            Last 6 Months
          </Button>
          <Button variant="outline" size="sm" onClick={() => setQuickRange('ytd')}>
            Year to Date
          </Button>
          <Button variant="outline" size="sm" onClick={() => setQuickRange('last-year')}>
            Last Year
          </Button>
        </div>

        {/* Filter inputs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>End Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {showPropertyFilter && onPropertyFilterChange && (
            <div className="space-y-2">
              <Label>Property</Label>
              <Select value={propertyFilter} onValueChange={onPropertyFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Properties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {properties.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showStatusFilter && onStatusFilterChange && (
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
