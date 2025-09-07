import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import QRCodeCheckin from '@/components/guest/QRCodeCheckin';

const CheckinPage = () => {
  const { reservationId } = useParams();
  const [searchParams] = useSearchParams();
  const accessCode = searchParams.get('code');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <QRCodeCheckin 
        reservationId={reservationId} 
        accessCode={accessCode || undefined}
      />
    </div>
  );
};

export default CheckinPage;