import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { google } from "googleapis";
import path from "path";
import { JWT } from "google-auth-library";
import SendmailTransport from "nodemailer/lib/sendmail-transport";

dotenv.config();

const auth = new JWT({
  keyFile: path.join(__dirname, "google-service-account.json"),
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

app.post("/api/bookings", async (req: Request, res: Response) => {
  const booking: Booking = req.body;
  bookings.push(booking);

  try {
    await appendToSheet(booking);
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: booking.email,
      subject: "Booking Confirmation",
      text: "Thank you for booking with us!",
    });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Got a order",
      text: JSON.stringify(booking),
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
