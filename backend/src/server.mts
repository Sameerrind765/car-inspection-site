import express from "express";
import type { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { google } from "googleapis";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { JWT } from "google-auth-library";
import sendmailTransport from "nodemailer/lib/sendmail-transport/index.js";

dotenv.config();

const decoded = Buffer.from(
  process.env.GOOGLE_SERVICE_ACCOUNT_BASE64!,
  "base64"
).toString("utf8");

const credentials = JSON.parse(decoded);
console.log("KEY START:", credentials.private_key.slice(0, 50));

const auth = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

// Type definitions
export type PackageType = "basic" | "standard" | "premium";

interface Booking {
  name: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  carMake: string;
  carModel: string;
  carColor: string;
  carYear: string;
  address: string;
  city: string;
  zipCode: string;
  state: string;
  transmission: "automatic" | "manual" | "cvt";
  fuelType: "gasoline" | "diesel" | "electric";
  licensePlate: string;
  vin: string;
  mileage: string;
  maintenanceHistory: "regular" | "irregular";
  previousAccidents: "yes" | "no";
  inspectionPurpose: "pre-purchase" | "insurance" | "routine";
  preferredInspector?: string;
  timePreference: "morning" | "evening" | "flexible";
  specialRequests?: string;
  specificConcerns?: string;
  emergencyContact: string;
  packageType: PackageType;
  date: string;
  paymentStatus: string;
  transactionId?: string;
}

const app: Application = express();
app.use(cors());
app.use(bodyParser.json());
const SHEET_ID = process.env.SPREADSHEET_API;

const bookings: Booking[] = [];

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const packages: Record<PackageType, { price: number; name: string }> = {
  basic: { price: 100, name: "Basic" },
  standard: { price: 200, name: "Standard" },
  premium: { price: 300, name: "Premium" },
};

async function appendToSheet(booking: Booking) {
  // const client = await auth.getClient(); // Get authenticated client
  const sheets = google.sheets({
    version: "v4",
    auth, // ✅ This is a valid JWT client, type-safe
  });

  const values = [
    [
      booking.name,
      booking.email,
      booking.phone,
      booking.alternatePhone || "",
      booking.carMake,
      booking.carModel,
      booking.carColor,
      booking.carYear,
      booking.address,
      booking.city,
      booking.state,
      booking.zipCode,
      booking.licensePlate,
      booking.vin,
      booking.transmission,
      booking.fuelType,
      booking.mileage,
      booking.maintenanceHistory,
      booking.previousAccidents,
      booking.inspectionPurpose,
      booking.preferredInspector || "",
      booking.timePreference,
      booking.specialRequests || "",
      booking.specificConcerns || "",
      booking.emergencyContact,
      booking.packageType,
      booking.date,
      booking.paymentStatus,
      booking.transactionId || "",
      new Date(),
    ],
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "Sheet1!A1",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values,
    },
  });
}

app.get('/api/debug-env', (req, res) => {
  res.json({
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
    firstLineOfKey: process.env.GOOGLE_PRIVATE_KEY?.slice(0, 30)
  });
});


