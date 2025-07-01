"use client"

import type React from "react"

import { UserRole } from "@prisma/client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Function untuk menentukan redirect path berdasarkan role
  const getRedirectPath = (role: UserRole): string => {
    switch (role) {
      case UserRole.CUSTOMER:
        return "/customer"
      case UserRole.ADMIN:
        return "/admin"
      case UserRole.SUPER_ADMIN:
        return "/super-admin"
      default:
        return "/customer" // default fallback
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "Login gagal",
          description: "Email atau password salah.",
          variant: "destructive",
        })
        setIsLoading(false) // Set loading false hanya kalau error
      } else {
        // Tunggu session update dengan retry mechanism
        let attempts = 0
        const maxAttempts = 5
        let session = null

        while (attempts < maxAttempts) {
          session = await getSession()
          if (session?.user?.role) {
            break
          }
          // Wait 200ms before retry
          await new Promise(resolve => setTimeout(resolve, 200))
          attempts++
        }

        if (session?.user?.role) {
          const redirectPath = getRedirectPath(session.user.role as UserRole)
          
          // Tampilkan toast success
          toast({
            title: "Login berhasil!",
            description: "Mengarahkan ke dashboard...",
          })
          
          // Delay sedikit untuk user experience yang lebih baik
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Redirect dan keep loading true sampai page change
          router.push(redirectPath)
          // Jangan set loading false di sini, biarkan sampai page change
        } else {
          // Fallback jika session tidak ada
          toast({
            title: "Login berhasil!",
            description: "Mengarahkan ke dashboard...",
          })
          
          await new Promise(resolve => setTimeout(resolve, 500))
          router.push("/customer")
        }
      }
    } catch (error) {
      toast({
        title: "Terjadi kesalahan",
        description: "Silakan coba lagi nanti.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="nama@email.com" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" placeholder="Password Anda" required />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Sedang masuk..." : "Masuk"}
      </Button>
    </form>
  )
}