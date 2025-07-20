export interface FormData {
  // Personal Information
  name: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  
  // Vehicle Information
  carMake: string;
  carModel: string;
  carYear: string;
  carColor: string;
  mileage: string;
  vin: string;
  licensePlate: string;
  fuelType: 'gasoline' | 'diesel' | 'hybrid' | 'electric' | 'other';
  transmission: 'automatic' | 'manual' | 'cvt';
  
  // Inspection Details
  date: string;
  timePreference: 'morning' | 'afternoon' | 'evening' | 'flexible';
  address: string;
  city: string;
  state: string;
  zipCode: string;
  packageType: 'basic' | 'standard' | 'premium';
  
  // Purpose & Additional Info
  inspectionPurpose: 'pre-purchase' | 'insurance' | 'maintenance' | 'resale' | 'other';
  specificConcerns?: string;
  previousAccidents: 'yes' | 'no' | 'unknown';
  maintenanceHistory: 'regular' | 'irregular' | 'unknown';
  
  // Special Requirements
  specialRequests?: string;
  preferredInspector?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  features: string[];
  popular?: boolean;
  description: string;
  duration: string;
}

export interface BookingData extends FormData {
  bookingId: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  createdAt: string;
}