
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Phone, Mail, MapPin } from 'lucide-react';

interface WorkOrder {
  id: string;
  work_order_number: string;
  title: string;
  status: string;
  contractor?: {
    id: string;
    name: string;
    email: string;
  };
}

interface TokenData {
  id: string;
  work_order_id: string;
  token: string;
  expires_at: string;
  used_at: string | null;
  work_order: WorkOrder;
}

const WorkOrderAcknowledgment = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [acknowledging, setAcknowledging] = useState(false);

  useEffect(() => {
    if (token) {
      handleTokenValidation();
    } else {
      setError('No acknowledgment token provided');
      setLoading(false);
    }
  }, [token]);

  const handleTokenValidation = async () => {
    try {
      setLoading(true);
      
      // Get token data with work order details
      const { data, error: fetchError } = await supabase
        .from('work_order_acknowledgement_tokens')
        .select(`
          *,
          work_order:work_orders(
            id,
            work_order_number,
            title,
            status,
            contractor:contractors(id, name, email)
          )
        `)
        .eq('token', token)
        .single();

      if (fetchError || !data) {
        setError('Invalid or expired acknowledgment link');
        return;
      }

      // Check if token is expired
      const isExpired = new Date(data.expires_at) < new Date();
      if (isExpired) {
        setError('This acknowledgment link has expired');
        return;
      }

      setTokenData(data);

      // If not already used, acknowledge automatically
      if (!data.used_at) {
        await handleAcknowledgment(data);
      }
    } catch (err) {
      console.error('Error validating token:', err);
      setError('An error occurred while processing your request');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgment = async (data: TokenData) => {
    try {
      setAcknowledging(true);

      // Update work order status
      const { error: updateError } = await supabase
        .from('work_orders')
        .update({
          status: 'acknowledged',
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', data.work_order_id);

      if (updateError) {
        throw updateError;
      }

      // Mark token as used
      const { error: tokenError } = await supabase
        .from('work_order_acknowledgement_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('id', data.id);

      if (tokenError) {
        console.warn('Error marking token as used:', tokenError);
      }

      // Update local state
      setTokenData(prev => prev ? {
        ...prev,
        used_at: new Date().toISOString(),
        work_order: {
          ...prev.work_order,
          status: 'acknowledged'
        }
      } : null);

    } catch (err) {
      console.error('Error acknowledging work order:', err);
      setError('Failed to acknowledge work order');
    } finally {
      setAcknowledging(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Processing acknowledgment...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Acknowledgment Failed</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-8">{error}</p>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Need Help?</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>Phone: <a href="tel:+15412551698" className="text-blue-600 hover:underline">+1 541-255-1698</a></span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>Email: <a href="mailto:team@moxievacationrentals.com" className="text-blue-600 hover:underline">team@moxievacationrentals.com</a></span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>2472 Willamette St, Eugene, OR 97405</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAlreadyAcknowledged = !!tokenData?.used_at;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            {acknowledging ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            ) : (
              <CheckCircle className="w-8 h-8 text-green-600" />
            )}
          </div>
          <div className="mb-4">
            <div className="text-2xl font-bold text-gray-900 mb-2">Moxie Vacation Rentals</div>
            <div className="text-sm text-gray-600">Your Home Base for Living Like a Local</div>
          </div>
          <CardTitle className="text-2xl text-gray-900">
            {isAlreadyAcknowledged ? 'Work Order Previously Acknowledged' : 'Work Order Acknowledged Successfully'}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="text-center mb-8">
            <p className="text-gray-600">
              {isAlreadyAcknowledged 
                ? 'This work order has already been acknowledged.' 
                : 'Thank you for confirming receipt of this work order.'
              }
            </p>
          </div>

          {tokenData && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Work Order Details
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Work Order #</span>
                  <span className="font-medium">{tokenData.work_order.work_order_number}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Title</span>
                  <span className="font-medium">{tokenData.work_order.title}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Status</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Acknowledged
                  </Badge>
                </div>
                
                {tokenData.work_order.contractor && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Contractor</span>
                    <span className="font-medium">{tokenData.work_order.contractor.name}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {!isAlreadyAcknowledged && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h4 className="font-semibold text-blue-900 mb-3">Next Steps</h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Review the work order details and requirements</li>
                <li>• Contact the property manager if you have any questions</li>
                <li>• Begin work according to the specified timeline</li>
                <li>• Update the work order status when work is in progress</li>
              </ul>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <h3 className="font-semibold text-gray-900 mb-4">Questions about this work order?</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center justify-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>Phone: <a href="tel:+15412551698" className="text-blue-600 hover:underline">+1 541-255-1698</a></span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Email: <a href="mailto:team@moxievacationrentals.com" className="text-blue-600 hover:underline">team@moxievacationrentals.com</a></span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>2472 Willamette St, Eugene, OR 97405</span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500">
              Acknowledged on {new Date().toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkOrderAcknowledgment;
