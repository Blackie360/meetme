"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { joinWaitlist } from "@/app/actions"
import { CheckCircle2, Loader2 } from "lucide-react"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      size="lg"
      disabled={pending}
      className="w-full bg-purple-600 text-white hover:bg-purple-700 sm:w-auto"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Joining...
        </>
      ) : (
        "Join the waitlist"
      )}
    </Button>
  )
}

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
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-400">{message}</p>
            </div>
          </div>
        </div>
      ) : (
        <form action={handleSubmit} className="sm:flex sm:max-w-md">
          <div className="min-w-0 flex-1">
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <Input
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="h-12 w-full rounded-md border-0 bg-white/5 px-4 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-purple-500"
            />
          </div>
          <div className="mt-4 sm:ml-4 sm:mt-0">
            <SubmitButton />
          </div>
        </form>
      )}
      {status === "error" && <p className="mt-2 text-sm text-red-400">{message}</p>}
      <p className="mt-3 text-sm leading-6 text-gray-400">
        We care about your data. Read our{" "}
        <a href="#" className="font-semibold text-purple-400 hover:text-purple-300">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  )
}
