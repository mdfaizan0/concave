"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { HardDrive, Shield, Zap, Users, Star, ArrowRight, Sparkles } from "lucide-react"
import Image from "next/image"
import logo from "@/app/icon0.svg"
import Aurora from "@/components/ui/Aurora"

const features = [
  {
    icon: HardDrive,
    title: "Secure Storage",
    description: "Your files are encrypted and stored safely in the cloud",
    color: "text-blue-500"
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Upload and access your files at blazing speeds",
    color: "text-yellow-500"
  },
  {
    icon: Users,
    title: "Easy Sharing",
    description: "Share files and folders with anyone, securely",
    color: "text-green-500"
  },
  {
    icon: Star,
    title: "Smart Organization",
    description: "Star, search, and organize your files effortlessly",
    color: "text-amber-500"
  }
]

export default function Home() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <div className="animate-pulse text-muted-foreground">Loading Concave...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 z-0 hidden dark:block">
        <Aurora
          color1="#090a34"
          color2="#40403f"
          color3="#685850"
          blend={0.95}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 md:py-32">
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
              <Sparkles className="w-4 h-4" />
              <span>Modern Cloud Storage</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-linear-to-b from-foreground to-foreground/70 bg-clip-text pb-4 text-transparent">
              Your Files,
              <br />
              Anywhere, Anytime
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Store, share, and collaborate on your files with Concave.
              <br />
              A simple, secure, and beautiful cloud storage platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button asChild size="lg" className="text-base gap-2 shadow-lg shadow-primary/20 font-bold">
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base font-bold">
                <Link href="/login">Sign In</Link>
              </Button>
            </div>

            <div className="pt-8 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Secure & Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span>Lightning Fast</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-6 py-20 border-t border-border/50">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Everything you need
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful features to manage your files efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/20 hover:bg-card transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className={`w-12 h-12 rounded-xl bg-background border border-border/50 flex items-center justify-center mb-4 group-hover:border-primary/20 transition-colors ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20 border-t border-border/50">
          <div className="max-w-4xl mx-auto text-center space-y-8 p-12 rounded-3xl border border-border/50 bg-card/30 backdrop-blur-sm">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Ready to get started?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of users who trust Concave for their file storage needs.
            </p>
            <Button asChild size="lg" className="text-base gap-2">
              <Link href="/signup">
                Create Free Account
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/50 py-8">
          <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
            <p>© 2026 Concave. Built with ❤️ using Next.js</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
