"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/context/AuthContext"
import { useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Aurora from "@/components/ui/Aurora"

export default function LoginPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard")
    }
  }, [user, authLoading, router])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push("/dashboard")
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-4 overflow-hidden bg-background">
      <div className="absolute inset-0 z-0 hidden dark:block">
        <Aurora
          color1="#090a34"
          color2="#40403f"
          color3="#685850"
          blend={0.95}
        />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tighter drop-shadow-sm">Concave</h1>
          <p className="text-muted-foreground">Secure media vault</p>
        </div>

        <Card className="border-border/50 shadow-2xl bg-card/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your storage
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="bg-background/40 border-border/40 focus:border-primary/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="bg-background/40 border-border/40 focus:border-primary/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 mt-4">
              <Button type="submit" className="w-full font-semibold shadow-lg shadow-primary/20" disabled={loading}>
                {loading ? "Authenticating..." : "Login to Dashboard"}
              </Button>
              <div className="text-sm text-center text-muted-foreground">
                New to Concave?{" "}
                <Link href="/signup" className="text-primary font-medium hover:underline">
                  Create an account
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