app.post("/api/bookings", async (req: Request, res: Response) => {
  const booking: Booking = req.body;
  bookings.push(booking);

  try {
    await appendToSheet(booking);
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: booking.email,
      subject: "Booking Confirmation",
      text: `
Hi ${booking.name},

Thank you for submitting your vehicle inspection request. Your booking details have been received successfully.

Booking Summary:
- Name: ${booking.name}
- Email: ${booking.email}
- Phone: ${booking.phone}
- Car: ${booking.carYear} ${booking.carMake} ${booking.carModel}
- Inspection Date: ${booking.date}
- City: ${booking.city}
- ZIP Code: ${booking.zipCode}

If you haven’t already made a payment, you can do so here:
https://docs.google.com/spreadsheets/d/1JcBnYdKrzSBrxBq6dus7XuOV01rwwW5uvw_E0GzUQCo/edit?usp=sharing

One of our team members will reach out to confirm the next steps. If you have any questions, reply to this email.

Thank you again.

Best regards,  
The Inspection Team  
AutoCheck Us
`.trim(),
      html: `
  <div style="font-family: Arial, sans-serif; color: #1a202c; line-height: 1.6;">
    <h2 style="color: #2b6cb0;">We've Received Your Booking</h2>
    <p>Hi ${booking.name},</p>

    <p>Thank you for submitting your vehicle inspection request. Your booking details have been received successfully.</p>

    <h4>📄 Booking Summary:</h4>
    <ul>
      <li><strong>Name:</strong> ${booking.name}</li>
      <li><strong>Email:</strong> ${booking.email}</li>
      <li><strong>Phone:</strong> ${booking.phone}</li>
      <li><strong>Car:</strong> ${booking.carYear} ${booking.carMake} ${booking.carModel}</li>
      <li><strong>Inspection Date:</strong> ${booking.date}</li>
      <li><strong>City:</strong> ${booking.city}</li>
      <li><strong>ZIP Code:</strong> ${booking.zipCode}</li>
    </ul>

    <p>One of our team members will review your information and get in touch with you shortly to confirm the next steps.</p>

    <p>If you haven’t already made a payment, you can do so using the link below:</p>

    <p><a href="https://docs.google.com/spreadsheets/d/1JcBnYdKrzSBrxBq6dus7XuOV01rwwW5uvw_E0GzUQCo/edit?usp=sharing" style="color: #3182ce; text-decoration: underline;">🔗 Pay Now or Manage Your Booking</a></p>

    <p>If you have any questions, feel free to reply to this email or contact us directly.</p>

    <p>Thank you again — we look forward to assisting you.</p>

    <p style="margin-top: 2rem;">Warm regards,<br />
    The Inspection Team<br />
    AutoCheckUs</p>
  </div>
`,
    });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: `${[process.env.ADMIN]}, ${process.env.EMAIL_USER}`,
      subject: `📥 New Booking Received from ${booking.name}`,
      text: `
A new vehicle inspection booking has been submitted.

Customer Details:
- Name: ${booking.name}
- Email: ${booking.email}
- Phone: ${booking.phone}

Vehicle Details:
- Make & Model: ${booking.carMake} ${booking.carModel}
- Year: ${booking.carYear}
- Color: ${booking.carColor}
- Mileage: ${booking.mileage}
- VIN: ${booking.vin}
- License Plate: ${booking.licensePlate}

Inspection Details:
- Date: ${booking.date}
- Address: ${booking.address}
- City: ${booking.city}
- State: ${booking.state}
- ZIP Code: ${booking.zipCode}

Additional Info:
- Purpose: ${booking.inspectionPurpose}
- Concerns: ${booking.specificConcerns}
- Previous Accidents: ${booking.previousAccidents}
- Maintenance History: ${booking.maintenanceHistory}
- Special Requests: ${booking.specialRequests}
- Preferred Inspector: ${booking.preferredInspector}

Emergency Contact:
- Name: ${booking.emergencyContact}

🔗 View Full Submissions in Google Sheet:
${process.env.GOOGLE_SHEET_URL}

Please follow up with the customer as needed.
  `,
      html: `
  <div style="font-family: Arial, sans-serif; color: #1a202c; line-height: 1.5;">
    <h2 style="color: #2d3748;">📥 New Vehicle Inspection Booking</h2>
    
    <h3>Customer Info</h3>
    <ul>
      <li><strong>Name:</strong> ${booking.name}</li>
      <li><strong>Email:</strong> ${booking.email}</li>
      <li><strong>Phone:</strong> ${booking.phone}</li>
    </ul>

    <h3>Vehicle Info</h3>
    <ul>
      <li><strong>Make & Model:</strong> ${booking.carMake} ${
        booking.carModel
      }</li>
      <li><strong>Year:</strong> ${booking.carYear}</li>
      <li><strong>Color:</strong> ${booking.carColor}</li>
      <li><strong>Mileage:</strong> ${booking.mileage}</li>
      <li><strong>VIN:</strong> ${booking.vin}</li>
      <li><strong>License Plate:</strong> ${booking.licensePlate}</li>
    </ul>

    <h3>Inspection Details</h3>
    <ul>
      <li><strong>Date:</strong> ${booking.date}</li>
      <li><strong>Address:</strong> ${booking.address}, ${booking.city}, ${
        booking.state
      }, ${booking.zipCode}</li>
    </ul>

    <h3>Additional Info</h3>
    <ul>
      <li><strong>Purpose:</strong> ${booking.inspectionPurpose}</li>
      <li><strong>Concerns:</strong> ${booking.specificConcerns || "N/A"}</li>
      <li><strong>Previous Accidents:</strong> ${booking.previousAccidents}</li>
      <li><strong>Maintenance History:</strong> ${
        booking.maintenanceHistory
      }</li>
      <li><strong>Special Requests:</strong> ${
        booking.specialRequests || "None"
      }</li>
      <li><strong>Preferred Inspector:</strong> ${
        booking.preferredInspector || "N/A"
      }</li>
    </ul>

    <h3>Emergency Contact</h3>
    <ul>
      <li><strong>Name:</strong> ${booking.emergencyContact || "N/A"}</li>
    </ul>

    <p><strong>🔗 View Full Submissions in Google Sheet:</strong><br />
    <a href="https://docs.google.com/spreadsheets/d/1JcBnYdKrzSBrxBq6dus7XuOV01rwwW5uvw_E0GzUQCo/edit?usp=sharing" target="_blank" style="color: #3182ce;">Open Google Sheet</a></p>

    <p>Please follow up with the customer to confirm and take the next steps.</p>
  </div>
  `,
    });

    res.status(201).json({ message: "Booking saved and email sent." });
  } catch (error) {
    console.error("Error saving to Google Sheets:", error);
    res.status(500).json({ message: "Error saving booking" });
  }
});

app.get("/api/bookings", (req: Request, res: Response) => {
  res.json(bookings);
});

app.get("/api/package/:type", (req: Request, res: Response) => {
  const { type } = req.params;
  if (type in packages) {
    res.json(packages[type as PackageType]);
  } else {
    res.status(400).json({ message: "Invalid package type" });
  }
});

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error(error);
  res.status(500).json({ message: "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
