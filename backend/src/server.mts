import express from "express";
import type { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { google } from "googleapis";
import { GoogleAuth } from "google-auth-library";

dotenv.config();

function getGoogleCredentials() {
  // Method 1: Base64 encoded JSON
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64) {
    try {
      return JSON.parse(
        Buffer.from(
          process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64,
          "base64"
        ).toString("utf8")
      );
    } catch (error) {
      console.error("Failed to decode base64 service account key:", error);
    }
  }

  // Method 2: Direct JSON string
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    try {
      return JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    } catch (error) {
      console.error("Failed to parse service account JSON:", error);
    }
  }

  // Method 3: Individual components
  if (process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_CLIENT_EMAIL) {
    return {
      type: "service_account",
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    };
  }

  throw new Error("No valid Google service account credentials found");
}

const credentials = getGoogleCredentials();

const auth = new GoogleAuth({
  credentials,
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
  sheetName?: string;
}

interface twitchForm {
  name: string;
  email: string;
  twitchUsername: string;
  currentFollowers: string;
  plan: string;
  message: string;
  goals: string[];
  sheetName: string;
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
  const sheets = google.sheets({
    version: "v4",
    auth,
  });
  const targetSheet = booking.sheetName || "Sheet1";

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
    range: `${booking.sheetName || "Sheet1"}!A1`, // ✅ uses Sheet2 if provided
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values,
    },
  });
}
const now = new Date();

// Convert to Pakistani time (UTC+5)
const options: Intl.DateTimeFormatOptions = {
  timeZone: 'Asia/Karachi',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
};

