import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { usePropertyFetch } from '@/hooks/usePropertyFetch';
import { startOfMonth, endOfMonth, differenceInDays, format, parseISO, subMonths } from 'date-fns';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface BookingSummary {
  totalBookings: number;
  totalNights: number;
  occupancyRate: number;
  averageNightlyRate: number;
  totalRevenue: number;
  confirmedBookings: number;
  cancelledBookings: number;
  pendingBookings: number;
}

export interface BookingDetail {
  id: string;
  confirmationNumber: string;
  propertyName: string;
  propertyId: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  status: string;
  total: number;
  createdAt: string;
}

export interface RevenueSummary {
  grossRevenue: number;
  nightlyRevenue: number;
  cleaningFees: number;
  otherFees: number;
  refunds: number;
  taxesCollected: number;
  netRevenue: number;
}

export interface RevenueByProperty {
  propertyId: string;
  propertyName: string;
  revenue: number;
  bookings: number;
  nights: number;
  averageNightly: number;
}

export interface RevenueByMonth {
  month: string;
  revenue: number;
  bookings: number;
  previousPeriodRevenue?: number;
}

export interface OccupancyMetrics {
  occupancyRate: number;
  averageLengthOfStay: number;
  averageLeadTime: number;
  bookedNights: number;
  availableNights: number;
}

export interface OccupancyByProperty {
  propertyId: string;
  propertyName: string;
  occupancyRate: number;
  bookedNights: number;
  availableNights: number;
}

export interface GuestSummary {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalBookings: number;
  totalSpent: number;
  lastBooking: string;
  isRepeat: boolean;
}

export const useBookingReport = (dateRange: DateRange, propertyFilter: string = 'all', statusFilter: string = 'all') => {
  const { properties } = usePropertyFetch();
  const propertyIds = properties.map(p => p.id);

  return useQuery({
    queryKey: ['booking-report', dateRange, propertyFilter, statusFilter, propertyIds],
    queryFn: async (): Promise<{ summary: BookingSummary; details: BookingDetail[] }> => {
      if (propertyIds.length === 0) {
        return {
          summary: {
            totalBookings: 0,
            totalNights: 0,
            occupancyRate: 0,
            averageNightlyRate: 0,
            totalRevenue: 0,
            confirmedBookings: 0,
            cancelledBookings: 0,
            pendingBookings: 0,
          },
          details: [],
        };
      }

      let query = supabase
        .from('property_reservations')
        .select(`
          id,
          confirmation_number,
          property_id,
          guest_name,
          guest_email,
          check_in_date,
          check_out_date,
          booking_status,
          total_amount,
          created_at,
          properties:properties!inner(title)
        `)
        .in('property_id', propertyIds)
        .gte('check_in_date', dateRange.startDate)
        .lte('check_in_date', dateRange.endDate);

      if (propertyFilter !== 'all') {
        query = query.eq('property_id', propertyFilter);
      }

      if (statusFilter !== 'all') {
        query = query.eq('booking_status', statusFilter);
      }

      const { data, error } = await query.order('check_in_date', { ascending: false });

      if (error) throw error;

      const bookings = (data || []) as any[];
      
      // Calculate summary
      const confirmed = bookings.filter(b => b.booking_status === 'confirmed');
      const cancelled = bookings.filter(b => b.booking_status === 'cancelled');
      const pending = bookings.filter(b => b.booking_status === 'pending');

      let totalNights = 0;
      let totalRevenue = 0;

      const details: BookingDetail[] = bookings.map((b) => {
        const nights = differenceInDays(parseISO(b.check_out_date), parseISO(b.check_in_date));
        if (b.booking_status === 'confirmed') {
          totalNights += nights;
          totalRevenue += b.total_amount || 0;
        }
        return {
          id: b.id,
          confirmationNumber: b.confirmation_number || b.id.slice(0, 8).toUpperCase(),
          propertyName: b.properties?.title || 'Unknown',
          propertyId: b.property_id,
          guestName: b.guest_name || 'Guest',
          guestEmail: b.guest_email || '',
          checkIn: b.check_in_date,
          checkOut: b.check_out_date,
          nights,
          status: b.booking_status,
          total: b.total_amount || 0,
          createdAt: b.created_at,
        };
      });

      // Calculate available nights in period
      const periodDays = differenceInDays(parseISO(dateRange.endDate), parseISO(dateRange.startDate)) + 1;
      const totalAvailableNights = periodDays * propertyIds.length;
      const occupancyRate = totalAvailableNights > 0 ? (totalNights / totalAvailableNights) * 100 : 0;
      const averageNightlyRate = totalNights > 0 ? totalRevenue / totalNights : 0;

      return {
        summary: {
          totalBookings: bookings.length,
          totalNights,
          occupancyRate,
          averageNightlyRate,
          totalRevenue,
          confirmedBookings: confirmed.length,
          cancelledBookings: cancelled.length,
          pendingBookings: pending.length,
        },
        details,
      };
    },
    enabled: propertyIds.length > 0,
  });
};

