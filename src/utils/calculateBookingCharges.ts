import { supabase } from '@/integrations/supabase/client';
import { eachDayOfInterval, format, addDays } from 'date-fns';

export interface TaxDetail {
  name: string;
  jurisdiction: string;
  rate: number;
  amount: number;
  taxRateId: string;
}

export interface DailyPriceDetail {
  date: string;
  price: number;
  source: string;
}

export interface BookingChargesBreakdown {
  accommodationSubtotal: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: TaxDetail[];
  totalBeforeTax: number;
  totalTax: number;
  grandTotal: number;
  nights: number;
  pricePerNight: number;
  dailyPrices?: DailyPriceDetail[];
}

export async function calculateBookingCharges(
  propertyId: string,
  checkInDate: string,
  checkOutDate: string
): Promise<BookingChargesBreakdown> {
  // Calculate number of nights
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  if (nights <= 0) {
    throw new Error('Check-out date must be after check-in date');
  }

  // Fetch property details (for cleaning fee, service fee, and fallback price)
  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .select('price_per_night, cleaning_fee, service_fee_percentage')
    .eq('id', propertyId)
    .single();

  if (propertyError || !property) {
    throw new Error('Property not found');
  }

  // Fetch dynamic pricing for each night of the stay
  // Note: Guest pays for check-in through the night before checkout
  const stayDates = eachDayOfInterval({ 
    start: checkIn, 
    end: addDays(checkOut, -1) // Exclude checkout date
  });

  const { data: dynamicPrices, error: pricingError } = await supabase
    .from('dynamic_pricing')
    .select('date, final_price, pricing_source')
    .eq('property_id', propertyId)
    .in('date', stayDates.map(d => format(d, 'yyyy-MM-dd')));

  if (pricingError) {
    console.error('Error fetching dynamic pricing:', pricingError);
  }

  // Create a map of date -> price
  const priceMap = new Map<string, { price: number; source: string }>();
  (dynamicPrices || []).forEach(p => {
    priceMap.set(p.date, { price: p.final_price, source: p.pricing_source });
  });

  // Calculate accommodation total using dynamic pricing with fallback to base price
  const dailyPrices: DailyPriceDetail[] = [];
  let accommodationSubtotal = 0;

  stayDates.forEach(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dynamicPrice = priceMap.get(dateStr);
    const price = dynamicPrice?.price || property.price_per_night;
    const source = dynamicPrice?.source || 'base';
    
    dailyPrices.push({ date: dateStr, price, source });
    accommodationSubtotal += price;
  });

  // Calculate average price per night for display
  const pricePerNight = Math.round(accommodationSubtotal / nights);

  const cleaningFee = property.cleaning_fee || 0;
  const serviceFee = accommodationSubtotal * ((property.service_fee_percentage || 0) / 100);
  const totalBeforeTax = accommodationSubtotal + cleaningFee + serviceFee;

  // Fetch applicable tax rates
  const { data: taxAssignments, error: taxError } = await supabase
    .from('property_tax_assignments')
    .select(`
      tax_rate_id,
      tax_rates (
        id,
        jurisdiction,
        tax_name,
        tax_rate
      )
    `)
    .eq('property_id', propertyId)
    .eq('is_active', true);

  if (taxError) {
    console.error('Error fetching tax rates:', taxError);
  }

  // Calculate taxes
  const taxes: TaxDetail[] = (taxAssignments || []).map((assignment: any) => {
    const taxRate = assignment.tax_rates;
    const taxAmount = totalBeforeTax * taxRate.tax_rate;
    
    return {
      name: taxRate.tax_name,
      jurisdiction: taxRate.jurisdiction,
      rate: taxRate.tax_rate,
      amount: taxAmount,
      taxRateId: taxRate.id
    };
  });

  const totalTax = taxes.reduce((sum, tax) => sum + tax.amount, 0);
  const grandTotal = totalBeforeTax + totalTax;

  return {
    accommodationSubtotal,
    cleaningFee,
    serviceFee,
    taxes,
    totalBeforeTax,
    totalTax,
    grandTotal,
    nights,
    pricePerNight,
    dailyPrices
  };
}
