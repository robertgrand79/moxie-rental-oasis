import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, CalendarDays, Clock, TrendingUp, Home, Loader2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ReportFilters } from './ReportFilters';
import { useOccupancyReport, exportToCSV } from '@/hooks/useReportingData';

export const OccupancyReports: React.FC = () => {
  const [startDate, setStartDate] = useState(() => format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(() => format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [propertyFilter, setPropertyFilter] = useState('all');

  const { data, isLoading } = useOccupancyReport({ startDate, endDate }, propertyFilter);

  const handleExport = () => {
    if (!data?.byProperty.length) return;
    
    const exportData = data.byProperty.map((p) => ({
      Property: p.propertyName,
      'Occupancy Rate': `${p.occupancyRate.toFixed(1)}%`,
      'Booked Nights': p.bookedNights,
      'Available Nights': p.availableNights,
    }));

    exportToCSV(
      exportData,
      'occupancy-report',
      ['Property', 'Occupancy Rate', 'Booked Nights', 'Available Nights']
    );
  };

  const getOccupancyColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getOccupancyBg = (rate: number) => {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <ReportFilters
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        propertyFilter={propertyFilter}
        onPropertyFilterChange={setPropertyFilter}
        showPropertyFilter
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : data && (
        <>
          {/* Summary Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${getOccupancyColor(data.metrics.occupancyRate)}`}>
                      {data.metrics.occupancyRate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Occupancy Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-violet-500/10 flex items-center justify-center">
                    <CalendarDays className="h-5 w-5 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{data.metrics.averageLengthOfStay.toFixed(1)}</p>
                    <p className="text-sm text-muted-foreground">Avg Stay (nights)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{data.metrics.averageLeadTime.toFixed(0)}</p>
                    <p className="text-sm text-muted-foreground">Avg Lead Time (days)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Home className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {data.metrics.bookedNights}/{data.metrics.availableNights}
                    </p>
                    <p className="text-sm text-muted-foreground">Nights Booked</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Overall Occupancy Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Occupancy</CardTitle>
              <CardDescription>
                {data.metrics.bookedNights} of {data.metrics.availableNights} nights booked
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Booked</span>
                  <span className="font-medium">{data.metrics.occupancyRate.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={data.metrics.occupancyRate} 
                  className="h-4"
                />
              </div>
            </CardContent>
          </Card>

          {/* Occupancy by Property */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Occupancy by Property</CardTitle>
                <CardDescription>Compare performance across properties</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              {data.byProperty.length > 0 ? (
                <div className="space-y-4">
                  {data.byProperty.map((prop) => (
                    <div key={prop.propertyId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate max-w-[60%]">{prop.propertyName}</span>
                        <span className={`font-bold ${getOccupancyColor(prop.occupancyRate)}`}>
                          {prop.occupancyRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Progress 
                          value={prop.occupancyRate} 
                          className="h-2 flex-1"
                        />
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {prop.bookedNights}/{prop.availableNights} nights
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No occupancy data for the selected period</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detailed Table */}
          {data.byProperty.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Detailed Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead className="text-right">Booked</TableHead>
                      <TableHead className="text-right">Available</TableHead>
                      <TableHead className="text-right">Occupancy</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.byProperty.map((prop) => (
                      <TableRow key={prop.propertyId}>
                        <TableCell className="font-medium">{prop.propertyName}</TableCell>
                        <TableCell className="text-right">{prop.bookedNights} nights</TableCell>
                        <TableCell className="text-right">{prop.availableNights} nights</TableCell>
                        <TableCell className={`text-right font-bold ${getOccupancyColor(prop.occupancyRate)}`}>
                          {prop.occupancyRate.toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