export const useRevenueReport = (dateRange: DateRange, propertyFilter: string = 'all') => {
  const { properties } = usePropertyFetch();
  const propertyIds = properties.map(p => p.id);

  return useQuery({
    queryKey: ['revenue-report', dateRange, propertyFilter, propertyIds],
    queryFn: async (): Promise<{
      summary: RevenueSummary;
      byProperty: RevenueByProperty[];
      byMonth: RevenueByMonth[];
    }> => {
      if (propertyIds.length === 0) {
        return {
          summary: {
            grossRevenue: 0,
            nightlyRevenue: 0,
            cleaningFees: 0,
            otherFees: 0,
            refunds: 0,
            taxesCollected: 0,
            netRevenue: 0,
          },
          byProperty: [],
          byMonth: [],
        };
      }

      const filterIds = propertyFilter !== 'all' ? [propertyFilter] : propertyIds;

      // Fetch reservations
      const { data: reservations, error } = await supabase
        .from('property_reservations')
        .select(`
          id,
          property_id,
          check_in_date,
          check_out_date,
          total_amount,
          booking_status,
          created_at,
          properties:properties!inner(title)
        `)
        .in('property_id', filterIds)
        .gte('check_in_date', dateRange.startDate)
        .lte('check_in_date', dateRange.endDate)
        .eq('booking_status', 'confirmed');

      if (error) throw error;

      const bookings = (reservations || []) as any[];

      // Fetch charges for these reservations
      const reservationIds = bookings.map(b => b.id);
      let charges: any[] = [];
      
      if (reservationIds.length > 0) {
        const { data: chargesData } = await supabase
          .from('booking_charges')
          .select('*')
          .in('reservation_id', reservationIds);
        charges = chargesData || [];
      }

      // Calculate summary
      let nightlyRevenue = 0;
      let cleaningFees = 0;
      let otherFees = 0;
      let taxesCollected = 0;

      charges.forEach((c) => {
        if (c.charge_type === 'nightly') nightlyRevenue += c.amount || 0;
        else if (c.charge_type === 'cleaning') cleaningFees += c.amount || 0;
        else if (c.charge_type === 'tax') taxesCollected += c.amount || 0;
        else otherFees += c.amount || 0;
      });

      const grossRevenue = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
      const netRevenue = grossRevenue - taxesCollected;

      // Revenue by property
      const propertyMap = new Map<string, RevenueByProperty>();
      bookings.forEach((b) => {
        const nights = differenceInDays(parseISO(b.check_out_date), parseISO(b.check_in_date));
        const existing = propertyMap.get(b.property_id);
        if (existing) {
          existing.revenue += b.total_amount || 0;
          existing.bookings += 1;
          existing.nights += nights;
        } else {
          propertyMap.set(b.property_id, {
            propertyId: b.property_id,
            propertyName: b.properties?.title || 'Unknown',
            revenue: b.total_amount || 0,
            bookings: 1,
            nights,
            averageNightly: 0,
          });
        }
      });

      const byProperty = Array.from(propertyMap.values()).map((p) => ({
        ...p,
        averageNightly: p.nights > 0 ? p.revenue / p.nights : 0,
      })).sort((a, b) => b.revenue - a.revenue);

      // Revenue by month
      const monthMap = new Map<string, RevenueByMonth>();
      bookings.forEach((b) => {
        const month = format(parseISO(b.check_in_date), 'yyyy-MM');
        const existing = monthMap.get(month);
        if (existing) {
          existing.revenue += b.total_amount || 0;
          existing.bookings += 1;
        } else {
          monthMap.set(month, {
            month,
            revenue: b.total_amount || 0,
            bookings: 1,
          });
        }
      });

      const byMonth = Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month));

      return {
        summary: {
          grossRevenue,
          nightlyRevenue: nightlyRevenue || grossRevenue,
          cleaningFees,
          otherFees,
          refunds: 0,
          taxesCollected,
          netRevenue,
        },
        byProperty,
        byMonth,
      };
    },
    enabled: propertyIds.length > 0,
  });
};

