import React, { useState } from 'react';
import { Car, Shield, CheckCircle, Clock, Star, Users, Award } from 'lucide-react';
import BookingForm from './BookingForm';
import PaymentSection from './PaymentSection';
import PricingSection from './PricingSection';
import { FormData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const BookingPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>('standard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const handleFormSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    try {
      // Log what you're sending
      console.log("Sending data to backend:", data);

      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...data, packageType: selectedPackage }) // add selectedPackage if needed
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit booking');
      }

      console.log("Booking response:", result);

      setBookingId(result.bookingId || `booking_${Date.now()}`);
      setFormData(data);
      setShowPayment(true);

    } catch (err) {
      console.error("Error submitting booking:", err);
      setError(err instanceof Error ? err.message : 'Failed to submit booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const handlePaymentSuccess = async (paymentData: any) => {
    if (!formData) return;

    setLoading(true);
    setError(null);

    try {
      // For now, mock successful payment processing
      console.log("Payment data:", paymentData);
      console.log("Form data:", formData);
      console.log("Booking ID:", bookingId);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock successful response
      const mockPaymentResponse = {
        success: true,
        transactionId: `txn_${Date.now()}`,
        status: 'completed'
      };

      console.log("Payment response:", mockPaymentResponse);

      // Mock confirmation email sent
      console.log("Confirmation email sent for booking:", bookingId);

      // Show success message
      alert('Booking confirmed! You will receive a confirmation email shortly.');

    } catch (err) {
      console.error("Error processing payment:", err);
      setError(err instanceof Error ? err.message : 'Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToForm = () => {
    setShowPayment(false);
    setError(null);
  };

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackage(packageId);
  };

  return (
    <div className="min-h-screen">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-lg font-medium">Processing...</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-40 max-w-md">
          <div className="flex justify-between items-start">
            <p>{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-xl shadow-lg">
                <Car className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  AutoCheckUSA
                </h1>
                <p className="text-gray-600 text-sm">America's #1 Car Inspection Service</p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <Users className="h-4 w-4" />
                <span>50,000+ Inspections</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>4.9/5 Rating</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Award className="h-4 w-4" />
                <span>ASE Certified</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-6">
            Professional Car Inspection
            <span className="block text-blue-200">You Can Trust</span>
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Get peace of mind with our comprehensive vehicle inspections. Perfect for pre-purchase evaluations,
            insurance claims, or routine maintenance checks.
          </p>

          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
              <Shield className="h-8 w-8 mx-auto mb-2" />
              <h3 className="font-semibold">Certified Experts</h3>
              <p className="text-sm text-blue-100">ASE-certified technicians</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
              <CheckCircle className="h-8 w-8 mx-auto mb-2" />
              <h3 className="font-semibold">200+ Point Check</h3>
              <p className="text-sm text-blue-100">Comprehensive inspection</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
              <Car className="h-8 w-8 text-white" />
              <h3 className="font-semibold">All Vehicle Types</h3>
              <p className="text-sm text-blue-100">Cars, trucks, motorcycles</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
              <Clock className="h-8 w-8 mx-auto mb-2" />
              <h3 className="font-semibold">Fast Turnaround</h3>
              <p className="text-sm text-blue-100">Same-day service available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      {!showPayment && (
        <PricingSection
          selectedPackage={selectedPackage}
          onPackageSelect={handlePackageSelect}
        />
      )}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-16">
        {/* Booking Form or Payment */}
        {!showPayment ? (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Book Your Inspection
              </h2>
              <p className="text-xl text-gray-600">
                Fill out the form below to schedule your professional car inspection
              </p>
            </div>
            <button
              onClick={() => {
                const testData = {
                  name: 'sameerrind',
                  email: 'sameerrind789@gmail.com',
                  phone: '03113021194',
                  alternatePhone: '',
                  carMake: 'toeew',
                  address: '1111111',
                  carColor: 'ewe',
                  carModel: 'ewe',
                  carYear: '11111',
                  city: '111',
                  date: '2025-07-29T20:17',
                  emergencyContact: '321',
                  emergencyPhone: '321',
                  fuelType: 'gasoline' as const,
                  inspectionPurpose: 'pre-purchase' as const,
                  licensePlate: '1111111111',
                  maintenanceHistory: 'irregular' as const,
                  mileage: '1111111',
                  packageType: 'premium' as const,
                  preferredInspector: '',
                  previousAccidents: 'yes' as const,
                  specialRequests: '321321',
                  specificConcerns: '12321321',
                  state: '11',
                  timePreference: 'flexible' as const,
                  transmission: 'automatic' as const,
                  vin: '11111111111111111',
                  zipCode: '11'
                };
                handleFormSubmit(testData);
              }}
            >submit
            </button>
            <BookingForm
              onSubmit={handleFormSubmit}
              selectedPackage={selectedPackage}
            />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <PaymentSection
              formData={formData!}
              onBack={handleBackToForm}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Car className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">AutoCheckUSA</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                America's most trusted car inspection service. We provide comprehensive vehicle evaluations
                to help you make informed decisions about your automotive investments.
              </p>
              <div className="flex space-x-4">
                <div className="bg-gray-800 p-2 rounded-lg">
                  <Star className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="font-semibold">4.9/5 Rating</p>
                  <p className="text-sm text-gray-400">Based on 10,000+ reviews</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Pre-Purchase Inspection</li>
                <li>Insurance Claims</li>
                <li>Routine Maintenance</li>
                <li>Fleet Inspections</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>1-800-AUTO-CHECK</li>
                <li>support@autocheckusa.com</li>
                <li>Available 24/7</li>
                <li>Nationwide Service</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">© 2025 AutoCheckUSA. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BookingPage;