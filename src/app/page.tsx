import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, Lock, FileCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color-midnight)] text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-[var(--color-indigo)] rounded-lg flex items-center justify-center">
            <ShieldCheck className="text-white h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-wider">Decentralize birth Registration</span>
        </div>
        <div className="space-x-4">
          <Link href="/login">
            <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="primary">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center text-center px-4 mt-20 max-w-4xl mx-auto space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold leading-tight">
          Secure, Verifiable <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-indigo)] to-[var(--color-periwinkle)]">
            Birth Certificates
          </span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl">
          A government-grade blockchain solution for managing, issuing, and verifying birth records with immutable security and instant verification.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link href="/register">
            <Button size="lg" className="min-w-[200px]">
              Create Account
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="min-w-[200px]">
              Access Portal
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 text-left">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <ShieldCheck className="h-10 w-10 text-[var(--color-indigo)] mb-4" />
            <h3 className="text-xl font-bold mb-2">Blockchain Verified</h3>
            <p className="text-gray-400">Every certificate is hashed and stored on the blockchain for immutable proof of authenticity.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <Lock className="h-10 w-10 text-[var(--color-periwinkle)] mb-4" />
            <h3 className="text-xl font-bold mb-2">Secure Storage</h3>
            <p className="text-gray-400">Enterprise-grade encryption ensures personal data remains private and secure at all times.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <FileCheck className="h-10 w-10 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Instant Verification</h3>
            <p className="text-gray-400">Third-parties can instantly verify certificate validity without administrative bottlenecks.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-32 border-t border-white/10 py-12 text-center text-gray-500">
        <p>© {new Date().getFullYear()} Decentralize Digital birth Registration. All rights reserved.</p>
      </footer>
    </div>
  );
}
