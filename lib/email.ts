import nodemailer from "nodemailer";
import { render } from "@react-email/components";
import { BookingConfirmationEmail } from "@/emails/booking-confirmation";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
const SMTP_SECURE = process.env.SMTP_SECURE === "true";
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;

if (!SMTP_USER || !SMTP_PASSWORD) {
  throw new Error(
    "SMTP credentials are not configured. Please set SMTP_USER and SMTP_PASSWORD.",
  );
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

export interface BookingEmailData {
  guestName: string;
  guestEmail: string;
  hostName: string;
  hostEmail: string;
  startTime: Date;
  endTime: Date;
  title: string;
  description?: string;
  meetingLink?: string;
}

/**
 * Send booking confirmation email to guest
 */
export async function sendBookingConfirmationToGuest(
  data: BookingEmailData,
): Promise<void> {
  const html = await render(
    BookingConfirmationEmail({
      guestName: data.guestName,
      hostName: data.hostName,
      startTime: data.startTime,
      endTime: data.endTime,
      title: data.title,
      description: data.description,
      meetingLink: data.meetingLink,
    }),
  );

  await transporter.sendMail({
    from: `"${data.hostName}" <${SMTP_USER}>`,
    to: data.guestEmail,
    subject: `Booking Confirmed: ${data.title}`,
    html,
  });
}

/**
 * Send booking confirmation email to host
 */
export async function sendBookingConfirmationToHost(
  data: BookingEmailData,
): Promise<void> {
  const html = await render(
    BookingConfirmationEmail({
      guestName: data.guestName,
      hostName: data.hostName,
      startTime: data.startTime,
      endTime: data.endTime,
      title: data.title,
      description: data.description,
      meetingLink: data.meetingLink,
      isHost: true,
    }),
  );

  await transporter.sendMail({
    from: `"MeetMe" <${SMTP_USER}>`,
    to: data.hostEmail,
    subject: `New Booking: ${data.title} with ${data.guestName}`,
    html,
  });
}

/**
 * Send booking confirmation emails to both guest and host
 */
export async function sendBookingConfirmations(
  data: BookingEmailData,
): Promise<void> {
  await Promise.all([
    sendBookingConfirmationToGuest(data),
    sendBookingConfirmationToHost(data),
  ]);
}

