import React, { useState } from 'react';
import { User, Mail, Phone, Car, Calendar, MapPin, FileText, AlertCircle } from 'lucide-react';
import { FormData } from '../types';
import { inspectionPackages } from '../data/packages';

interface BookingFormProps {
  onSubmit: (data: FormData) => void;
  selectedPackage: string;
}

const BookingForm: React.FC<BookingFormProps> = ({ onSubmit, selectedPackage }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    // Personal Information
    name: '',
    email: '',
    phone: '',
    alternatePhone: '',

    // Vehicle Information
    carMake: '',
    carModel: '',
    carYear: '',
    carColor: '',
    mileage: '',
    vin: '',
    licensePlate: '',
    fuelType: 'gasoline',
    transmission: 'automatic',

    // Inspection Details
    date: '',
    timePreference: 'flexible',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    packageType: selectedPackage as 'basic' | 'standard' | 'premium',

    // Purpose & Additional Info
    inspectionPurpose: 'pre-purchase',
    specificConcerns: '',
    previousAccidents: 'unknown',
    maintenanceHistory: 'unknown',

    // Special Requirements
    specialRequests: '',
    preferredInspector: '',
    emergencyContact: '',
    emergencyPhone: ''
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const isSubmitting = false;

  const selectedPkg = inspectionPackages.find(pkg => pkg.id === selectedPackage);

  React.useEffect(() => {
    setFormData(prev => ({ ...prev, packageType: selectedPackage as 'basic' | 'standard' | 'premium' }));
  }, [selectedPackage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<FormData> = {};

    if (step === 1) {
      // Personal Information
      if (!formData.name.trim()) newErrors.name = 'Full name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    } else if (step === 2) {
      // Vehicle Information
      if (!formData.carMake.trim()) newErrors.carMake = 'Car make is required';
      if (!formData.carModel.trim()) newErrors.carModel = 'Car model is required';
      if (!formData.carYear.trim()) newErrors.carYear = 'Car year is required';
      if (!formData.carColor.trim()) newErrors.carColor = 'Car color is required';
      if (!formData.mileage.trim()) newErrors.mileage = 'Mileage is required';
      if (!formData.vin.trim()) newErrors.vin = 'VIN is required';
      if (!formData.licensePlate.trim()) newErrors.licensePlate = 'License plate is required';
    } else if (step === 3) {
      // Inspection Details
      if (!formData.date) newErrors.date = 'Inspection date is required';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.state.trim()) newErrors.state = 'State is required';
      if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep !== 4) return;
    if (!validateStep(4)) return;

    const formId = `FORM-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const payload = { ...formData, formId, package: selectedPackage };

    // Optionally save to DB
    await onSubmit(payload); // Make sure onSubmit is async if needed
  };

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Vehicle Details', icon: Car },
    { number: 3, title: 'Inspection Details', icon: Calendar },
    { number: 4, title: 'Additional Info', icon: FileText }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Progress Header */} 
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold">${selectedPkg?.price}</h3>
            <p className="text-blue-100">{selectedPkg?.name}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Step {currentStep} of 4</p>
            <p className="font-semibold">{steps[currentStep - 1].title}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex space-x-2">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className={`flex-1 flex items-center justify-center p-2 rounded-lg transition-all ${currentStep >= step.number
                  ? 'bg-white bg-opacity-20 text-white'
                  : 'bg-white bg-opacity-10 text-blue-200'
                  }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium hidden sm:block">{step.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && currentStep !== 4) {
            e.preventDefault();
          }
        }}
        className="p-8">
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <>
            <div className="space-y-6">
              <div className="text-center mb-6">
                <User className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
                <p className="text-gray-600">Let's start with your contact details</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <User className="h-4 w-4" />
                    <span>Full Name *</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <Mail className="h-4 w-4" />
                    <span>Email Address *</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    placeholder="Enter your email"
                  />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <Phone className="h-4 w-4" />
                    <span>Primary Phone *</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    placeholder="Enter your phone number"
                  />
                  {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <Phone className="h-4 w-4" />
                    <span>Alternate Phone</span>
                  </label>
                  <input
                    type="tel"
                    name="alternatePhone"
                    value={formData.alternatePhone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Alternate phone (optional)"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-between pt-6 border-t">
              <button
                type="button"
                onClick={nextStep}
                className="ml-auto px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next Step
              </button>
            </div>
          </>
        )}
        {/* Step 2: Vehicle Information */}
        {currentStep === 2 && (
          <>
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Car className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-gray-900">Vehicle Information</h3>
                <p className="text-gray-600">Tell us about your vehicle</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Car Make *</label>
                  <input
                    type="text"
                    name="carMake"
                    value={formData.carMake}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.carMake ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    placeholder="e.g., Toyota, Honda, Ford"
                  />
                  {errors.carMake && <p className="text-red-500 text-sm">{errors.carMake}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Car Model *</label>
                  <input
                    type="text"
                    name="carModel"
                    value={formData.carModel}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.carModel ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    placeholder="e.g., Camry, Civic, F-150"
                  />
                  {errors.carModel && <p className="text-red-500 text-sm">{errors.carModel}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Year *</label>
                  <input
                    type="number"
                    name="carYear"
                    value={formData.carYear}
                    onChange={handleChange}
                    min="1990"
                    max="2025"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.carYear ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    placeholder="e.g., 2020"
                  />
                  {errors.carYear && <p className="text-red-500 text-sm">{errors.carYear}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Color *</label>
                  <input
                    type="text"
                    name="carColor"
                    value={formData.carColor}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.carColor ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    placeholder="e.g., White, Black, Silver"
                  />
                  {errors.carColor && <p className="text-red-500 text-sm">{errors.carColor}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Mileage *</label>
                  <input
                    type="number"
                    name="mileage"
                    value={formData.mileage}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.mileage ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    placeholder="Current mileage"
                  />
                  {errors.mileage && <p className="text-red-500 text-sm">{errors.mileage}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">VIN Number *</label>
                  <input
                    type="text"
                    name="vin"
                    value={formData.vin}
                    onChange={handleChange}
                    maxLength={17}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.vin ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    placeholder="17-character VIN"
                  />
                  {errors.vin && <p className="text-red-500 text-sm">{errors.vin}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">License Plate *</label>
                  <input
                    type="text"
                    name="licensePlate"
                    value={formData.licensePlate}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.licensePlate ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    placeholder="License plate number"
                  />
                  {errors.licensePlate && <p className="text-red-500 text-sm">{errors.licensePlate}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Fuel Type</label>
                  <select
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="gasoline">Gasoline</option>
                    <option value="diesel">Diesel</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="electric">Electric</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Transmission</label>
                  <select
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                    <option value="cvt">CVT</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-between pt-6 border-t">
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="ml-auto px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next Step
              </button>
            </div>
          </>
        )}

        {/* Step 3: Inspection Details */}
        {currentStep === 3 && (
          <>
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-gray-900">Inspection Details</h3>
                <p className="text-gray-600">When and where should we inspect your vehicle?</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <MapPin className="h-4 w-4" />
                    <span>Street Address *</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    placeholder="Street address where vehicle is located"
                  />
                  {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.city ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    placeholder="City"
                  />
                  {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.state ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    placeholder="State"
                  />
                  {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">ZIP Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.zipCode ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    placeholder="ZIP Code"
                  />
                  {errors.zipCode && <p className="text-red-500 text-sm">{errors.zipCode}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Inspection Purpose</label>
                  <select
                    name="inspectionPurpose"
                    value={formData.inspectionPurpose}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="pre-purchase">Pre-Purchase Inspection</option>
                    <option value="insurance">Insurance Claim</option>
                    <option value="maintenance">Routine Maintenance</option>
                    <option value="resale">Pre-Sale Inspection</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-between pt-6 border-t">
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="ml-auto px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next Step
              </button>
            </div>
          </>
        )}

        {/* Step 4: Additional Information */}
        {currentStep === 4 && (
          <>
            <div className="space-y-6">
              <div className="text-center mb-6">
                <FileText className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-gray-900">Additional Information</h3>
                <p className="text-gray-600">Help us provide the best inspection service</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Previous Accidents</label>
                  <select
                    name="previousAccidents"
                    value={formData.previousAccidents}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Maintenance History</label>
                  <select
                    name="maintenanceHistory"
                    value={formData.maintenanceHistory}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="regular">Regular Maintenance</option>
                    <option value="irregular">Irregular Maintenance</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <AlertCircle className="h-4 w-4" />
                    <span>Specific Concerns or Issues</span>
                  </label>
                  <textarea
                    name="specificConcerns"
                    value={formData.specificConcerns}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    placeholder="Any specific issues, noises, or concerns you'd like us to focus on..."
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-gray-700">Special Requests</label>
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    placeholder="Any special requests or requirements..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Emergency Contact Name</label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Emergency contact person"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Emergency Contact Phone</label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Emergency contact phone"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-between pt-6 border-t">
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="ml-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-8 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Proceed to Payment</span>
                )}
              </button>
            </div>
          </>
        )}
        <p className="text-center text-sm text-gray-500 mt-4">
          Secure payment processing through PayPal. Your inspection will be scheduled after payment confirmation.
        </p>
      </form>
    </div>
  );
};

export default BookingForm;