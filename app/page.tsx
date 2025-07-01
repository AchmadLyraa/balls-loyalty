import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Users, Gift, Star } from "lucide-react"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (session) {
    // Redirect based on role
    switch (session.user.role) {
      case "CUSTOMER":
        redirect("/customer/loyalty")
      case "ADMIN":
        redirect("/admin/verify-upload")
      case "SUPER_ADMIN":
        redirect("/super-admin")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">BALLS</h1>
              <p className="text-xs text-gray-600">Borneo Anfield Stadium</p>
            </div>
          </div>
          <div className="space-x-2">
            <Button variant="outline" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Loyalty Program
            <span className="block text-green-600">Borneo Anfield Stadium</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Dapatkan poin loyalty setiap kali booking lapangan dan tukarkan dengan hadiah menarik!
          </p>
          <div className="space-x-4">
            <Button size="lg" asChild>
              <Link href="/register">Mulai Sekarang</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Fitur Loyalty Program</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Star className="w-12 h-12 text-yellow-500 mb-4" />
                <CardTitle>Kumpulkan Poin</CardTitle>
                <CardDescription>Dapatkan poin setiap kali booking lapangan</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Setiap jam booking akan memberikan poin yang bisa dikumpulkan untuk ditukar dengan hadiah menarik.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Gift className="w-12 h-12 text-purple-500 mb-4" />
                <CardTitle>Tukar Hadiah</CardTitle>
                <CardDescription>Redeem poin dengan berbagai hadiah</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Tukarkan poin Anda dengan berbagai hadiah menarik seperti free booking, merchandise, dan lainnya.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="w-12 h-12 text-blue-500 mb-4" />
                <CardTitle>Ajak Teman</CardTitle>
                <CardDescription>Poin dibagi untuk semua peserta</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Ajak teman-teman bermain dan semua peserta yang terdaftar akan mendapat poin loyalty.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Siap Mulai Mengumpulkan Poin?</h2>
          <p className="text-xl mb-8 opacity-90">
            Daftar sekarang dan mulai dapatkan poin loyalty dari setiap booking Anda!
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/register">Daftar Gratis</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold">BALLS Loyalty</span>
          </div>
          <p className="text-gray-400">© 2024 Borneo Anfield Stadium. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
