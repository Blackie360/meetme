import nodemailer from "nodemailer"

// Create a transporter using SMTP configuration
// You'll need to add SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASSWORD to your environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com", // Default to Gmail SMTP
  port: Number.parseInt(process.env.SMTP_PORT || "587"), // Default port for TLS
  secure: process.env.SMTP_SECURE === "false", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER!, // SMTP username
    pass: process.env.SMTP_PASSWORD!, // SMTP password
  },
  tls: {
    // Add TLS configuration to handle SSL issues
    rejectUnauthorized: process.env.NODE_ENV === 'production', // Only enforce in production
    minVersion: 'TLSv1.2'
  }
})

export async function sendWelcomeEmail(email: string) {
  try {
    // Check if SMTP credentials are available
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.warn("SMTP credentials are not set. Skipping email sending.")
      return { success: false, message: "SMTP credentials not configured" }
    }

    // Email content
    const mailOptions = {
      from: process.env.SMTP_FROM || "Blackie <codedblood22@gmail.com>",
      to: email,
      subject: "Welcome to the Spotify Blend Waitlist!",
      html: `
        <div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; color: #f9fafb; background-color: #121212; padding: 20px; border-radius: 5px;">
          <h1 style="color: #d8b4fe;">Welcome to Spotify Blend!</h1>
          <p>Thanks for joining our waitlist. We're excited to have you on board!</p>
          <p>We're working hard to create the ultimate Spotify playlist management experience, with a special focus on Spotify Blends.</p>
          <p>We'll notify you as soon as we're ready to launch.</p>
          <div style="margin-top: 30px; padding: 15px; background-color: #9333ea; border-radius: 5px; display: inline-block;">
            <a href="#" style="color: white; text-decoration: none; font-weight: bold;">Learn More About Spotify Blend</a>
          </div>
          <p style="margin-top: 30px; font-size: 14px; color: #9ca3af;">If you didn't sign up for this waitlist, you can safely ignore this email.</p>
        </div>
      `,
    }

    // Send email
    const info = await transporter.sendMail(mailOptions)
    console.log("Email sent:", info.messageId)

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error in sendWelcomeEmail:", error)
    // Return a structured error but don't throw, so the waitlist signup can still succeed
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error sending email",
    }
  }
}
