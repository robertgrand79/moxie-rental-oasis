import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn, LogOut, Wrench, Calendar, DollarSign, Star, Mail } from 'lucide-react';

interface DashboardSummaryBarProps {
  checkInsToday: number;
  checkOutsToday: number;
  openWorkOrders: number;
  bookingsThisMonth: number;
  revenueThisMonth: number;
  averageRating: number | null;
  totalReviews: number;
  totalSubscribers: number;
}

const DashboardSummaryBar = ({
  checkInsToday,
  checkOutsToday,
  openWorkOrders,
  bookingsThisMonth,
  revenueThisMonth,
  averageRating,
  totalReviews,
  totalSubscribers,
}: DashboardSummaryBarProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {/* Today's Stats */}
      <Link 
        to="/admin/host/bookings" 
        className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 transition-colors"
      >
        <LogIn className="h-4 w-4 text-green-600 shrink-0" />
        <div className="min-w-0">
          <p className="text-lg font-bold text-foreground leading-tight">{checkInsToday}</p>
          <p className="text-xs text-muted-foreground truncate">Check-ins</p>
        </div>
      </Link>

      <Link 
        to="/admin/host/bookings" 
        className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 transition-colors"
      >
        <LogOut className="h-4 w-4 text-orange-600 shrink-0" />
        <div className="min-w-0">
          <p className="text-lg font-bold text-foreground leading-tight">{checkOutsToday}</p>
          <p className="text-xs text-muted-foreground truncate">Check-outs</p>
        </div>
      </Link>

      <Link 
        to="/admin/work-orders" 
        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors ${
          openWorkOrders > 0 
            ? 'bg-red-500/10 hover:bg-red-500/20' 
            : 'bg-muted hover:bg-muted/80'
        }`}
      >
        <Wrench className={`h-4 w-4 shrink-0 ${openWorkOrders > 0 ? 'text-red-600' : 'text-muted-foreground'}`} />
        <div className="min-w-0">
          <p className={`text-lg font-bold leading-tight ${openWorkOrders > 0 ? 'text-red-600' : 'text-foreground'}`}>
            {openWorkOrders}
          </p>
          <p className="text-xs text-muted-foreground truncate">Work orders</p>
        </div>
      </Link>

      {/* This Month Stats */}
      <Link 
        to="/admin/host/bookings" 
        className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 transition-colors"
      >
        <Calendar className="h-4 w-4 text-violet-600 shrink-0" />
        <div className="min-w-0">
          <p className="text-lg font-bold text-foreground leading-tight">{bookingsThisMonth}</p>
          <p className="text-xs text-muted-foreground truncate">Bookings</p>
        </div>
      </Link>

      <Link 
        to="/admin/host/bookings" 
        className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
      >
        <DollarSign className="h-4 w-4 text-emerald-600 shrink-0" />
        <div className="min-w-0">
          <p className="text-lg font-bold text-foreground leading-tight">{formatCurrency(revenueThisMonth)}</p>
          <p className="text-xs text-muted-foreground truncate">Revenue</p>
        </div>
      </Link>

      {/* Reputation */}
      <Link 
        to="/admin/reviews" 
        className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
      >
        <Star className="h-4 w-4 text-amber-600 shrink-0" />
        <div className="min-w-0">
          <p className="text-lg font-bold text-foreground leading-tight">
            {averageRating !== null ? averageRating.toFixed(1) : '—'}
          </p>
          <p className="text-xs text-muted-foreground truncate">{totalReviews} reviews</p>
        </div>
      </Link>

      {/* Newsletter */}
      <Link 
        to="/admin/newsletter" 
        className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
      >
        <Mail className="h-4 w-4 text-blue-600 shrink-0" />
        <div className="min-w-0">
          <p className="text-lg font-bold text-foreground leading-tight">{totalSubscribers}</p>
          <p className="text-xs text-muted-foreground truncate">Subscribers</p>
        </div>
      </Link>
    </div>
  );
};

export default DashboardSummaryBar;
