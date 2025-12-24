import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Receipt, Download, Loader2, FileSpreadsheet, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface TaxReportExportProps {
  organizationId: string;
}

interface TaxSummary {
  taxName: string;
  jurisdiction: string;
  totalCollected: number;
  bookingCount: number;
}

interface BookingTaxDetail {
  reservationId: string;
  propertyName: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  taxName: string;
  taxRate: number;
  taxAmount: number;
  bookingTotal: number;
}

export const TaxReportExport: React.FC<TaxReportExportProps> = ({ organizationId }) => {
  const [startDate, setStartDate] = useState(() => format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(() => format(endOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'));
  const [selectedProperty, setSelectedProperty] = useState<string>('all');

  // Fetch properties for filter
  const { data: properties = [] } = useQuery({
    queryKey: ['org-properties', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title')
        .eq('organization_id', organizationId);
      if (error) throw error;
      return data as { id: string; title: string }[];
    },
  });

  // Fetch tax data
  const { data: taxData, isLoading } = useQuery({
    queryKey: ['tax-report', organizationId, startDate, endDate, selectedProperty],
    queryFn: async () => {
      // Fetch reservations with their charges
      let query = supabase
        .from('reservations')
        .select(`
          id,
          check_in_date,
          check_out_date,
          total_amount,
          guest_name,
          properties!inner (
            id,
            name,
            organization_id
          ),
          booking_charges (
            id,
            charge_name,
            charge_type,
            amount,
            tax_rate_id,
            tax_rates (
              id,
              tax_name,
              tax_rate,
              jurisdiction
            )
          )
        `)
        .eq('properties.organization_id', organizationId)
        .gte('check_in_date', startDate)
        .lte('check_in_date', endDate)
        .eq('status', 'confirmed');

      if (selectedProperty !== 'all') {
        query = query.eq('property_id', selectedProperty);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Process data for summary and details
      const summaryMap = new Map<string, TaxSummary>();
      const details: BookingTaxDetail[] = [];

      (data || []).forEach((reservation: any) => {
        const taxCharges = (reservation.booking_charges || []).filter(
          (c: any) => c.charge_type === 'tax' && c.tax_rates
        );

        taxCharges.forEach((charge: any) => {
          const key = charge.tax_rates.id;
          const existing = summaryMap.get(key);
          
          if (existing) {
            existing.totalCollected += charge.amount;
            existing.bookingCount += 1;
          } else {
            summaryMap.set(key, {
              taxName: charge.tax_rates.tax_name,
              jurisdiction: charge.tax_rates.jurisdiction,
              totalCollected: charge.amount,
              bookingCount: 1,
            });
          }

          details.push({
            reservationId: reservation.id,
            propertyName: reservation.properties?.name || 'Unknown',
            guestName: reservation.guest_name || 'Guest',
            checkIn: reservation.check_in_date,
            checkOut: reservation.check_out_date,
            taxName: charge.tax_rates.tax_name,
            taxRate: charge.tax_rates.tax_rate,
            taxAmount: charge.amount,
            bookingTotal: reservation.total_amount,
          });
        });
      });

      return {
        summary: Array.from(summaryMap.values()),
        details,
        totalTaxCollected: Array.from(summaryMap.values()).reduce((sum, t) => sum + t.totalCollected, 0),
      };
    },
    enabled: !!organizationId,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const exportToCSV = () => {
    if (!taxData?.details.length) return;

    const headers = [
      'Reservation ID',
      'Property',
      'Guest Name',
      'Check-In',
      'Check-Out',
      'Tax Name',
      'Tax Rate',
      'Tax Amount',
      'Booking Total',
    ];

    const rows = taxData.details.map((d) => [
      d.reservationId,
      d.propertyName,
      d.guestName,
      d.checkIn,
      d.checkOut,
      d.taxName,
      `${(d.taxRate * 100).toFixed(2)}%`,
      d.taxAmount.toFixed(2),
      d.bookingTotal.toFixed(2),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tax-report-${startDate}-to-${endDate}.csv`;
    link.click();
  };

  const setQuickRange = (range: 'last-month' | 'this-month' | 'last-quarter' | 'ytd') => {
    const now = new Date();
    switch (range) {
      case 'last-month':
        setStartDate(format(startOfMonth(subMonths(now, 1)), 'yyyy-MM-dd'));
        setEndDate(format(endOfMonth(subMonths(now, 1)), 'yyyy-MM-dd'));
        break;
      case 'this-month':
        setStartDate(format(startOfMonth(now), 'yyyy-MM-dd'));
        setEndDate(format(endOfMonth(now), 'yyyy-MM-dd'));
        break;
      case 'last-quarter':
        setStartDate(format(startOfMonth(subMonths(now, 3)), 'yyyy-MM-dd'));
        setEndDate(format(endOfMonth(subMonths(now, 1)), 'yyyy-MM-dd'));
        break;
      case 'ytd':
        setStartDate(format(new Date(now.getFullYear(), 0, 1), 'yyyy-MM-dd'));
        setEndDate(format(now, 'yyyy-MM-dd'));
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Tax Report
          </CardTitle>
          <CardDescription>
            View and export tax collected for your bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <Button variant="outline" size="sm" onClick={() => setQuickRange('last-month')}>
              Last Month
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuickRange('this-month')}>
              This Month
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuickRange('last-quarter')}>
              Last Quarter
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuickRange('ytd')}>
              Year to Date
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Property</Label>
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
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
            <div className="flex items-end">
              <Button onClick={exportToCSV} disabled={!taxData?.details.length}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : taxData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Receipt className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Tax Collected</p>
                    <p className="text-2xl font-bold">{formatCurrency(taxData.totalTaxCollected)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <FileSpreadsheet className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tax Types</p>
                    <p className="text-2xl font-bold">{taxData.summary.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Taxable Bookings</p>
                    <p className="text-2xl font-bold">{taxData.details.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary by Tax Type */}
          {taxData.summary.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Summary by Tax Type</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tax Name</TableHead>
                      <TableHead>Jurisdiction</TableHead>
                      <TableHead className="text-right">Bookings</TableHead>
                      <TableHead className="text-right">Total Collected</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taxData.summary.map((tax, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{tax.taxName}</TableCell>
                        <TableCell>{tax.jurisdiction}</TableCell>
                        <TableCell className="text-right">{tax.bookingCount}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(tax.totalCollected)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold bg-muted/50">
                      <TableCell colSpan={3}>Total</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(taxData.totalTaxCollected)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Booking Details */}
          {taxData.details.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
                <CardDescription>
                  Individual booking tax breakdown for the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead>Guest</TableHead>
                        <TableHead>Check-In</TableHead>
                        <TableHead>Check-Out</TableHead>
                        <TableHead>Tax</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                        <TableHead className="text-right">Tax Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {taxData.details.slice(0, 50).map((detail, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{detail.propertyName}</TableCell>
                          <TableCell>{detail.guestName}</TableCell>
                          <TableCell>{format(new Date(detail.checkIn), 'MMM d, yyyy')}</TableCell>
                          <TableCell>{format(new Date(detail.checkOut), 'MMM d, yyyy')}</TableCell>
                          <TableCell>{detail.taxName}</TableCell>
                          <TableCell className="text-right">{(detail.taxRate * 100).toFixed(2)}%</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(detail.taxAmount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {taxData.details.length > 50 && (
                    <p className="text-sm text-muted-foreground mt-4 text-center">
                      Showing first 50 of {taxData.details.length} records. Export CSV for full data.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {taxData.details.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tax data found for the selected period</p>
                <p className="text-sm">Try adjusting your date range or property filter</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
