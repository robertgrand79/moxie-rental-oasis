import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, DollarSign, TrendingUp, Home, Loader2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ReportFilters } from './ReportFilters';
import { useRevenueReport, exportToCSV } from '@/hooks/useReportingData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const RevenueReports: React.FC = () => {
  const [startDate, setStartDate] = useState(() => format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(() => format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [propertyFilter, setPropertyFilter] = useState('all');

  const { data, isLoading } = useRevenueReport({ startDate, endDate }, propertyFilter);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleExportByProperty = () => {
    if (!data?.byProperty.length) return;
    
    const exportData = data.byProperty.map((p) => ({
      Property: p.propertyName,
      Bookings: p.bookings,
      Nights: p.nights,
      Revenue: p.revenue,
      'Avg Nightly': p.averageNightly,
    }));

    exportToCSV(
      exportData,
      'revenue-by-property',
      ['Property', 'Bookings', 'Nights', 'Revenue', 'Avg Nightly']
    );
  };

  const handleExportByMonth = () => {
    if (!data?.byMonth.length) return;
    
    const exportData = data.byMonth.map((m) => ({
      Month: format(new Date(m.month + '-01'), 'MMMM yyyy'),
      Bookings: m.bookings,
      Revenue: m.revenue,
    }));

    exportToCSV(
      exportData,
      'revenue-by-month',
      ['Month', 'Bookings', 'Revenue']
    );
  };

  const chartData = data?.byMonth.map((m) => ({
    month: format(new Date(m.month + '-01'), 'MMM'),
    revenue: m.revenue,
    bookings: m.bookings,
  })) || [];

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
          {/* Revenue Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Revenue Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Gross Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(data.summary.grossRevenue)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Nightly Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(data.summary.nightlyRevenue)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Cleaning Fees</p>
                  <p className="text-2xl font-bold">{formatCurrency(data.summary.cleaningFees)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Other Fees</p>
                  <p className="text-2xl font-bold">{formatCurrency(data.summary.otherFees)}</p>
                </div>
              </div>

              <div className="border-t mt-6 pt-6 grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Taxes Collected</p>
                  <p className="text-xl font-semibold text-muted-foreground">
                    -{formatCurrency(data.summary.taxesCollected)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Refunds</p>
                  <p className="text-xl font-semibold text-muted-foreground">
                    -{formatCurrency(data.summary.refunds)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Net Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(data.summary.netRevenue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue by Month Chart */}
          {chartData.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Monthly revenue over selected period</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportByMonth}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis 
                        tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                        className="text-xs"
                      />
                      <Tooltip
                        formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                        labelFormatter={(label) => `Month: ${label}`}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar 
                        dataKey="revenue" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Revenue by Property */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Revenue by Property
                </CardTitle>
                <CardDescription>Performance comparison across properties</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportByProperty}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              {data.byProperty.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead className="text-right">Bookings</TableHead>
                      <TableHead className="text-right">Nights</TableHead>
                      <TableHead className="text-right">Avg/Night</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.byProperty.map((prop) => (
                      <TableRow key={prop.propertyId}>
                        <TableCell className="font-medium">{prop.propertyName}</TableCell>
                        <TableCell className="text-right">{prop.bookings}</TableCell>
                        <TableCell className="text-right">{prop.nights}</TableCell>
                        <TableCell className="text-right">{formatCurrency(prop.averageNightly)}</TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(prop.revenue)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell>Total</TableCell>
                      <TableCell className="text-right">
                        {data.byProperty.reduce((sum, p) => sum + p.bookings, 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        {data.byProperty.reduce((sum, p) => sum + p.nights, 0)}
                      </TableCell>
                      <TableCell className="text-right">—</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(data.byProperty.reduce((sum, p) => sum + p.revenue, 0))}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No revenue data for the selected period</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