const readableTime = now.toLocaleString('en-PK', options);
// Add this function after your existing appendToSheet function
async function appendTwitchToSheet(twitchForm: twitchForm) {
  const sheets = google.sheets({
    version: "v4",
    auth,
  });
  
  const targetSheet = twitchForm.sheetName || "TwitchSubmissions";

  const values = [
    [
      twitchForm.name,
      twitchForm.email,
      twitchForm.twitchUsername,
      twitchForm.currentFollowers,
      twitchForm.plan,
      twitchForm.message,
      twitchForm.goals.join(", "), // Convert array to comma-separated string
      readableTime,
    ],
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${targetSheet}!A1`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values,
    },
  });
}

app.get("/api/debug-env", (req, res) => {
  res.json({
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
    firstLineOfKey: process.env.GOOGLE_PRIVATE_KEY?.slice(0, 30),
  });
});

// Add this new endpoint after your existing endpoints
app.post("/api/twitch-form/", async (req: Request, res: Response) => {
  const twitchForm: twitchForm = req.body;

  try {
    // Save to Google Sheets
    await appendTwitchToSheet(twitchForm);

    // Send confirmation email to the Twitch user
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: twitchForm.email,
      subject: "🎮 Thank You for Your Twitch Growth Inquiry!",
      text: `
Hi ${twitchForm.name},

Thank you for reaching out about our Twitch growth services! We're excited to help you take your streaming career to the next level.

Here's a summary of your submission:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Your Details:
• Name: ${twitchForm.name}
• Email: ${twitchForm.email}
• Twitch Username: @${twitchForm.twitchUsername}
• Current Followers: ${twitchForm.currentFollowers}

📋 Service Details:
• Selected Plan: ${twitchForm.plan}
• Your Goals: ${twitchForm.goals.join(", ")}

💬 Your Message:
"${twitchForm.message}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What happens next?
1. Our team will review your submission within 24 hours
2. We'll analyze your current Twitch channel and growth potential
3. You'll receive a personalized strategy proposal via email
4. We'll schedule a free consultation call to discuss your goals

In the meantime, feel free to check out our success stories and tips on our website!

If you have any immediate questions, just reply to this email.

Ready to level up your stream? Let's make it happen! 🚀

Best regards,
The Twitch Growth Team
StreamBoost Pro

P.S. Follow us on Twitch for exclusive streaming tips and community events!
`.trim(),
      html: `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 0;">
  
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #9146ff 0%, #772ce8 100%); padding: 30px; text-align: center; color: white;">
    <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🎮 StreamBoost Pro</h1>
    <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your Twitch Growth Partners</p>
  </div>

  <!-- Main Content -->
  <div style="background: white; padding: 40px 30px;">
    
    <h2 style="color: #2d3748; margin-bottom: 20px; font-size: 24px;">Hi ${twitchForm.name}! 👋</h2>
    
    <p style="color: #4a5568; line-height: 1.6; margin-bottom: 25px; font-size: 16px;">
      Thank you for reaching out about our Twitch growth services! We're excited to help you take your streaming career to the next level.
    </p>

    <!-- Submission Summary -->
    <div style="background: #f7fafc; border-left: 4px solid #9146ff; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
      <h3 style="color: #2d3748; margin-top: 0; margin-bottom: 15px; font-size: 18px;">📋 Your Submission Summary</h3>
      
      <div style="margin-bottom: 15px;">
        <strong style="color: #4a5568;">👤 Streamer Details:</strong>
        <ul style="margin: 8px 0; padding-left: 20px; color: #718096;">
          <li><strong>Name:</strong> ${twitchForm.name}</li>
          <li><strong>Twitch Username:</strong> @${twitchForm.twitchUsername}</li>
          <li><strong>Current Followers:</strong> ${twitchForm.currentFollowers}</li>
        </ul>
      </div>

      <div style="margin-bottom: 15px;">
        <strong style="color: #4a5568;">📈 Growth Plan:</strong>
        <ul style="margin: 8px 0; padding-left: 20px; color: #718096;">
          <li><strong>Selected Plan:</strong> <span style="color: #9146ff; font-weight: bold;">${twitchForm.plan}</span></li>
          <li><strong>Your Goals:</strong> ${twitchForm.goals.join(", ")}</li>
        </ul>
      </div>

      <div style="margin-bottom: 0;">
        <strong style="color: #4a5568;">💬 Your Message:</strong>
        <p style="margin: 8px 0; padding: 15px; background: white; border-radius: 6px; font-style: italic; color: #2d3748;">
          "${twitchForm.message}"
        </p>
      </div>
    </div>

    <!-- Next Steps -->
    <div style="background: linear-gradient(135deg, #e6fffa 0%, #f0fff4 100%); padding: 25px; border-radius: 10px; margin: 25px 0;">
      <h3 style="color: #2d3748; margin-top: 0; margin-bottom: 15px; font-size: 18px;">🚀 What Happens Next?</h3>
      <ol style="color: #4a5568; line-height: 1.8; margin: 0; padding-left: 20px;">
        <li><strong>Review (24 hours):</strong> Our team will analyze your submission</li>
        <li><strong>Channel Analysis:</strong> We'll review your current Twitch presence</li>
        <li><strong>Custom Strategy:</strong> You'll receive a personalized growth proposal</li>
        <li><strong>Free Consultation:</strong> We'll schedule a call to discuss your goals</li>
      </ol>
    </div>

    <p style="color: #4a5568; line-height: 1.6; margin: 25px 0; font-size: 16px;">
      In the meantime, feel free to check out our success stories and tips on our website! If you have any immediate questions, just reply to this email.
    </p>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 30px 0;">
      <div style="display: inline-block; background: linear-gradient(135deg, #9146ff 0%, #772ce8 100%); padding: 15px 30px; border-radius: 25px; color: white; font-weight: bold; font-size: 16px;">
        🎯 Ready to Level Up Your Stream!
      </div>
    </div>

  </div>

  <!-- Footer -->
  <div style="background: #2d3748; color: #a0aec0; padding: 25px 30px; text-align: center;">
    <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; color: white;">
      StreamBoost Pro Team
    </p>
    <p style="margin: 0; font-size: 14px; line-height: 1.5;">
      Helping streamers grow since 2020 | Follow us on Twitch for exclusive tips!
    </p>
    <div style="margin-top: 15px;">
      <span style="font-size: 12px; opacity: 0.8;">
        Questions? Just reply to this email - we're here to help! 💜
      </span>
    </div>
  </div>

</div>
      `,
    });

    // Send notification email to admin
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: `${process.env.ADMIN}, ${process.env.EMAIL_USER}`,
      subject: `🎮 New Twitch Growth Inquiry from ${twitchForm.name}`,
      text: `
NEW TWITCH GROWTH FORM SUBMISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 CONTACT INFORMATION:
• Name: ${twitchForm.name}
• Email: ${twitchForm.email}
• Twitch Username: @${twitchForm.twitchUsername}

📊 CHANNEL DETAILS:
• Current Followers: ${twitchForm.currentFollowers}
• Selected Plan: ${twitchForm.plan}

🎯 GOALS & OBJECTIVES:
${twitchForm.goals.map(goal => `• ${goal}`).join('\n')}

💬 PERSONAL MESSAGE:
"${twitchForm.message}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 NEXT STEPS:
1. Review their Twitch channel: https://twitch.tv/${twitchForm.twitchUsername}
2. Analyze their current content and engagement
3. Prepare a customized growth strategy proposal
4. Schedule a consultation call within 24 hours

🔗 View all submissions in Google Sheets:
${process.env.GOOGLE_SHEET_URL}

Remember to follow up promptly - strike while the iron is hot! 🔥
      `,
      html: `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background: #f8fafc;">
  
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%); padding: 25px; color: white; text-align: center;">
    <h1 style="margin: 0; font-size: 24px; font-weight: bold;">🎮 New Twitch Growth Inquiry</h1>
    <p style="margin: 5px 0 0 0; opacity: 0.8;">StreamBoost Pro - Admin Notification</p>
  </div>

  <!-- Main Content -->
  <div style="background: white; padding: 30px;">
    
    <!-- Contact Info -->
    <div style="background: #f7fafc; border-left: 4px solid #4299e1; padding: 20px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
      <h3 style="color: #2d3748; margin-top: 0; margin-bottom: 15px;">👤 Contact Information</h3>
      <ul style="list-style: none; padding: 0; margin: 0; color: #4a5568;">
        <li style="margin-bottom: 8px;"><strong>Name:</strong> ${twitchForm.name}</li>
        <li style="margin-bottom: 8px;"><strong>Email:</strong> <a href="mailto:${twitchForm.email}" style="color: #4299e1;">${twitchForm.email}</a></li>
        <li style="margin-bottom: 8px;"><strong>Twitch:</strong> <a href="https://twitch.tv/${twitchForm.twitchUsername}" target="_blank" style="color: #9146ff;">@${twitchForm.twitchUsername}</a></li>
      </ul>
    </div>

    <!-- Channel Details -->
    <div style="background: #f0fff4; border-left: 4px solid #48bb78; padding: 20px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
      <h3 style="color: #2d3748; margin-top: 0; margin-bottom: 15px;">📊 Channel Details</h3>
      <ul style="list-style: none; padding: 0; margin: 0; color: #4a5568;">
        <li style="margin-bottom: 8px;"><strong>Current Followers:</strong> <span style="color: #48bb78; font-weight: bold;">${twitchForm.currentFollowers}</span></li>
        <li style="margin-bottom: 8px;"><strong>Selected Plan:</strong> <span style="color: #9146ff; font-weight: bold;">${twitchForm.plan}</span></li>
      </ul>
    </div>

    <!-- Goals -->
    <div style="background: #fef5e7; border-left: 4px solid #ed8936; padding: 20px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
      <h3 style="color: #2d3748; margin-top: 0; margin-bottom: 15px;">🎯 Goals & Objectives</h3>
      <ul style="margin: 0; padding-left: 20px; color: #4a5568;">
        ${twitchForm.goals.map(goal => `<li style="margin-bottom: 5px;">${goal}</li>`).join('')}
      </ul>
    </div>

    <!-- Message -->
    <div style="background: #edf2f7; border-left: 4px solid #a0aec0; padding: 20px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
      <h3 style="color: #2d3748; margin-top: 0; margin-bottom: 15px;">💬 Personal Message</h3>
      <p style="margin: 0; color: #4a5568; font-style: italic; line-height: 1.6; background: white; padding: 15px; border-radius: 6px;">
        "${twitchForm.message}"
      </p>
    </div>

    <!-- Action Items -->
    <div style="background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%); padding: 20px; border-radius: 10px; margin-bottom: 25px;">
      <h3 style="color: #2d3748; margin-top: 0; margin-bottom: 15px;">⚡ Action Items</h3>
      <ol style="margin: 0; padding-left: 20px; color: #4a5568; line-height: 1.8;">
        <li><strong>Review Channel:</strong> <a href="https://twitch.tv/${twitchForm.twitchUsername}" target="_blank" style="color: #9146ff;">Visit @${twitchForm.twitchUsername}</a></li>
        <li><strong>Analyze:</strong> Check current content and engagement rates</li>
        <li><strong>Prepare:</strong> Create customized growth strategy proposal</li>
        <li><strong>Contact:</strong> Schedule consultation call within 24 hours</li>
      </ol>
    </div>

    <!-- Quick Links -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://twitch.tv/${twitchForm.twitchUsername}" 
         target="_blank" 
         style="display: inline-block; background: #9146ff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 0 10px 10px 0;">
        🎮 View Twitch Channel
      </a>
      <a href="mailto:${twitchForm.email}" 
         style="display: inline-block; background: #4299e1; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 0 10px 10px 0;">
        📧 Email ${twitchForm.name}
      </a>
    </div>

  </div>

  <!-- Footer -->
  <div style="background: #2d3748; color: #a0aec0; padding: 20px; text-align: center;">
    <p style="margin: 0 0 10px 0; font-size: 14px;">
      📊 <a href="${process.env.GOOGLE_SHEET_URL || '#'}" target="_blank" style="color: #63b3ed;">View All Submissions in Google Sheets</a>
    </p>
    <p style="margin: 0; font-size: 12px; opacity: 0.8;">
      Follow up promptly - strike while the iron is hot! 🔥
    </p>
  </div>

</div>
      `,
    });

    res.status(201).json({ 
      message: "Twitch form submitted successfully and emails sent.",
      success: true 
    });

  } catch (error) {
    console.error("Error processing Twitch form:", error);
    res.status(500).json({ 
      message: "Error processing Twitch form submission",
      success: false 
    });
  }
});

app.get("/api/twitch-form", (req: Request, res: Response) => {
  res.json(bookings);
});

app.post(
  "/api/bookings/auto-trust-report",
  async (req: Request, res: Response) => {
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
  }
);

app.get("/api/bookings", (req: Request, res: Response) => {
  res.json(bookings);
});

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error(error);
  res.status(500).json({ message: "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
