-- AutoCheckUSA Database Schema
-- Complete database structure for car inspection booking system

-- Create database
CREATE DATABASE IF NOT EXISTS autocheckusa;
USE autocheckusa;

-- Users table for authentication
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'inspector', 'customer') DEFAULT 'customer',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Customers table
CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    alternate_phone VARCHAR(20),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    preferred_communication ENUM('email', 'phone', 'sms') DEFAULT 'email',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Inspectors table
CREATE TABLE inspectors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    license_number VARCHAR(50),
    certification_type VARCHAR(100),
    experience_years INT,
    specializations JSON,
    service_areas JSON,
    hourly_rate DECIMAL(10,2),
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_inspections INT DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Vehicles table
CREATE TABLE vehicles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    color VARCHAR(30),
    vin VARCHAR(17) UNIQUE,
    license_plate VARCHAR(20),
    mileage INT,
    fuel_type ENUM('gasoline', 'diesel', 'hybrid', 'electric', 'other') DEFAULT 'gasoline',
    transmission ENUM('automatic', 'manual', 'cvt') DEFAULT 'automatic',
    engine_size VARCHAR(20),
    body_type VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Inspection packages table
CREATE TABLE inspection_packages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    duration_hours DECIMAL(3,1),
    features JSON,
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_reference VARCHAR(20) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    inspector_id INT,
    package_id INT NOT NULL,
    
    -- Scheduling
    scheduled_date DATETIME NOT NULL,
    time_preference ENUM('morning', 'afternoon', 'evening', 'flexible') DEFAULT 'flexible',
    estimated_duration DECIMAL(3,1),
    
    -- Location
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Inspection details
    inspection_purpose ENUM('pre-purchase', 'insurance', 'maintenance', 'resale', 'other') NOT NULL,
    specific_concerns TEXT,
    previous_accidents ENUM('yes', 'no', 'unknown') DEFAULT 'unknown',
    maintenance_history ENUM('regular', 'irregular', 'unknown') DEFAULT 'unknown',
    special_requests TEXT,
    
    -- Status and pricing
    status ENUM('pending', 'confirmed', 'assigned', 'in-progress', 'completed', 'cancelled') DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status ENUM('pending', 'paid', 'refunded', 'failed') DEFAULT 'pending',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (inspector_id) REFERENCES inspectors(id),
    FOREIGN KEY (package_id) REFERENCES inspection_packages(id)
);

-- Payments table
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    payment_method ENUM('paypal', 'stripe', 'cash', 'check') NOT NULL,
    transaction_id VARCHAR(100),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    payment_date TIMESTAMP NULL,
    refund_date TIMESTAMP NULL,
    refund_amount DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- Inspection reports table
CREATE TABLE inspection_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    inspector_id INT NOT NULL,
    
    -- Overall assessment
    overall_condition ENUM('excellent', 'good', 'fair', 'poor') NOT NULL,
    overall_score INT CHECK (overall_score >= 0 AND overall_score <= 100),
    recommended_action ENUM('buy', 'negotiate', 'avoid', 'repair_first') NOT NULL,
    estimated_repair_cost DECIMAL(10,2),
    market_value_estimate DECIMAL(10,2),
    
    -- Detailed findings
    engine_condition JSON,
    transmission_condition JSON,
    brake_system JSON,
    suspension_steering JSON,
    electrical_system JSON,
    body_exterior JSON,
    interior_condition JSON,
    safety_features JSON,
    
    -- Summary
    major_issues JSON,
    minor_issues JSON,
    recommendations TEXT,
    inspector_notes TEXT,
    
    -- Report metadata
    inspection_date TIMESTAMP NOT NULL,
    report_generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    report_version VARCHAR(10) DEFAULT '1.0',
    
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (inspector_id) REFERENCES inspectors(id)
);

-- Inspection photos table
CREATE TABLE inspection_photos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    report_id INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INT,
    description TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES inspection_reports(id) ON DELETE CASCADE
);

-- Reviews and ratings table
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    customer_id INT NOT NULL,
    inspector_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    service_quality_rating INT CHECK (service_quality_rating >= 1 AND service_quality_rating <= 5),
    timeliness_rating INT CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
    communication_rating INT CHECK (communication_rating >= 1 AND communication_rating <= 5),
    would_recommend BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (inspector_id) REFERENCES inspectors(id)
);

