import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle, ExternalLink, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AcknowledgePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  const status = searchParams.get('status');
  const name = searchParams.get('name');
  const count = searchParams.get('count');
  const message = searchParams.get('message');
  const portalToken = searchParams.get('portalToken');
  const workOrderIds = searchParams.get('workOrderIds');

  // Get the first work order ID for highlighting
  const firstWorkOrderId = workOrderIds?.split(',')[0] || '';

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Work Orders Acknowledged
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you, <strong>{name || 'Contractor'}</strong>! You have successfully acknowledged{' '}
            <strong>{count || 'the'}</strong> work order{count !== '1' ? 's' : ''}.
          </p>
          
          {portalToken && (
            <div className="space-y-3 mb-6">
              <Link 
                to={`/contractor/${portalToken}${firstWorkOrderId ? `?highlight=${firstWorkOrderId}` : ''}`}
              >
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Work Order Details
                </Button>
              </Link>
            </div>
          )}
          
          <div className="bg-emerald-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-emerald-800">
              The property manager has been notified of your acknowledgment. Please complete the work as scheduled.
            </p>
          </div>
          
          {portalToken && (
            <Link 
              to={`/contractor/${portalToken}`}
              className="inline-flex items-center text-sm text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              <List className="w-4 h-4 mr-1" />
              View All My Work Orders
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (status === 'already') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Already Acknowledged
          </h1>
          <p className="text-gray-600 mb-6">
            {name ? `${name}, these` : 'These'} work orders have already been acknowledged previously.
          </p>
          
          {portalToken && (
            <div className="space-y-3 mb-6">
              <Link to={`/contractor/${portalToken}`}>
                <Button className="w-full">
                  <List className="w-4 h-4 mr-2" />
                  View My Work Orders
                </Button>
              </Link>
            </div>
          )}
          
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              No further action is required. If you have any questions, please contact the property manager.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state (default)
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Unable to Process
        </h1>
        <p className="text-gray-600 mb-6">
          {message || 'We were unable to process your acknowledgment. The link may be invalid or expired.'}
        </p>
        <div className="bg-red-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800">
            Please contact the property manager if you believe this is an error or need a new acknowledgment link.
          </p>
        </div>
        <p className="text-xs text-gray-400">
          You can close this window now.
        </p>
      </div>
    </div>
  );
};

export default AcknowledgePage;
