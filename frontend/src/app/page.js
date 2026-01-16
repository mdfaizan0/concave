"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading Concave...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center space-y-6">
      <div className="space-y-2">
        <h1 className="text-5xl font-extrabold tracking-tighter sm:text-6xl">
          Concave
        </h1>
        <p className="text-xl text-muted-foreground max-w-[600px]">
          A calm and secure cloud storage for your media. Simple, fast, and professional.
        </p>
      </div>
      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link href="/signup">Get Started</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/login">Login</Link>
        </Button>
      </div>
    </div>
  )
}
