import { supabase } from '@/integrations/supabase/client';
import { eachDayOfInterval, format, addDays } from 'date-fns';

export interface TaxDetail {
  name: string;
  jurisdiction: string;
  rate: number;
  amount: number;
  taxRateId: string;
  taxType: string;
}

export interface DailyPriceDetail {
  date: string;
  price: number;
  source: string;
}

export interface CustomFeeDetail {
  id: string;
  name: string;
  amount: number;
  description?: string;
}

export interface DiscountDetail {
  type: 'promo' | 'length_of_stay';
  name: string;
  amount: number;
  percentage?: number;
}

export interface BookingChargesBreakdown {
  accommodationSubtotal: number;
  cleaningFee: number;
  serviceFee: number;
  customFees: CustomFeeDetail[];
  totalCustomFees: number;
  discounts: DiscountDetail[];
  totalDiscount: number;
  subtotalAfterDiscount: number;
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
  checkOutDate: string,
  guestCount: number = 1,
  promoCode?: string
): Promise<BookingChargesBreakdown> {
  // Calculate number of nights
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  if (nights <= 0) {
    throw new Error('Check-out date must be after check-in date');
  }

  // Fetch property details including extra guest fee settings
  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .select('price_per_night, cleaning_fee, service_fee_percentage, extra_guest_fee, extra_guest_threshold, pet_fee, pet_fee_type, organization_id')
    .eq('id', propertyId)
    .single();

  if (propertyError || !property) {
    throw new Error('Property not found');
  }

  // Fetch dynamic pricing for each night of the stay using secure RPC function
  const stayDates = eachDayOfInterval({ 
    start: checkIn, 
    end: addDays(checkOut, -1)
  });

  // Use the secure get_public_pricing function that only exposes guest-facing prices
  const { data: dynamicPrices, error: pricingError } = await supabase
    .rpc('get_public_pricing', {
      p_property_id: propertyId,
      p_start_date: format(checkIn, 'yyyy-MM-dd'),
      p_end_date: format(addDays(checkOut, -1), 'yyyy-MM-dd')
    });

  if (pricingError) {
    console.error('Error fetching dynamic pricing:', pricingError);
  }

  // Create a map of date -> price (pricing_source not exposed for security)
  const priceMap = new Map<string, { price: number; source: string }>();
  (dynamicPrices || []).forEach(p => {
    priceMap.set(p.date, { price: p.final_price, source: 'dynamic' });
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

  // Fetch custom fees for this property
  const { data: customFeesData, error: customFeesError } = await supabase
    .from('property_fees')
    .select('*')
    .eq('property_id', propertyId)
    .eq('is_active', true);

  if (customFeesError) {
    console.error('Error fetching custom fees:', customFeesError);
  }

  // Calculate custom fees including extra guest fee
  const customFees: CustomFeeDetail[] = (customFeesData || []).map((fee: any) => {
    let amount = 0;
    
    if (fee.fee_type === 'flat') {
      switch (fee.fee_applies_to) {
        case 'booking':
          amount = fee.fee_amount;
          break;
        case 'per_night':
          amount = fee.fee_amount * nights;
          break;
        case 'per_guest':
          amount = fee.fee_amount * guestCount;
          break;
      }
    } else if (fee.fee_type === 'percentage') {
      amount = accommodationSubtotal * (fee.fee_amount / 100);
    }

    return {
      id: fee.id,
      name: fee.fee_name,
      amount: Math.round(amount * 100) / 100,
      description: fee.description,
    };
  });

  // Add extra guest fee if applicable
  const extraGuestThreshold = property.extra_guest_threshold || 2;
  const extraGuestFee = property.extra_guest_fee || 0;
  if (guestCount > extraGuestThreshold && extraGuestFee > 0) {
    const extraGuests = guestCount - extraGuestThreshold;
    const extraGuestTotal = extraGuests * extraGuestFee * nights;
    customFees.push({
      id: 'extra-guest-fee',
      name: `Extra Guest Fee (${extraGuests} guest${extraGuests > 1 ? 's' : ''})`,
      amount: Math.round(extraGuestTotal * 100) / 100,
      description: `$${extraGuestFee}/night per guest over ${extraGuestThreshold}`,
    });
  }

  const totalCustomFees = customFees.reduce((sum, fee) => sum + fee.amount, 0);
  
  // Calculate subtotal before discounts
  const subtotalBeforeDiscounts = accommodationSubtotal + cleaningFee + serviceFee + totalCustomFees;

  // Fetch and apply discounts
  const discounts: DiscountDetail[] = [];

  // Check for length of stay discounts
  const { data: losDiscounts } = await supabase
    .from('length_of_stay_discounts')
    .select('*')
    .eq('property_id', propertyId)
    .eq('is_active', true)
    .lte('min_nights', nights)
    .order('min_nights', { ascending: false })
    .limit(1);

  if (losDiscounts && losDiscounts.length > 0) {
    const discount = losDiscounts[0];
    const discountAmount = accommodationSubtotal * (discount.discount_percentage / 100);
    discounts.push({
      type: 'length_of_stay',
      name: `${discount.min_nights}+ Night Discount`,
      amount: Math.round(discountAmount * 100) / 100,
      percentage: discount.discount_percentage,
    });
  }

  // Check for promo code
  if (promoCode) {
    const { data: promoData } = await supabase
      .from('promotional_codes')
      .select('*')
      .eq('organization_id', property.organization_id)
      .eq('code', promoCode.toUpperCase())
      .eq('is_active', true)
      .or(`property_id.is.null,property_id.eq.${propertyId}`)
      .gte('valid_until', new Date().toISOString())
      .single();

    if (promoData && nights >= (promoData.min_nights || 1)) {
      // Check usage limits
      if (!promoData.max_uses || promoData.current_uses < promoData.max_uses) {
        let discountAmount = 0;
        if (promoData.discount_type === 'percentage') {
          discountAmount = accommodationSubtotal * (promoData.discount_amount / 100);
        } else {
          discountAmount = promoData.discount_amount;
        }
        
        discounts.push({
          type: 'promo',
          name: `Promo: ${promoCode.toUpperCase()}`,
          amount: Math.round(discountAmount * 100) / 100,
          percentage: promoData.discount_type === 'percentage' ? promoData.discount_amount : undefined,
        });
      }
    }
  }

  const totalDiscount = discounts.reduce((sum, d) => sum + d.amount, 0);
  const subtotalAfterDiscount = subtotalBeforeDiscounts - totalDiscount;
  const totalBeforeTax = subtotalAfterDiscount;

  // Fetch applicable tax rates with new tax types
  const { data: taxAssignments, error: taxError } = await supabase
    .from('property_tax_assignments')
    .select(`
      tax_rate_id,
      tax_rates (
        id,
        jurisdiction,
        tax_name,
        tax_rate,
        tax_type,
        flat_amount,
        applies_to
      )
    `)
    .eq('property_id', propertyId)
    .eq('is_active', true);

  if (taxError) {
    console.error('Error fetching tax rates:', taxError);
  }

  // Calculate taxes based on tax type and applies_to settings
  const taxes: TaxDetail[] = (taxAssignments || []).map((assignment: any) => {
    const taxRate = assignment.tax_rates;
    let taxableAmount = 0;
    let taxAmount = 0;

    // Determine taxable base based on applies_to
    switch (taxRate.applies_to) {
      case 'accommodation_only':
        taxableAmount = accommodationSubtotal - totalDiscount;
        break;
      case 'subtotal':
        taxableAmount = accommodationSubtotal + cleaningFee + totalCustomFees - totalDiscount;
        break;
      case 'total':
      default:
        taxableAmount = totalBeforeTax;
        break;
    }

    // Calculate tax based on tax type
    switch (taxRate.tax_type) {
      case 'percentage':
        taxAmount = taxableAmount * taxRate.tax_rate;
        break;
      case 'flat_per_night':
        taxAmount = (taxRate.flat_amount || 0) * nights;
        break;
      case 'flat_per_booking':
        taxAmount = taxRate.flat_amount || 0;
        break;
      default:
        taxAmount = taxableAmount * taxRate.tax_rate;
    }
    
    return {
      name: taxRate.tax_name,
      jurisdiction: taxRate.jurisdiction,
      rate: taxRate.tax_rate,
      amount: Math.round(taxAmount * 100) / 100,
      taxRateId: taxRate.id,
      taxType: taxRate.tax_type,
    };
  });

  const totalTax = taxes.reduce((sum, tax) => sum + tax.amount, 0);
  const grandTotal = Math.round((totalBeforeTax + totalTax) * 100) / 100;

  return {
    accommodationSubtotal,
    cleaningFee,
    serviceFee,
    customFees,
    totalCustomFees,
    discounts,
    totalDiscount,
    subtotalAfterDiscount,
    taxes,
    totalBeforeTax,
    totalTax,
    grandTotal,
    nights,
    pricePerNight,
    dailyPrices
  };
}
