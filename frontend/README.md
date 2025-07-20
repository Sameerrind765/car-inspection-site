
# Car Insurance Booking Backend

This is the backend for a Car Insurance Booking web application. It provides RESTful APIs for handling car inspection bookings, sends email confirmations using Gmail SMTP, and stores booking data in a Google Spreadsheet.

## Features

- 📩 Email notifications on new bookings
- 📝 Saves booking details to Google Sheets
- 🌐 REST API built with Express and TypeScript
- 🔐 Environment-based configuration for sensitive data
- ✅ Supports basic, standard, and premium packages

---

## Technologies Used

- Node.js + Express
- TypeScript
- Nodemailer (for email)
- Google Sheets API (v4)
- dotenv
- Google Auth JWT client

---

## Environment Setup

1. **Clone the repository**

```bash
git clone https://github.com/sameerrind765/car-insurance-backend.git
cd car-insurance-backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Setup `.env` file**

Create a `.env` file in the root of your project:

```env
PORT=5000
EMAIL_USER=connect.sameerrind@gmail.com
EMAIL_PASS=your-app-password
SPREADSHEET_API=your-google-sheet-id
```

🛑 **Note**: For `EMAIL_PASS`, use an [App Password](https://support.google.com/accounts/answer/185833?hl=en) if 2FA is enabled on your Gmail account.

4. **Add Google Service Account**

- Create a service account from Google Cloud Console.
- Enable Google Sheets API.
- Download the service account JSON key file.
- Save it in `src/` as `google-service-account.json`.

5. **Share your Google Sheet**

- Share the sheet with your service account email (e.g., `your-service-account@your-project.iam.gserviceaccount.com`) with **Editor** access.

---

## Running the Server

```bash
npm run dev
```

It will run on `http://localhost:5000` by default.

---

## API Endpoints

### POST `/api/bookings`

Creates a new booking, sends an email, and appends to Google Sheet.

**Request Body:**
```json
{
  "name": "Ali",
  "email": "ali@example.com",
  "phone": "123456789",
  "alternatePhone": "12345678",
  "carMake": "Toyota",
  "carModel": "Corolla",
  "carColor": "Red",
  "carYear": "2020",
  "address": "123 Street",
  "city": "Lahore",
  "zipCode": "54000",
  "transmission": "automatic",
  "emergencyContact": "987654321",
  "packageType": "basic",
  "date": "2025-07-20",
  "paymentStatus": "paid"
}
```

### GET `/api/bookings`

Returns all stored bookings (in-memory only).

### GET `/api/package/:type`

Get pricing details for a package (`basic`, `standard`, `premium`).

---

## Deployment

You can deploy this project to:

- [Render](https://render.com)
- [Railway](https://railway.app)
- [Vercel (API)](https://vercel.com)
- [Fly.io](https://fly.io)

Make sure to upload your `.env` variables and `google-service-account.json` securely.

---

## License

MIT License

---

## Contact

Made with ❤️ by Sameer Rind  
📧 Email: connect.sameerrind@gmail.com