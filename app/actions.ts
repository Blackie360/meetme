"use server"

import { createClient } from "@/lib/supabase/server"
import { sendWelcomeEmail } from "@/lib/email"
import { cookies } from "next/headers"
import { z } from "zod"

const waitlistSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
})

export async function joinWaitlist(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    // Validate the email
    const email = formData.get("email") as string
    const result = waitlistSchema.safeParse({ email })

    if (!result.success) {
      return {
        success: false,
        message: result.error.errors[0].message,
      }
    }

    // Check if email already exists
    const { data: existingUser } = await supabase.from("waitlist").select("id").eq("email", email).single()

    if (existingUser) {
      return {
        success: false,
        message: "This email is already on our waitlist",
      }
    }

    // Insert the email into the waitlist table
    const { error } = await supabase.from("waitlist").insert([{ email }])

    if (error) {
      console.error("Error inserting into waitlist:", error)
      return {
        success: false,
        message: "Failed to join waitlist. Please try again later.",
      }
    }

    // Send welcome email
    try {
      const emailResult = await sendWelcomeEmail(email)
      if (!emailResult.success) {
        console.warn("Email sending failed but continuing with signup:", emailResult.message)
      }
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError)
      // We don't want to fail the waitlist signup if just the email fails
    }

    return {
      success: true,
      message: "You have successfully joined the waitlist!",
    }
  } catch (error) {
    console.error("Error in joinWaitlist:", error)
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    }
  }
}
