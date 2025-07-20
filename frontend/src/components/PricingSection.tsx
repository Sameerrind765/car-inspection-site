import React from 'react';
import { Check, Star, Clock, Shield } from 'lucide-react';
import { Package } from '../types';
import { inspectionPackages } from '../data/packages';

interface PricingSectionProps {
  selectedPackage: string;
  onPackageSelect: (packageId: string) => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({ selectedPackage, onPackageSelect }) => {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Inspection Package
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional car inspection services tailored to your needs. All packages include certified technician evaluation and detailed reporting.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {inspectionPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer ${
                selectedPackage === pkg.id
                  ? 'border-blue-500 ring-4 ring-blue-100'
                  : pkg.popular
                  ? 'border-orange-400'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => onPackageSelect(pkg.id)}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <Star className="h-4 w-4" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Package Header */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                  <p className="text-gray-600 mb-4">{pkg.description}</p>
                  
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    {pkg.originalPrice && (
                      <span className="text-2xl text-gray-400 line-through">${pkg.originalPrice}</span>
                    )}
                    <span className="text-4xl font-bold text-blue-600">${pkg.price}</span>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{pkg.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Shield className="h-4 w-4" />
                      <span>Certified</span>
                    </div>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  {pkg.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Selection Indicator */}
                <div className="text-center">
                  <div
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                      selectedPackage === pkg.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {selectedPackage === pkg.id ? 'Selected Package' : 'Select Package'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-3 rounded-full mb-3">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Certified Inspectors</h4>
              <p className="text-sm text-gray-600">ASE-certified professionals</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-green-100 p-3 rounded-full mb-3">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900">100% Satisfaction</h4>
              <p className="text-sm text-gray-600">Money-back guarantee</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-orange-100 p-3 rounded-full mb-3">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Fast Service</h4>
              <p className="text-sm text-gray-600">Same-day scheduling</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-purple-100 p-3 rounded-full mb-3">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900">5-Star Rated</h4>
              <p className="text-sm text-gray-600">Trusted by thousands</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;