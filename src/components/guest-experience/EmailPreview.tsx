import React from 'react';

interface EmailPreviewProps {
  headerColor: string;
  headerColorEnd: string;
  accentColor: string;
  footerColor: string;
  siteName?: string;
}

const EmailPreview: React.FC<EmailPreviewProps> = ({
  headerColor,
  headerColorEnd,
  accentColor,
  footerColor,
  siteName = 'Your Property'
}) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm bg-white" style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}>
      {/* Header */}
      <div 
        className="p-6 text-center"
        style={{ background: `linear-gradient(135deg, ${headerColor} 0%, ${headerColorEnd} 100%)` }}
      >
        <h2 className="text-white text-lg font-semibold">{siteName}</h2>
      </div>
      
      {/* Body */}
      <div className="p-6 bg-white">
        <p className="text-gray-800 mb-4 text-sm">Hi Sarah,</p>
        <p className="text-gray-600 text-sm mb-4">
          Thank you for your reservation! We're excited to host you.
        </p>
        
        {/* Reservation Box */}
        <div 
          className="rounded-lg p-4 mb-4"
          style={{ 
            borderLeft: `4px solid ${accentColor}`,
            backgroundColor: '#f8fafc'
          }}
        >
          <p className="font-semibold text-gray-800 text-sm mb-2">Reservation Details</p>
          <div className="text-xs text-gray-600 space-y-1">
            <p>📅 Check-in: Dec 20, 2024</p>
            <p>📅 Check-out: Dec 25, 2024</p>
            <p>👥 Guests: 4</p>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm">
          If you have any questions, don't hesitate to reach out!
        </p>
      </div>
      
      {/* Footer */}
      <div 
        className="p-4 text-center border-t"
        style={{ backgroundColor: footerColor }}
      >
        <p className="text-xs text-gray-500">
          {siteName} • contact@example.com
        </p>
      </div>
    </div>
  );
};

export default EmailPreview;
