import { Package } from '../types';

export const inspectionPackages: Package[] = [
  {
    id: 'basic',
    name: 'Basic Inspection',
    price: 45,
    originalPrice: 60,
    description: 'Essential safety and mechanical check',
    duration: '1-2 hours',
    features: [
      'Engine Performance Check',
      'Brake System Inspection',
      'Tire Condition Assessment',
      'Fluid Levels Check',
      'Battery & Electrical Test',
      'Basic Safety Features',
      'Digital Report within 24hrs',
      '30-day Report Validity'
    ]
  },
  {
    id: 'standard',
    name: 'Standard Inspection',
    price: 85,
    originalPrice: 110,
    description: 'Comprehensive vehicle evaluation',
    duration: '2-3 hours',
    popular: true,
    features: [
      'Everything in Basic Package',
      'Transmission Inspection',
      'Suspension & Steering Check',
      'Air Conditioning System',
      'Exhaust System Analysis',
      'Interior & Exterior Assessment',
      'Road Test Evaluation',
      'Detailed Photo Documentation',
      'Priority Scheduling',
      '60-day Report Validity'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Inspection',
    price: 150,
    originalPrice: 200,
    description: 'Complete diagnostic evaluation',
    duration: '3-4 hours',
    features: [
      'Everything in Standard Package',
      'Advanced Diagnostic Scan',
      'Engine Compression Test',
      'Cooling System Pressure Test',
      'Paint & Body Condition Report',
      'Market Value Assessment',
      'Maintenance History Review',
      'Same-day Report Delivery',
      'Phone Consultation Included',
      '90-day Report Validity',
      'Free Re-inspection (if needed)'
    ]
  }
];