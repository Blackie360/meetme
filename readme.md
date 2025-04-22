
### Spotify Blend Hero Section - README

## Overview

This project implements a responsive hero section for a Spotify playlist management application with a focus on the "Spotify Blends" feature. It includes a waitlist signup form that collects user emails, stores them in a Supabase database, and sends confirmation emails using Nodemailer.





## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Implementation Details](#implementation-details)

- [Hero Section](#hero-section)
- [Waitlist Form](#waitlist-form)
- [Server Actions](#server-actions)
- [Database Integration](#database-integration)
- [Email Notifications](#email-notifications)



- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)


## Features

- **Responsive Hero Section**: Dark-themed UI with purple accents matching Spotify's aesthetic
- **Waitlist Form**: Collects and validates email addresses
- **Real-time Feedback**: Shows success/error states and loading indicators
- **Database Storage**: Securely stores emails in a Supabase database
- **Email Notifications**: Sends confirmation emails to users upon signup
- **Error Handling**: Robust error handling at every step


## Architecture

The application is built using:

- **Next.js 14**: App Router for server-side rendering and Server Actions
- **React**: For UI components and client-side interactivity
- **Tailwind CSS**: For styling and responsive design
- **Supabase**: For database storage and management
- **Nodemailer**: For sending email notifications
- **Zod**: For form validation


The application follows a modern architecture with:

- Server Components for initial rendering
- Client Components for interactive elements
- Server Actions for form processing
- Separation of concerns between UI, data handling, and email sending


## Implementation Details

### Hero Section

The hero section (`components/hero-section.tsx`) is implemented as a responsive component with:

- Gradient backgrounds and visual elements
- Animated UI elements
- Responsive layout using Tailwind CSS
- Visual representation of the Spotify Blends feature


```typescriptreact
// Key implementation details
<section className="relative overflow-hidden bg-black">
  {/* Purple gradient background */}
  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-background to-background" />
  
  {/* Content container */}
  <div className="container relative z-10 mx-auto px-4 py-24">
    {/* Hero content */}
    <h1 className="mt-10 max-w-lg text-4xl font-bold tracking-tight text-white sm:text-6xl">
      Blend Your Spotify Experience
    </h1>
    <p className="mt-6 text-lg leading-8 text-gray-300">
      Create, share, and discover the perfect Spotify Blends with friends.
    </p>
    
    {/* Waitlist form component */}
    <WaitlistForm />
  </div>
</section>
```

### Waitlist Form

The waitlist form (`components/waitlist-form.tsx`) is a client component that:

- Collects email addresses
- Validates input on the client side
- Submits data to a server action
- Shows loading state during submission
- Displays success/error messages
- Handles form reset after submission


```typescriptreact
// Key implementation details
export function WaitlistForm() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  async function handleSubmit(formData: FormData) {
    const result = await joinWaitlist(formData)
    
    if (result.success) {
      setStatus("success")
      setMessage(result.message)
      setEmail("")
    } else {
      setStatus("error")
      setMessage(result.message)
    }
    
    // Reset status after 5 seconds
    setTimeout(() => {
      setStatus("idle")
      setMessage("")
    }, 5000)
  }
  
  return (
    <div className="mt-8">
      {status === "success" ? (
        <div className="rounded-lg bg-green-500/10 p-4">
          {/* Success message */}
        </div>
      ) : (
        <form action={handleSubmit} className="sm:flex sm:max-w-md">
          {/* Form fields */}
        </form>
      )}
      {status === "error" && <p className="mt-2 text-sm text-red-400">{message}</p>}
    </div>
  )
}
```

### Server Actions

The server action (`app/actions.ts`) handles:

- Form data processing
- Email validation using Zod
- Checking for duplicate emails
- Storing emails in the Supabase database
- Triggering email notifications
- Error handling and response formatting


```typescriptreact
// Key implementation details
export async function joinWaitlist(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  
  try {
    // Validate the email
    const email = formData.get("email") as string
    const result = waitlistSchema.safeParse({ email })
    
    if (!result.success) {
      return { success: false, message: result.error.errors[0].message }
    }
    
    // Check for duplicates and insert into database
    // ...
    
    // Send welcome email
    try {
      const emailResult = await sendWelcomeEmail(email)
      // Handle email sending result
    } catch (emailError) {
      // Log error but continue with signup
    }
    
    return { success: true, message: "You have successfully joined the waitlist!" }
  } catch (error) {
    // Handle errors
  }
}
```

### Database Integration

The Supabase integration is implemented with:

- Server-side client for secure database operations
- Client-side client for user-facing operations
- Database schema with a `waitlist` table
- Indexes for efficient queries
- Duplicate checking before insertion


**Database Schema:**

```sql
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending'
);

CREATE INDEX IF NOT EXISTS waitlist_email_idx ON waitlist(email);
```

**Supabase Client (Server):**

```typescriptreact
// lib/supabase/server.ts
export function createClient(cookieStore: ReturnType<typeof cookies>) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options })
        },
      },
    }
  )
}
```

### Email Notifications

Email notifications are implemented using Nodemailer:

- SMTP configuration for various email providers
- HTML email template
- Error handling and logging
- Fallback mechanism if email sending fails


```typescriptreact
// lib/email.ts
import nodemailer from "nodemailer"

// Create a transporter using SMTP configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASSWORD || "",
  },
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
      from: process.env.SMTP_FROM || "Acme <noreply@example.com>",
      to: email,
      subject: "Welcome to the Spotify Blend Waitlist!",
      html: `
        <div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; color: #f9fafb; background-color: #121212; padding: 20px; border-radius: 5px;">
          <h1 style="color: #d8b4fe;">Welcome to Spotify Blend!</h1>
          <!-- Email content -->
        </div>
      `,
    }

    // Send email
    const info = await transporter.sendMail(mailOptions)
    console.log("Email sent:", info.messageId)

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error in sendWelcomeEmail:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error sending email",
    }
  }
}
```

## Environment Variables

The application requires the following environment variables:

### Supabase Configuration

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for admin operations)


### SMTP Configuration for Nodemailer

- `SMTP_HOST`: SMTP server hostname (e.g., smtp.gmail.com)
- `SMTP_PORT`: SMTP server port (typically 587 for TLS or 465 for SSL)
- `SMTP_USER`: SMTP username/email
- `SMTP_PASSWORD`: SMTP password or app password
- `SMTP_FROM`: Sender email address (e.g., "Your App `<noreply@example.com>`")
- `SMTP_SECURE`: Set to "true" for SSL (port 465) or "false" for TLS (port 587)


### Common SMTP Configurations

#### Gmail

```plaintext
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=Your App <your-email@gmail.com>
SMTP_SECURE=false
```

#### Outlook/Office 365

```plaintext
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
SMTP_FROM=Your App <your-email@outlook.com>
SMTP_SECURE=false
```

#### Amazon SES

```plaintext
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASSWORD=your-ses-smtp-password
SMTP_FROM=Your App <no-reply@yourdomain.com>
SMTP_SECURE=false
```

## Deployment

The application is designed to be deployed on Vercel, but can be deployed to any platform that supports Next.js.

### Vercel Deployment

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import the repository in Vercel
3. Configure the environment variables in the Vercel dashboard
4. Deploy the application


### Local Development

1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env.local` file with the required environment variables
4. Run the development server with `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser


## Troubleshooting

### Database Issues

- **Error: "Failed to join waitlist"**: Check your Supabase credentials and database permissions
- **Duplicate Email Errors**: The application checks for duplicates, but you can manually check the database


### Email Sending Issues

- **SMTP Authentication Errors**: Verify your SMTP credentials
- **Connection Refused**: Check if your SMTP server is accessible from your deployment environment
- **Gmail Specific**: If using Gmail, make sure to:

- Enable "Less secure app access" or
- Use an "App Password" if you have 2FA enabled
- Allow access from your server's IP address





### Testing Email Configuration

Use the included test endpoint to verify your email configuration:

```shellscript
curl -X POST https://your-vercel-url/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Common Nodemailer Errors

1. **Authentication Failed**:

1. Check username and password
2. For Gmail, use an App Password
3. Ensure "Less secure app access" is enabled if needed



2. **Connection Refused**:

1. Verify SMTP_HOST and SMTP_PORT
2. Check if your hosting provider blocks outgoing SMTP connections



3. **Self-Signed Certificate**:

1. If your SMTP server uses a self-signed certificate, you may need to add:


```javascript
tls: {
  rejectUnauthorized: false
}
```

to your transporter configuration (not recommended for production)


4. **Rate Limiting**:

1. Some providers limit the number of emails you can send
2. Consider implementing a queue system for high-volume scenarios





## Conclusion

This implementation provides a solid foundation for collecting waitlist signups for your Spotify playlist management application. The code is designed to be robust, with error handling at every step to ensure a smooth user experience.