const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'AutoTrustReport',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Execute query with error handling
async function executeQuery(query, params = []) {
  try {
    const [results] = await pool.execute(query, params);
    return { success: true, data: results };
  } catch (error) {
    console.error('Database query error:', error);
    return { success: false, error: error.message };
  }
}

// Get single record
async function findOne(query, params = []) {
  const result = await executeQuery(query, params);
  if (result.success && result.data.length > 0) {
    return { success: true, data: result.data[0] };
  }
  return { success: false, data: null };
}

// Insert record and return ID
async function insertRecord(table, data) {
  const fields = Object.keys(data);
  const values = Object.values(data);
  const placeholders = fields.map(() => '?').join(', ');
  
  const query = `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`;
  
  try {
    const [result] = await pool.execute(query, values);
    return { success: true, insertId: result.insertId };
  } catch (error) {
    console.error('Insert error:', error);
    return { success: false, error: error.message };
  }
}

// Update record
async function updateRecord(table, data, whereClause, whereParams = []) {
  const fields = Object.keys(data);
  const values = Object.values(data);
  const setClause = fields.map(field => `${field} = ?`).join(', ');
  
  const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
  
  try {
    const [result] = await pool.execute(query, [...values, ...whereParams]);
    return { success: true, affectedRows: result.affectedRows };
  } catch (error) {
    console.error('Update error:', error);
    return { success: false, error: error.message };
  }
}

// Delete record
async function deleteRecord(table, whereClause, whereParams = []) {
  const query = `DELETE FROM ${table} WHERE ${whereClause}`;
  
  try {
    const [result] = await pool.execute(query, whereParams);
    return { success: true, affectedRows: result.affectedRows };
  } catch (error) {
    console.error('Delete error:', error);
    return { success: false, error: error.message };
  }
}

// Database models
const models = {
  // Users
  async createUser(userData) {
    return await insertRecord('users', userData);
  },
  
  async findUserByEmail(email) {
    return await findOne('SELECT * FROM users WHERE email = ?', [email]);
  },
  
  // Customers
  async createCustomer(customerData) {
    return await insertRecord('customers', customerData);
  },
  
  // Vehicles
  async createVehicle(vehicleData) {
    return await insertRecord('vehicles', vehicleData);
  },
  
  async findVehicleByVin(vin) {
    return await findOne('SELECT * FROM vehicles WHERE vin = ?', [vin]);
  },
  
  // Bookings
  async createBooking(bookingData) {
    return await insertRecord('bookings', bookingData);
  },
  
  async findBookingByReference(reference) {
    return await findOne(`
      SELECT b.*, 
             CONCAT(u.first_name, ' ', u.last_name) as customer_name,
             u.email as customer_email,
             u.phone as customer_phone,
             CONCAT(v.year, ' ', v.make, ' ', v.model) as vehicle_info,
             p.name as package_name
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      JOIN users u ON c.user_id = u.id
      JOIN vehicles v ON b.vehicle_id = v.id
      JOIN inspection_packages p ON b.package_id = p.id
      WHERE b.booking_reference = ?
    `, [reference]);
  },
  
  async getAllBookings() {
    return await executeQuery(`
      SELECT * FROM booking_summary 
      ORDER BY created_at DESC
    `);
  },
  
  async updateBookingStatus(bookingId, status) {
    return await updateRecord('bookings', { status }, 'id = ?', [bookingId]);
  },
  
  // Payments
  async createPayment(paymentData) {
    return await insertRecord('payments', paymentData);
  },
  
  async updatePaymentStatus(paymentId, status, transactionId = null) {
    const updateData = { status };
    if (transactionId) updateData.transaction_id = transactionId;
    if (status === 'completed') updateData.payment_date = new Date();
    
    return await updateRecord('payments', updateData, 'id = ?', [paymentId]);
  },
  
  // Packages
  async getAllPackages() {
    return await executeQuery('SELECT * FROM inspection_packages WHERE is_active = TRUE ORDER BY price ASC');
  },
  
  async findPackageById(id) {
    return await findOne('SELECT * FROM inspection_packages WHERE id = ?', [id]);
  },
  
  // Reports
  async createInspectionReport(reportData) {
    return await insertRecord('inspection_reports', reportData);
  },
  
  // Analytics
  async getDashboardStats() {
    const queries = {
      totalBookings: 'SELECT COUNT(*) as count FROM bookings',
      totalRevenue: 'SELECT SUM(total_amount) as total FROM bookings WHERE payment_status = "paid"',
      completedBookings: 'SELECT COUNT(*) as count FROM bookings WHERE status = "completed"',
      pendingBookings: 'SELECT COUNT(*) as count FROM bookings WHERE status IN ("pending", "confirmed")',
      monthlyRevenue: `
        SELECT SUM(total_amount) as total 
        FROM bookings 
        WHERE payment_status = "paid" 
        AND MONTH(created_at) = MONTH(CURRENT_DATE())
        AND YEAR(created_at) = YEAR(CURRENT_DATE())
      `,
      recentBookings: `
        SELECT * FROM booking_summary 
        ORDER BY created_at DESC 
        LIMIT 10
      `
    };
    
    const results = {};
    for (const [key, query] of Object.entries(queries)) {
      const result = await executeQuery(query);
      results[key] = result.success ? result.data : [];
    }
    
    return results;
  }
};

module.exports = {
  pool,
  testConnection,
  executeQuery,
  findOne,
  insertRecord,
  updateRecord,
  deleteRecord,
  models
};