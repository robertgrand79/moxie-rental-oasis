import React, { useState } from 'react';
import { Calculator, DollarSign, TrendingUp } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

const CalculatorSection: React.FC = () => {
  const [annualRevenue, setAnnualRevenue] = useState(100000);
  const [directBookingPercent, setDirectBookingPercent] = useState(30);

  const otaFeeRate = 0.155; // 15.5% OTA fees (Airbnb host fee)
  const directBookingRevenue = annualRevenue * (directBookingPercent / 100);
  const annualSavings = directBookingRevenue * otaFeeRate;
  const monthlySavings = annualSavings / 12;
  const fiveYearSavings = annualSavings * 5;
  
  // For display: show what 15% of total revenue would be as context
  const totalOtaFees = annualRevenue * otaFeeRate;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <section id="calculator" className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 rounded-full mb-4">
            <Calculator className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Revenue Calculator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 font-fraunces">
            Calculate your
            <br />
            <span className="text-blue-600">direct booking revenue</span>
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            See how adding a direct booking channel increases your total revenue alongside your OTA presence.
          </p>
        </div>

        {/* Calculator card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
          {/* Sliders */}
          <div className="space-y-10 mb-12">
            {/* Annual Revenue Slider */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-lg font-semibold text-gray-900">
                  Annual Rental Revenue
                </label>
                <span className="text-2xl font-bold text-blue-600 font-fraunces">
                  {formatCurrency(annualRevenue)}
                </span>
              </div>
              <Slider
                value={[annualRevenue]}
                onValueChange={(value) => setAnnualRevenue(value[0])}
                min={25000}
                max={500000}
                step={5000}
                className="w-full [&_[data-slot=track]]:bg-blue-100 [&_[data-slot=range]]:bg-blue-600 [&_[data-slot=thumb]]:border-blue-600 [&>span:first-child]:bg-blue-100 [&>span:first-child>span]:bg-blue-600 [&>span:last-child]:border-blue-600"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>$25K</span>
                <span>$500K</span>
              </div>
            </div>

            {/* Direct Booking Percent Slider */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-lg font-semibold text-gray-900">
                  Target Direct Booking %
                </label>
                <span className="text-2xl font-bold text-blue-600 font-fraunces">
                  {directBookingPercent}%
                </span>
              </div>
              <Slider
                value={[directBookingPercent]}
                onValueChange={(value) => setDirectBookingPercent(value[0])}
                min={10}
                max={80}
                step={5}
                className="w-full [&_[data-slot=track]]:bg-blue-100 [&_[data-slot=range]]:bg-blue-600 [&_[data-slot=thumb]]:border-blue-600 [&>span:first-child]:bg-blue-100 [&>span:first-child>span]:bg-blue-600 [&>span:last-child]:border-blue-600"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>10%</span>
                <span>80%</span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-gray-700 font-medium">Additional Monthly Revenue</span>
              </div>
              <div className="text-4xl font-bold text-blue-600 font-fraunces">
                {formatCurrency(monthlySavings)}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Extra revenue each month from direct bookings
              </p>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-gray-700 font-medium">5-Year Impact</span>
              </div>
              <div className="text-4xl font-bold text-blue-600 font-fraunces">
                {formatCurrency(fiveYearSavings)}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Total additional revenue over 5 years
              </p>
            </div>
          </div>

          {/* Assumption note */}
          <p className="text-center text-sm text-gray-500 mt-8">
            If 100% of your bookings went through OTAs, you'd pay {formatCurrency(totalOtaFees / 12)}/month in fees (15.5%). 
            By converting {directBookingPercent}% to direct bookings, you keep {formatCurrency(monthlySavings)} more each month.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CalculatorSection;
