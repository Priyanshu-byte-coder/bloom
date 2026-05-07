import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50">
      <nav className="flex items-center justify-between px-4 md:px-8 py-4 md:py-5">
        <span className="text-2xl font-bold text-green-800">🌸 Bloom</span>
        <Link href="/auth/login">
          <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
            Sign in
          </Button>
        </Link>
      </nav>

      <main className="flex flex-col items-center text-center px-4 md:px-6 py-12 md:py-20">
        <div className="text-5xl md:text-6xl mb-5 md:mb-6">🌸</div>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 max-w-2xl leading-tight">
          A safe space to feel, reflect, and grow
        </h1>
        <p className="text-base md:text-xl text-gray-600 mt-4 md:mt-6 max-w-xl">
          Bloom is your personal mental health companion — powered by AI, grounded in empathy.
          Journal your thoughts, chat through your feelings, and access guided exercises whenever you need them.
        </p>

        <Link href="/auth/login" className="mt-10">
          <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg rounded-2xl shadow-lg">
            Get started — it&apos;s free
          </Button>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mt-12 md:mt-20 max-w-3xl w-full">
          {[
            { icon: '💬', title: 'AI Chat', desc: 'Talk through anything with a compassionate, judgment-free companion' },
            { icon: '📓', title: 'Private Journal', desc: 'Write freely — your entries power a personalized, memory-aware AI' },
            { icon: '🧘', title: 'Guided Exercises', desc: 'Breathing, grounding, and mindfulness techniques for any moment' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="text-3xl mb-3">{icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-16 text-sm text-gray-400 max-w-md">
          Bloom is not a replacement for professional mental health care.
          In a crisis, call <strong>988</strong> or text HOME to <strong>741741</strong>.
        </p>
      </main>
    </div>
  )
}
