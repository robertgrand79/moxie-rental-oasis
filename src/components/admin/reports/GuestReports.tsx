import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Users, UserCheck, DollarSign, Loader2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ReportFilters } from './ReportFilters';
import { useGuestReport, exportToCSV } from '@/hooks/useReportingData';

export const GuestReports: React.FC = () => {
  const [startDate, setStartDate] = useState(() => format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(() => format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  const { data, isLoading } = useGuestReport({ startDate, endDate });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleExport = () => {
    if (!data?.guests.length) return;
    
    const exportData = data.guests.map((g) => ({
      Name: g.name,
      Email: g.email,
      Phone: g.phone || '',
      Bookings: g.totalBookings,
      'Total Spent': g.totalSpent,
      'Last Booking': g.lastBooking,
      'Repeat Guest': g.isRepeat ? 'Yes' : 'No',
    }));

    exportToCSV(
      exportData,
      'guest-report',
      ['Name', 'Email', 'Phone', 'Bookings', 'Total Spent', 'Last Booking', 'Repeat Guest']
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <ReportFilters
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        showPropertyFilter={false}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{data.totalGuests}</p>
                    <p className="text-sm text-muted-foreground">Total Guests</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{data.repeatGuests}</p>
                    <p className="text-sm text-muted-foreground">Repeat Guests</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-violet-500/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {data.totalGuests > 0 
                        ? formatCurrency(data.guests.reduce((sum, g) => sum + g.totalSpent, 0) / data.totalGuests)
                        : '$0'}
                    </p>
                    <p className="text-sm text-muted-foreground">Avg Spend/Guest</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Guest List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Guest Directory</CardTitle>
                <CardDescription>
                  {data.guests.length} guests with bookings in selected period
                </CardDescription>
              </div>
              <Button onClick={handleExport} disabled={!data.guests.length}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              {data.guests.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Guest</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead className="text-right">Bookings</TableHead>
                        <TableHead className="text-right">Total Spent</TableHead>
                        <TableHead>Last Booking</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.guests.slice(0, 100).map((guest) => (
                        <TableRow key={guest.id}>
                          <TableCell className="font-medium">{guest.name}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{guest.email}</p>
                              {guest.phone && (
                                <p className="text-muted-foreground">{guest.phone}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{guest.totalBookings}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(guest.totalSpent)}
                          </TableCell>
                          <TableCell>
                            {format(new Date(guest.lastBooking), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            {guest.isRepeat ? (
                              <Badge variant="default" className="bg-emerald-500">
                                Repeat
                              </Badge>
                            ) : (
                              <Badge variant="secondary">New</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {data.guests.length > 100 && (
                    <p className="text-sm text-muted-foreground text-center mt-4">
                      Showing first 100 of {data.guests.length} guests. Export to see all.
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No guests found for the selected period</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
