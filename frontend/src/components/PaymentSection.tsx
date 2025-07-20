import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, CreditCard, CheckCircle } from 'lucide-react';
import { FormData } from '../types';
import { inspectionPackages } from '../data/packages';


interface PaymentSectionProps {
  formData: FormData;
  onBack: () => void;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

const PaymentSection: React.FC<PaymentSectionProps> = ({ formData, onBack }) => {
  const navigate = useNavigate();
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [processing, setProcessing] = useState(false);

  const selectedPackage = inspectionPackages.find(pkg => pkg.id === formData.packageType);

  useEffect(() => {
    // Load PayPal SDK
    const script = document.createElement('script');
    script.src = 'https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID';
    script.onload = () => {
      setPaypalLoaded(true);
      initializePayPal();
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initializePayPal = () => {
    if (window.paypal) {
      window.paypal.Buttons({
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: selectedPackage?.price.toFixed(2) || '50.00'
              },
              description: `AutoCheckUSA ${selectedPackage?.name || 'Car Inspection Service'}`
            }]
          });
        },
        onApprove: async (data: any, actions: any) => {
          setProcessing(true);
          try {
            await actions.order.capture();
            // Here you would normally send the booking data to your backend
            console.log('Payment successful, booking data:', formData);
            
            // Simulate API call to save booking
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            navigate('/confirmation', { state: { formData } });
          } catch (error) {
            console.error('Payment error:', error);
            alert('Payment failed. Please try again.');
          } finally {
            setProcessing(false);
          }
        },
        onError: (err: any) => {
          console.error('PayPal error:', err);
          alert('Payment failed. Please try again.');
        }
      }).render('#paypal-button-container');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-green-100 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Form</span>
          </button>
          <div className="text-center">
            <h3 className="text-2xl font-bold">Secure Payment</h3>
            <p className="text-green-100">Complete your booking</p>
          </div>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="p-6">
        {/* Booking Summary */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Booking Summary</span>
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Customer:</span>
              <span className="font-medium">{formData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{formData.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium">{formData.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Vehicle:</span>
              <span className="font-medium">{formData.carModel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date & Time:</span>
              <span className="font-medium">{formatDate(formData.date)}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-gray-600">Address:</span>
              <span className="font-medium text-right max-w-xs">{formData.address}</span>
            </div>
            
            <div className="border-t pt-3 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Amount:</span>
                <span className="text-2xl font-bold text-green-600">$50.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-blue-600 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-900">Secure Payment Processing</h4>
              <p className="text-sm text-blue-700">
                Your payment is processed securely through PayPal. We never store your payment information.
              </p>
            </div>
          </div>
        </div>

        {/* PayPal Button Container */}
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <CreditCard className="h-5 w-5" />
            <span className="font-medium">Pay with PayPal</span>
          </div>
          
          {processing && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Processing your payment and booking...</p>
            </div>
          )}
          
          <div 
            id="paypal-button-container" 
            className={`${processing ? 'hidden' : ''}`}
          ></div>
          
          {!paypalLoaded && !processing && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Loading payment options...</p>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          By completing this payment, you agree to our terms of service. 
          You will receive a confirmation email with your inspection details.
        </p>
      </div>
    </div>
  );
};

export default PaymentSection;