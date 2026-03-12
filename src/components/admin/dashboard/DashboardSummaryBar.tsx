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

  const items = [
    { to: '/admin/host/bookings', icon: LogIn, value: checkInsToday, label: 'Check-ins', color: 'text-green-700 dark:text-green-400', bg: 'bg-green-500/10' },
    { to: '/admin/host/bookings', icon: LogOut, value: checkOutsToday, label: 'Check-outs', color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-500/10' },
    { to: '/admin/work-orders', icon: Wrench, value: openWorkOrders, label: 'Work orders', color: openWorkOrders > 0 ? 'text-red-700 dark:text-red-400' : 'text-muted-foreground', bg: openWorkOrders > 0 ? 'bg-red-500/10' : 'bg-muted/50' },
    { to: '/admin/host/bookings', icon: Calendar, value: bookingsThisMonth, label: 'Bookings', color: 'text-violet-700 dark:text-violet-400', bg: 'bg-violet-500/10' },
    { to: '/admin/host/bookings', icon: DollarSign, value: formatCurrency(revenueThisMonth), label: 'Revenue', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
    { to: '/admin/reviews', icon: Star, value: averageRating !== null ? averageRating.toFixed(1) : '—', label: `${totalReviews} reviews`, color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-500/10' },
    { to: '/admin/newsletter', icon: Mail, value: totalSubscribers, label: 'Subscribers', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-500/10' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {items.map((item, i) => (
        <Link
          key={i}
          to={item.to}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl ${item.bg} hover:opacity-80 transition-all duration-200`}
        >
          <item.icon className={`h-4 w-4 ${item.color} shrink-0`} strokeWidth={1.5} />
          <div className="min-w-0">
            <p className="text-lg font-semibold tracking-tight text-foreground leading-tight">{item.value}</p>
            <p className="text-xs text-muted-foreground truncate">{item.label}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default DashboardSummaryBar;
