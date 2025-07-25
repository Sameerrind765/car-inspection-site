# AutoTrustReport Backend API

Professional car inspection booking service backend with PayPal integration.

## Features

- **Booking Management**: Create and manage car inspection bookings
- **PayPal Integration**: Secure payment processing
- **Email Notifications**: Automated confirmation emails
- **Package Management**: Support for multiple inspection packages
- **Admin Dashboard**: View all bookings and revenue

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Start Production Server**
   ```bash
   npm start
   ```

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Packages
- `GET /api/packages` - Get all inspection packages

### Payments
- `POST /api/pay/create-order` - Create PayPal order
- `POST /api/pay/capture-order` - Capture PayPal payment

### Bookings
- `POST /api/inspect` - Create new booking
- `GET /api/inspect/:bookingId` - Get booking by ID
- `GET /api/admin/bookings` - Get all bookings (admin)

## Configuration

### PayPal Setup
1. Create PayPal developer account
2. Create new application
3. Get Client ID and Secret
4. Add to .env file

### Email Setup (Gmail)
1. Enable 2-factor authentication
2. Generate app password
3. Add credentials to .env file

## Package Pricing

- **Basic**: $45 (Essential safety check)
- **Standard**: $85 (Comprehensive evaluation)
- **Premium**: $150 (Complete diagnostic)

## Production Deployment

1. Set NODE_ENV=production
2. Use production PayPal credentials
3. Configure proper database
4. Set up SSL certificates
5. Use process manager (PM2)

## Security Features

- CORS protection
- Input validation
- Secure payment processing
- Environment variable protection