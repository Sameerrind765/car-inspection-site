import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Calendar, 
  Users, 
  DollarSign, 
  Bell, 
  Settings, 
  Search,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  Navigation,
  Camera,
  FileText,
  MapPin,
  Star,
  Award,
  Activity,
  Home
} from 'lucide-react';

interface Booking {
  id: string;
  customerName: string;
  vehicleInfo: string;
  date: string;
  time: string;
  address: string;
  packageType: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed';
  price: number;
  phone: string;
  email: string;
  concerns?: string;
}

const MobileApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState(3);

  // Mock data
  useEffect(() => {
    const mockBookings: Booking[] = [
      {
        id: 'AC123456',
        customerName: 'John Smith',
        vehicleInfo: '2020 Toyota Camry',
        date: '2025-01-20',
        time: '10:00 AM',
        address: '123 Main St, Los Angeles, CA',
        packageType: 'Standard',
        status: 'confirmed',
        price: 85,
        phone: '+1-555-0123',
        email: 'john@example.com',
        concerns: 'Strange noise from engine'
      },
      {
        id: 'AC123457',
        customerName: 'Sarah Johnson',
        vehicleInfo: '2019 Honda Civic',
        date: '2025-01-21',
        time: '2:00 PM',
        address: '456 Oak Ave, San Francisco, CA',
        packageType: 'Premium',
        status: 'in-progress',
        price: 150,
        phone: '+1-555-0124',
        email: 'sarah@example.com'
      },
      {
        id: 'AC123458',
        customerName: 'Mike Davis',
        vehicleInfo: '2021 Ford F-150',
        date: '2025-01-22',
        time: '9:00 AM',
        address: '789 Pine St, San Diego, CA',
        packageType: 'Basic',
        status: 'pending',
        price: 45,
        phone: '+1-555-0125',
        email: 'mike@example.com'
      },
      {
        id: 'AC123459',
        customerName: 'Emily Wilson',
        vehicleInfo: '2022 BMW X5',
        date: '2025-01-23',
        time: '11:00 AM',
        address: '321 Elm St, Seattle, WA',
        packageType: 'Premium',
        status: 'completed',
        price: 150,
        phone: '+1-555-0126',
        email: 'emily@example.com'
      }
    ];
    setBookings(mockBookings);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'confirmed': return 'bg-yellow-500';
      case 'pending': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in-progress': return <Settings className="h-4 w-4 animate-spin" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const todayBookings = bookings.filter(b => b.date === '2025-01-20');
  const totalRevenue = bookings.reduce((sum, b) => sum + b.price, 0);
  const completedToday = bookings.filter(b => b.status === 'completed' && b.date === '2025-01-20').length;

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <Car className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Inspector Mobile</h1>
              <p className="text-green-100 text-sm">AutoCheckUSA Field App</p>
            </div>
          </div>
          <div className="relative">
            <Bell className="h-6 w-6" />
            {notifications > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {notifications}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-20">
        {activeTab === 'dashboard' && (
          <div className="p-4 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Today</p>
                    <p className="text-xl font-bold text-blue-600">{todayBookings.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-500 p-2 rounded-lg">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Revenue</p>
                    <p className="text-xl font-bold text-green-600">${totalRevenue}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Your Performance</h3>
                <Award className="h-6 w-6" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{bookings.length}</p>
                  <p className="text-sm text-purple-100">Total Jobs</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">4.9</p>
                  <p className="text-sm text-purple-100">Rating</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{completedToday}</p>
                  <p className="text-sm text-purple-100">Completed</p>
                </div>
              </div>
            </div>

            {/* Today's Schedule */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Today's Schedule</h2>
              <div className="space-y-3">
                {todayBookings.map((booking) => (
                  <div key={booking.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(booking.status)}`}></div>
                        <span className="font-medium text-gray-900">{booking.time}</span>
                      </div>
                      <span className="text-sm text-gray-500">{booking.packageType}</span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900">{booking.customerName}</h3>
                    <p className="text-sm text-gray-600">{booking.vehicleInfo}</p>
                    <p className="text-sm text-gray-500 mt-1 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {booking.address}
                    </p>
                    
                    {booking.concerns && (
                      <div className="mt-2 p-2 bg-yellow-50 rounded-lg">
                        <p className="text-xs text-yellow-800">
                          <strong>Concerns:</strong> {booking.concerns}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold text-green-600">${booking.price}</span>
                      <div className="flex space-x-2">
                        <button className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600">
                          <Phone className="h-4 w-4" />
                        </button>
                        <button className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600">
                          <Navigation className="h-4 w-4" />
                        </button>
                        <button className="bg-purple-500 text-white p-2 rounded-lg hover:bg-purple-600">
                          <Camera className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">All Bookings</h2>
              <div className="relative">
                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">#{booking.id}</span>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(booking.status)}
                      <span className="text-sm capitalize text-gray-600">{booking.status}</span>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900">{booking.customerName}</h3>
                  <p className="text-sm text-gray-600">{booking.vehicleInfo}</p>
                  <p className="text-sm text-gray-500">{booking.date} at {booking.time}</p>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {booking.address}
                  </p>
                  
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-green-600">${booking.price}</span>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'inspection' && (
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Inspection Tools</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center hover:bg-blue-100 transition-colors">
                <Camera className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-blue-600">Take Photos</span>
              </button>
              
              <button className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center hover:bg-green-100 transition-colors">
                <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-green-600">Create Report</span>
              </button>
              
              <button className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center hover:bg-yellow-100 transition-colors">
                <CheckCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-yellow-600">Checklist</span>
              </button>
              
              <button className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 text-center hover:bg-purple-100 transition-colors">
                <Settings className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-purple-600">Settings</span>
              </button>
            </div>

            {/* Inspection Checklist */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Inspection Checklist</h3>
              <div className="space-y-2">
                {[
                  'Engine Performance',
                  'Brake System',
                  'Tire Condition',
                  'Fluid Levels',
                  'Battery & Electrical',
                  'Safety Features'
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">
                  Start New Inspection
                </button>
                <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200">
                  View Templates
                </button>
                <button className="w-full bg-green-100 text-green-700 py-3 rounded-lg font-medium hover:bg-green-200">
                  Upload Photos
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="p-4">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">John Inspector</h2>
              <p className="text-gray-600">ASE Certified Technician</p>
              <div className="flex items-center justify-center mt-2">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm text-gray-600 ml-1">4.9 Rating</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{bookings.length}</p>
                    <p className="text-sm text-gray-600">Total Inspections</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">${totalRevenue}</p>
                    <p className="text-sm text-gray-600">Total Earnings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">4.9</p>
                    <p className="text-sm text-gray-600">Average Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">98%</p>
                    <p className="text-sm text-gray-600">Completion Rate</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <button className="w-full bg-gray-50 text-gray-700 py-3 rounded-lg font-medium text-left px-4 flex items-center justify-between hover:bg-gray-100">
                  <span>Account Settings</span>
                  <Settings className="h-5 w-5" />
                </button>
                <button className="w-full bg-gray-50 text-gray-700 py-3 rounded-lg font-medium text-left px-4 flex items-center justify-between hover:bg-gray-100">
                  <span>Notifications</span>
                  <Bell className="h-5 w-5" />
                </button>
                <button className="w-full bg-gray-50 text-gray-700 py-3 rounded-lg font-medium text-left px-4 flex items-center justify-between hover:bg-gray-100">
                  <span>Help & Support</span>
                  <FileText className="h-5 w-5" />
                </button>
                <button className="w-full bg-gray-50 text-gray-700 py-3 rounded-lg font-medium text-left px-4 flex items-center justify-between hover:bg-gray-100">
                  <span>Performance Reports</span>
                  <Activity className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="mt-6 space-y-2">
              <a 
                href="/dashboard" 
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium text-center block hover:bg-blue-700"
              >
                Business Dashboard
              </a>
              <a 
                href="/admin" 
                className="w-full bg-red-600 text-white py-3 rounded-lg font-medium text-center block hover:bg-red-700"
              >
                Admin Panel
              </a>
              <a 
                href="/" 
                className="w-full bg-gray-600 text-white py-3 rounded-lg font-medium text-center block hover:bg-gray-700"
              >
                Main Website
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 shadow-lg">
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`p-4 text-center ${activeTab === 'dashboard' ? 'text-green-600 bg-green-50' : 'text-gray-600'}`}
          >
            <Home className="h-5 w-5 mx-auto mb-1" />
            <span className="text-xs">Dashboard</span>
          </button>
          
          <button
            onClick={() => setActiveTab('bookings')}
            className={`p-4 text-center ${activeTab === 'bookings' ? 'text-green-600 bg-green-50' : 'text-gray-600'}`}
          >
            <Calendar className="h-5 w-5 mx-auto mb-1" />
            <span className="text-xs">Bookings</span>
          </button>
          
          <button
            onClick={() => setActiveTab('inspection')}
            className={`p-4 text-center ${activeTab === 'inspection' ? 'text-green-600 bg-green-50' : 'text-gray-600'}`}
          >
            <CheckCircle className="h-5 w-5 mx-auto mb-1" />
            <span className="text-xs">Inspect</span>
          </button>
          
          <button
            onClick={() => setActiveTab('profile')}
            className={`p-4 text-center ${activeTab === 'profile' ? 'text-green-600 bg-green-50' : 'text-gray-600'}`}
          >
            <Users className="h-5 w-5 mx-auto mb-1" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileApp;