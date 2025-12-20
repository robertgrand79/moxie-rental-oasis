import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle, List, MapPin, Calendar, Key, FileText, Loader2, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WorkOrderDetails {
  id: string;
  work_order_number: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  due_date: string | null;
  access_code: string | null;
  special_instructions: string | null;
  property: {
    name: string;
    address: string | null;
  } | null;
}

const AcknowledgePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [workOrder, setWorkOrder] = useState<WorkOrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  
  const status = searchParams.get('status');
  const name = searchParams.get('name');
  const count = searchParams.get('count');
  const message = searchParams.get('message');
  const portalToken = searchParams.get('portalToken');
  const workOrderIds = searchParams.get('workOrderIds');

  const firstWorkOrderId = workOrderIds?.split(',')[0] || '';

  // Fetch work order details when we have a portal token and work order ID
  useEffect(() => {
    const fetchWorkOrderDetails = async () => {
      if (!portalToken || !firstWorkOrderId) return;
      
      setLoading(true);
      try {
        const response = await fetch(
          `https://joiovubyokikqjytxtuv.supabase.co/functions/v1/contractor-portal?token=${portalToken}&action=get-work-orders`
        );
        
        if (response.ok) {
          const data = await response.json();
          const foundWorkOrder = data.workOrders?.find((wo: WorkOrderDetails) => wo.id === firstWorkOrderId);
          if (foundWorkOrder) {
            setWorkOrder(foundWorkOrder);
          }
        }
      } catch (error) {
        console.error('Failed to fetch work order details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'success' || status === 'already') {
      fetchWorkOrderDetails();
    }
  }, [portalToken, firstWorkOrderId, status]);

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300';
      case 'normal': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Not specified';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const WorkOrderCard = () => {
    if (loading) {
      return (
        <Card className="mb-6 text-left">
          <CardContent className="py-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading work order details...</span>
          </CardContent>
        </Card>
      );
    }

    if (!workOrder) return null;

    return (
      <Card className="mb-6 text-left border-2">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-mono text-muted-foreground mb-1">{workOrder.work_order_number}</p>
              <CardTitle className="text-lg">{workOrder.title}</CardTitle>
            </div>
            <Badge className={getPriorityColor(workOrder.priority)}>
              {workOrder.priority?.charAt(0).toUpperCase() + workOrder.priority?.slice(1) || 'Normal'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Property */}
          {workOrder.property && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{workOrder.property.name}</p>
                {workOrder.property.address && (
                  <p className="text-sm text-muted-foreground">{workOrder.property.address}</p>
                )}
              </div>
            </div>
          )}

          {/* Due Date */}
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Due Date</p>
              <p className="font-medium">{formatDate(workOrder.due_date)}</p>
            </div>
          </div>

          {/* Access Code - Highlighted */}
          {workOrder.access_code && (
            <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
              <Key className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-sm text-amber-700 dark:text-amber-300">Access Code</p>
                <p className="font-bold text-lg text-amber-800 dark:text-amber-200 font-mono">{workOrder.access_code}</p>
              </div>
            </div>
          )}

          {/* Description/Scope */}
          {workOrder.description && (
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Scope of Work</p>
                <p className="text-sm mt-1 whitespace-pre-wrap">{workOrder.description}</p>
              </div>
            </div>
          )}

          {/* Special Instructions */}
          {workOrder.special_instructions && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Special Instructions</p>
              <p className="text-sm text-blue-700 dark:text-blue-400 whitespace-pre-wrap">{workOrder.special_instructions}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-xl p-6 sm:p-8 max-w-lg w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Work Order Acknowledged
            </h1>
            <p className="text-muted-foreground">
              Thank you, <strong>{name || 'Contractor'}</strong>! 
              {count && parseInt(count) > 1 ? ` You acknowledged ${count} work orders.` : ''}
            </p>
          </div>
          
          <WorkOrderCard />
          
          {portalToken && (
            <div className="space-y-3">
              <Link to={`/contractor/${portalToken}`}>
                <Button className="w-full" size="lg">
                  <List className="w-4 h-4 mr-2" />
                  View All My Work Orders
                </Button>
              </Link>
            </div>
          )}
          
          <div className="mt-6 bg-muted/50 rounded-lg p-4 flex items-start gap-3">
            <Bookmark className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              <strong>Tip:</strong> Bookmark this page or save the link to quickly access your work order details on-site.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'already') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-xl p-6 sm:p-8 max-w-lg w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Already Acknowledged
            </h1>
            <p className="text-muted-foreground">
              {name ? `${name}, this` : 'This'} work order was already acknowledged.
            </p>
          </div>
          
          <WorkOrderCard />
          
          {portalToken && (
            <div className="space-y-3">
              <Link to={`/contractor/${portalToken}`}>
                <Button className="w-full" size="lg">
                  <List className="w-4 h-4 mr-2" />
                  View All My Work Orders
                </Button>
              </Link>
            </div>
          )}
          
          <div className="mt-6 bg-muted/50 rounded-lg p-4 flex items-start gap-3">
            <Bookmark className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              <strong>Tip:</strong> Bookmark this page to quickly reference your work order details on-site.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state (default)
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-red-950 dark:to-orange-900 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Unable to Process
        </h1>
        <p className="text-muted-foreground mb-6">
          {message || 'We were unable to process your acknowledgment. The link may be invalid or expired.'}
        </p>
        <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800 dark:text-red-300">
            Please contact the property manager if you believe this is an error or need a new acknowledgment link.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          You can close this window now.
        </p>
      </div>
    </div>
  );
};

export default AcknowledgePage;
