'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { ShieldAlert } from 'lucide-react'
import { FallingFlowers } from '@/components/shared/FallingFlowers'

export default function LoginPage() {
  async function signInWithGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-transparent relative overflow-hidden selection:bg-emerald-200 selection:text-emerald-900">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-300/20 blur-[120px] mix-blend-multiply pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-300/20 blur-[120px] mix-blend-multiply pointer-events-none" />

      <FallingFlowers />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md z-10 px-4"
      >
        <Card className="w-full shadow-2xl shadow-emerald-900/5 border-white/60 bg-white/70 backdrop-blur-xl rounded-3xl overflow-hidden">
          <CardHeader className="text-center space-y-4 pt-10 pb-6">
            <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 shadow-inner">
              <span className="text-4xl">🌸</span>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-3xl font-extrabold text-slate-800 tracking-tight">Welcome to Bloom</CardTitle>
              <CardDescription className="text-base text-slate-500 max-w-[250px] mx-auto leading-relaxed">
                Your personal safe space to feel, reflect, and grow.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pb-10 px-6 sm:px-10">
            <Button
              onClick={signInWithGoogle}
              className="w-full bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 flex items-center justify-center gap-3 py-6 rounded-2xl text-base font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              variant="outline"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
            
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex gap-3 text-left">
              <ShieldAlert className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-[13px] text-slate-500 leading-relaxed">
                Bloom is not a replacement for professional care. In a crisis, call <strong>988</strong> or text HOME to <strong>741741</strong>.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
