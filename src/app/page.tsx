"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, MessageCircle, BookHeart, Wind, Heart, Sparkles, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden relative selection:bg-emerald-200 selection:text-emerald-900">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-300/20 blur-[120px] mix-blend-multiply pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-300/20 blur-[120px] mix-blend-multiply pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[60%] rounded-full bg-cyan-300/20 blur-[120px] mix-blend-multiply pointer-events-none" />

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6 max-w-7xl mx-auto"
      >
        <div className="flex items-center gap-2 text-emerald-800">
          <span className="text-3xl">🌸</span>
          <span className="text-2xl font-bold tracking-tight">Bloom</span>
        </div>
        <Link href="/auth/login">
          <Button variant="ghost" className="hidden md:inline-flex text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100/50 rounded-full px-6 mr-2 font-medium">
            Log in
          </Button>
          <Button className="bg-emerald-950 hover:bg-emerald-900 text-white rounded-full px-6 shadow-md shadow-emerald-900/10 font-medium transition-all hover:scale-105 active:scale-95">
            Get Started
          </Button>
        </Link>
      </motion.nav>

      <main className="relative z-10 flex flex-col items-center px-4 md:px-6 pt-16 md:pt-28 pb-20 max-w-7xl mx-auto">

        {/* Hero Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="text-center max-w-4xl mx-auto flex flex-col items-center"
        >
          <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/50 text-emerald-800 text-sm font-medium mb-8 border border-emerald-200/50 backdrop-blur-sm shadow-sm">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Your personal mental wellness companion</span>
          </motion.div>

          <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
            A safe space to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">feel</span>,
            <br className="hidden md:block" /> reflect, and grow.
          </motion.h1>

          <motion.p variants={fadeIn} className="text-lg md:text-2xl text-slate-600 max-w-2xl leading-relaxed mb-10">
            Bloom is your AI-powered companion grounded in empathy. Journal your thoughts, chat through your feelings, and find your center.
          </motion.p>

          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link href="/auth/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-7 text-lg rounded-full shadow-xl shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 group">
                Start your journey for free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#features" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-7 text-lg rounded-full border-emerald-200 text-emerald-800 hover:bg-emerald-50 transition-all">
                Explore features
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Floating Interactive Elements */}
        <div className="relative w-full max-w-5xl mx-auto mt-20 md:mt-32 h-[300px] md:h-[400px]">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent z-10" />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] md:w-[80%] h-full bg-white/40 backdrop-blur-3xl border border-white/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col p-6"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
              <div className="w-3 h-3 rounded-full bg-rose-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>

            <div className="space-y-4 flex-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
                className="self-start max-w-[80%] bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-sm shadow-sm"
              >
                <p className="text-slate-700">I&apos;ve been feeling really overwhelmed with work lately...</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.5 }}
                className="self-end ml-auto max-w-[80%] bg-emerald-50 border border-emerald-100 p-4 rounded-2xl rounded-tr-sm shadow-sm"
              >
                <p className="text-emerald-900">I hear you. It&apos;s completely normal to feel that way when your plate is full. Would you like to try a quick 2-minute breathing exercise to help center yourself right now?</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 4 }}
                className="self-center mx-auto mt-6 bg-gradient-to-r from-teal-500 to-emerald-500 text-white p-3 px-6 rounded-full shadow-lg shadow-emerald-500/30 flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
              >
                <Wind className="w-5 h-5" />
                <span className="font-medium">Start Breathing Exercise</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Decorative floating widgets */}
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-4 md:-left-12 top-1/4 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 z-20 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <BookHeart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Journal Streak</p>
              <p className="text-lg font-bold text-slate-800">12 Days</p>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -right-4 md:-right-8 bottom-1/4 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 z-20 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Mood improved</p>
              <p className="text-xs font-medium text-slate-500">Based on recent entries</p>
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div id="features" className="w-full mt-32 md:mt-40 relative z-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything you need to thrive</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Tools designed with clinical insight to help you navigate life&apos;s ups and downs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: MessageCircle,
                color: 'text-blue-600',
                bg: 'bg-blue-100',
                border: 'border-blue-200',
                title: 'AI Companion Chat',
                desc: 'Talk through anything with a compassionate, judgment-free companion available 24/7.'
              },
              {
                icon: BookHeart,
                color: 'text-emerald-600',
                bg: 'bg-emerald-100',
                border: 'border-emerald-200',
                title: 'Private Journal',
                desc: 'Write freely. Your entries power a personalized AI that remembers and grows with you.'
              },
              {
                icon: Wind,
                color: 'text-teal-600',
                bg: 'bg-teal-100',
                border: 'border-teal-200',
                title: 'Guided Exercises',
                desc: 'Breathing, grounding, and mindfulness techniques tailored to how you feel right now.'
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-emerald-900/5 transition-all group"
              >
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feature.border} border`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer / Crisis disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-32 w-full max-w-4xl mx-auto bg-slate-100/50 rounded-3xl p-8 text-center border border-slate-200/50 flex flex-col items-center"
        >
          <ShieldAlert className="w-8 h-8 text-slate-400 mb-4" />
          <p className="text-sm md:text-base text-slate-500">
            Bloom is an AI companion and not a replacement for professional mental health care.
            <br className="hidden md:block" />
            If you&apos;re in a crisis, please call <strong className="text-slate-700">988</strong> or text HOME to <strong className="text-slate-700">741741</strong>.
          </p>
        </motion.div>
      </main>
    </div>
  )
}
