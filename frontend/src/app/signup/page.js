"use client"

import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useState } from "react"

const SignUpPage = () => {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  async function handleSignup(e) {
    e.preventDefault()
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        alert(error.message)
      }
      router.push("/dashboard")
    } catch (error) {

    }
  }
  return (
    <form onSubmit={handleSignup}>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit" className="p-2 bg-amber-400 text-black hover:bg-amber-400/30 hover:text-white hover">Create Account</button>
    </form>
  )
}

export default SignUpPage