export const useOccupancyReport = (dateRange: DateRange, propertyFilter: string = 'all') => {
  const { properties } = usePropertyFetch();
  const propertyIds = properties.map(p => p.id);

  return useQuery({
    queryKey: ['occupancy-report', dateRange, propertyFilter, propertyIds],
    queryFn: async (): Promise<{
      metrics: OccupancyMetrics;
      byProperty: OccupancyByProperty[];
    }> => {
      if (propertyIds.length === 0) {
        return {
          metrics: {
            occupancyRate: 0,
            averageLengthOfStay: 0,
            averageLeadTime: 0,
            bookedNights: 0,
            availableNights: 0,
          },
          byProperty: [],
        };
      }

      const filterIds = propertyFilter !== 'all' ? [propertyFilter] : propertyIds;

      const { data: reservations, error } = await supabase
        .from('property_reservations')
        .select(`
          id,
          property_id,
          check_in_date,
          check_out_date,
          created_at,
          properties:properties!inner(title)
        `)
        .in('property_id', filterIds)
        .gte('check_in_date', dateRange.startDate)
        .lte('check_in_date', dateRange.endDate)
        .eq('booking_status', 'confirmed');

      if (error) throw error;

      const bookings = (reservations || []) as any[];
      const periodDays = differenceInDays(parseISO(dateRange.endDate), parseISO(dateRange.startDate)) + 1;

      // Calculate metrics
      let totalNights = 0;
      let totalLeadTime = 0;

      const propertyNights = new Map<string, { booked: number; name: string }>();

      bookings.forEach((b) => {
        const nights = differenceInDays(parseISO(b.check_out_date), parseISO(b.check_in_date));
        const leadTime = differenceInDays(parseISO(b.check_in_date), parseISO(b.created_at));
        
        totalNights += nights;
        totalLeadTime += Math.max(0, leadTime);

        const existing = propertyNights.get(b.property_id);
        if (existing) {
          existing.booked += nights;
        } else {
          propertyNights.set(b.property_id, {
            booked: nights,
            name: b.properties?.title || 'Unknown',
          });
        }
      });

      const totalAvailableNights = periodDays * filterIds.length;
      const occupancyRate = totalAvailableNights > 0 ? (totalNights / totalAvailableNights) * 100 : 0;
      const averageLengthOfStay = bookings.length > 0 ? totalNights / bookings.length : 0;
      const averageLeadTime = bookings.length > 0 ? totalLeadTime / bookings.length : 0;

      // By property
      const byProperty: OccupancyByProperty[] = filterIds.map((pid) => {
        const data = propertyNights.get(pid);
        const prop = properties.find(p => p.id === pid);
        const availableNights = periodDays;
        const bookedNights = data?.booked || 0;
        
        return {
          propertyId: pid,
          propertyName: data?.name || prop?.title || 'Unknown',
          occupancyRate: availableNights > 0 ? (bookedNights / availableNights) * 100 : 0,
          bookedNights,
          availableNights,
        };
      }).sort((a, b) => b.occupancyRate - a.occupancyRate);

      return {
        metrics: {
          occupancyRate,
          averageLengthOfStay,
          averageLeadTime,
          bookedNights: totalNights,
          availableNights: totalAvailableNights,
        },
        byProperty,
      };
    },
    enabled: propertyIds.length > 0,
  });
};

export const useGuestReport = (dateRange: DateRange) => {
  const { properties } = usePropertyFetch();
  const propertyIds = properties.map(p => p.id);

  return useQuery({
    queryKey: ['guest-report', dateRange, propertyIds],
    queryFn: async (): Promise<{ guests: GuestSummary[]; totalGuests: number; repeatGuests: number }> => {
      if (propertyIds.length === 0) {
        return { guests: [], totalGuests: 0, repeatGuests: 0 };
      }

      const { data, error } = await supabase
        .from('property_reservations')
        .select('guest_name, guest_email, guest_phone, total_amount, check_in_date')
        .in('property_id', propertyIds)
        .gte('check_in_date', dateRange.startDate)
        .lte('check_in_date', dateRange.endDate)
        .eq('booking_status', 'confirmed');

      if (error) throw error;

      const bookings = (data || []) as any[];
      const guestMap = new Map<string, GuestSummary>();

      bookings.forEach((b) => {
        const email = (b.guest_email || '').toLowerCase().trim();
        if (!email) return;

        const existing = guestMap.get(email);
        if (existing) {
          existing.totalBookings += 1;
          existing.totalSpent += b.total_amount || 0;
          if (b.check_in_date > existing.lastBooking) {
            existing.lastBooking = b.check_in_date;
          }
          existing.isRepeat = true;
        } else {
          guestMap.set(email, {
            id: email,
            name: b.guest_name || 'Guest',
            email,
            phone: b.guest_phone,
            totalBookings: 1,
            totalSpent: b.total_amount || 0,
            lastBooking: b.check_in_date,
            isRepeat: false,
          });
        }
      });

      const guests = Array.from(guestMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
      const repeatGuests = guests.filter(g => g.isRepeat).length;

      return {
        guests,
        totalGuests: guests.length,
        repeatGuests,
      };
    },
    enabled: propertyIds.length > 0,
  });
};

// Export utility
export const exportToCSV = (data: any[], filename: string, headers: string[]) => {
  const rows = data.map((row) =>
    headers.map((h) => {
      const val = row[h] ?? '';
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
};
