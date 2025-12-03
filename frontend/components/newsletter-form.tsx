"use client"

import { FormEvent, useState } from "react"
import { toast } from "sonner"

export default function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Email chưa đúng định dạng. Vui lòng thử lại.")
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      toast.success("Tính năng demo – email chưa được lưu thực.")
      setEmail("")
      setIsSubmitting(false)
    }, 600)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row max-w-md mx-auto">
      <label className="sr-only" htmlFor="newsletter-email">
        Email
      </label>
      <input
        id="newsletter-email"
        type="email"
        value={email}
        onChange={event => setEmail(event.target.value)}
        placeholder="nhapemail@domain.com"
        className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-70"
      >
        {isSubmitting ? "Đang gửi..." : "Đăng ký"}
      </button>
    </form>
  )
}