-- Notifications table
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('booking_confirmed', 'inspector_assigned', 'inspection_completed', 'payment_received', 'reminder') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    related_booking_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (related_booking_id) REFERENCES bookings(id)
);

-- System settings table
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default inspection packages
INSERT INTO inspection_packages (name, description, price, original_price, duration_hours, features, is_popular) VALUES
('Basic Inspection', 'Essential safety and mechanical check', 45.00, 60.00, 1.5, 
 '["Engine Performance Check", "Brake System Inspection", "Tire Condition Assessment", "Fluid Levels Check", "Battery & Electrical Test", "Basic Safety Features", "Digital Report within 24hrs", "30-day Report Validity"]', 
 FALSE),

('Standard Inspection', 'Comprehensive vehicle evaluation', 85.00, 110.00, 2.5, 
 '["Everything in Basic Package", "Transmission Inspection", "Suspension & Steering Check", "Air Conditioning System", "Exhaust System Analysis", "Interior & Exterior Assessment", "Road Test Evaluation", "Detailed Photo Documentation", "Priority Scheduling", "60-day Report Validity"]', 
 TRUE),

('Premium Inspection', 'Complete diagnostic evaluation', 150.00, 200.00, 3.5, 
 '["Everything in Standard Package", "Advanced Diagnostic Scan", "Engine Compression Test", "Cooling System Pressure Test", "Paint & Body Condition Report", "Market Value Assessment", "Maintenance History Review", "Same-day Report Delivery", "Phone Consultation Included", "90-day Report Validity", "Free Re-inspection (if needed)"]', 
 FALSE);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('business_hours_start', '08:00', 'Business hours start time'),
('business_hours_end', '18:00', 'Business hours end time'),
('booking_advance_days', '1', 'Minimum days in advance for booking'),
('max_booking_days', '30', 'Maximum days in advance for booking'),
('default_inspection_duration', '2.0', 'Default inspection duration in hours'),
('service_radius_miles', '50', 'Service radius in miles'),
('email_notifications_enabled', 'true', 'Enable email notifications'),
('sms_notifications_enabled', 'false', 'Enable SMS notifications');

-- Create indexes for better performance
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_inspector ON bookings(inspector_id);
CREATE INDEX idx_bookings_date ON bookings(scheduled_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_vehicles_vin ON vehicles(vin);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_reports_booking ON inspection_reports(booking_id);
CREATE INDEX idx_photos_report ON inspection_photos(report_id);
CREATE INDEX idx_reviews_inspector ON reviews(inspector_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);

-- Create views for common queries
CREATE VIEW booking_summary AS
SELECT 
    b.id,
    b.booking_reference,
    CONCAT(u.first_name, ' ', u.last_name) as customer_name,
    u.email as customer_email,
    u.phone as customer_phone,
    CONCAT(v.year, ' ', v.make, ' ', v.model) as vehicle_info,
    v.vin,
    p.name as package_name,
    p.price as package_price,
    b.scheduled_date,
    b.status,
    b.payment_status,
    b.total_amount,
    b.created_at
FROM bookings b
JOIN customers c ON b.customer_id = c.id
JOIN users u ON c.user_id = u.id
JOIN vehicles v ON b.vehicle_id = v.id
JOIN inspection_packages p ON b.package_id = p.id;

CREATE VIEW inspector_performance AS
SELECT 
    i.id,
    CONCAT(u.first_name, ' ', u.last_name) as inspector_name,
    i.total_inspections,
    i.rating,
    COUNT(b.id) as current_month_bookings,
    AVG(r.rating) as current_month_rating,
    SUM(b.total_amount) as current_month_revenue
FROM inspectors i
JOIN users u ON i.user_id = u.id
LEFT JOIN bookings b ON i.id = b.inspector_id 
    AND b.scheduled_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
LEFT JOIN reviews r ON i.id = r.inspector_id 
    AND r.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
GROUP BY i.id, u.first_name, u.last_name, i.total_inspections, i.rating;