import { supabase } from '@/integrations/supabase/client';

export interface TaxDetail {
  name: string;
  jurisdiction: string;
  rate: number;
  amount: number;
  taxRateId: string;
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

  // Fetch property details
  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .select('price_per_night, cleaning_fee, service_fee_percentage')
    .eq('id', propertyId)
    .single();

  if (propertyError || !property) {
    throw new Error('Property not found');
  }

  // Calculate base charges
  const accommodationSubtotal = property.price_per_night * nights;
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
    pricePerNight: property.price_per_night
  };
}
