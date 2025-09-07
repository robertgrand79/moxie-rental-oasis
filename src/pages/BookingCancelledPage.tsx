import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft } from 'lucide-react';

const BookingCancelledPage = () => {
  const [searchParams] = useSearchParams();
  const reservationId = searchParams.get('reservation_id');

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <XCircle className="h-16 w-16 text-red-500" />
              </div>
              <CardTitle className="text-2xl text-red-600">
                Booking Cancelled
              </CardTitle>
              <p className="text-muted-foreground">
                Your payment was cancelled and no charges were made to your account.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2">What happened?</h3>
                <p className="text-sm text-red-700">
                  You cancelled the payment process or there was an issue with your payment method. 
                  Your reservation has been cancelled and no payment was processed.
                </p>
              </div>

              {reservationId && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Reservation Reference</h3>
                  <p className="text-sm text-gray-600 font-mono">{reservationId}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Keep this reference if you need to contact support.
                  </p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Want to try again?</h3>
                <p className="text-sm text-blue-700 mb-3">
                  You can return to the property page and start a new booking process.
                </p>
                <Button asChild size="sm" className="w-full">
                  <Link to="/properties">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Browse Properties
                  </Link>
                </Button>
              </div>

              <div className="flex gap-4 pt-4">
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/">Return Home</Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link to="/contact">Contact Support</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingCancelledPage;