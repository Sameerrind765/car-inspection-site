const express = require('express');
const router = express.Router();
const { models } = require('../config/database');

// Get dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const stats = await models.getDashboardStats();
    
    const dashboardData = {
      totalBookings: stats.totalBookings[0]?.count || 0,
      totalRevenue: stats.totalRevenue[0]?.total || 0,
      completedBookings: stats.completedBookings[0]?.count || 0,
      pendingBookings: stats.pendingBookings[0]?.count || 0,
      monthlyRevenue: stats.monthlyRevenue[0]?.total || 0,
      recentBookings: stats.recentBookings || []
    };
    
    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    });
  }
});

// Get all bookings with pagination
router.get('/bookings', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status;
    const search = req.query.search;
    
    let query = 'SELECT * FROM booking_summary WHERE 1=1';
    let params = [];
    
    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }
    
    if (search) {
      query += ' AND (customer_name LIKE ? OR customer_email LIKE ? OR booking_reference LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const result = await executeQuery(query, params);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        pagination: {
          page,
          limit,
          total: result.data.length
        }
      });
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings'
    });
  }
});

// Get single booking details
router.get('/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await models.findBookingByReference(id);
    
    if (result.success && result.data) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch booking details'
    });
  }
});

// Update booking status
router.put('/bookings/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'assigned', 'in-progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }
    
    const result = await models.updateBookingStatus(id, status);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Booking status updated successfully'
      });
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update booking status'
    });
  }
});

// Get revenue analytics
router.get('/analytics/revenue', async (req, res) => {
  try {
    const period = req.query.period || 'month'; // day, week, month, year
    
    let query;
    switch (period) {
      case 'day':
        query = `
          SELECT DATE(created_at) as date, SUM(total_amount) as revenue, COUNT(*) as bookings
          FROM bookings 
          WHERE payment_status = 'paid' 
          AND created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
          GROUP BY DATE(created_at)
          ORDER BY date DESC
        `;
        break;
      case 'week':
        query = `
          SELECT YEARWEEK(created_at) as week, SUM(total_amount) as revenue, COUNT(*) as bookings
          FROM bookings 
          WHERE payment_status = 'paid' 
          AND created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 WEEK)
          GROUP BY YEARWEEK(created_at)
          ORDER BY week DESC
        `;
        break;
      case 'month':
        query = `
          SELECT DATE_FORMAT(created_at, '%Y-%m') as month, SUM(total_amount) as revenue, COUNT(*) as bookings
          FROM bookings 
          WHERE payment_status = 'paid' 
          AND created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
          GROUP BY DATE_FORMAT(created_at, '%Y-%m')
          ORDER BY month DESC
        `;
        break;
      default:
        query = `
          SELECT YEAR(created_at) as year, SUM(total_amount) as revenue, COUNT(*) as bookings
          FROM bookings 
          WHERE payment_status = 'paid'
          GROUP BY YEAR(created_at)
          ORDER BY year DESC
        `;
    }
    
    const result = await executeQuery(query);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch revenue analytics'
    });
  }
});

// Export bookings data
router.get('/export/bookings', async (req, res) => {
  try {
    const format = req.query.format || 'json'; // json, csv
    const result = await models.getAllBookings();
    
    if (result.success) {
      if (format === 'csv') {
        // Convert to CSV format
        const csv = convertToCSV(result.data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=bookings.csv');
        res.send(csv);
      } else {
        res.json({
          success: true,
          data: result.data
        });
      }
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Export bookings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export bookings'
    });
  }
});

// Helper function to convert data to CSV
function convertToCSV(data) {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Escape commas and quotes in CSV
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
}

module.exports = router;