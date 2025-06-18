
import React from 'react';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface EmailTestResultProps {
  lastTestResult: any;
}

const EmailTestResult = ({ lastTestResult }: EmailTestResultProps) => {
  if (!lastTestResult) return null;

  return (
    <div className={`p-4 rounded-lg border ${
      lastTestResult.success 
        ? 'bg-green-50 border-green-200' 
        : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-start">
        {lastTestResult.success ? (
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2" />
        ) : (
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
        )}
        <div className="text-sm">
          <h4 className={`font-medium mb-2 ${
            lastTestResult.success ? 'text-green-900' : 'text-red-900'
          }`}>
            {lastTestResult.success ? '✅ Test Email Sent Successfully!' : '❌ Test Email Failed'}
          </h4>
          {lastTestResult.success && lastTestResult.details && (
            <div className="space-y-1 text-green-700">
              <p><strong>To:</strong> {lastTestResult.details.to}</p>
              <p><strong>From:</strong> {lastTestResult.details.fromName} &lt;{lastTestResult.details.from}&gt;</p>
              <p><strong>Reply-To:</strong> {lastTestResult.details.replyTo}</p>
              <p><strong>Domain:</strong> {lastTestResult.details.domain}</p>
              <div className="flex items-center mt-2">
                <Clock className="h-4 w-4 mr-1" />
                <span className="text-xs">Sent at {new Date(lastTestResult.details.timestamp).toLocaleString()}</span>
              </div>
            </div>
          )}
          {!lastTestResult.success && (
            <p className="text-red-700">{lastTestResult.error}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailTestResult;
