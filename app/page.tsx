import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative w-full h-[85vh] min-h-[540px] flex items-center justify-center overflow-hidden">
        {/* Abstract/Ambient Background using generated image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/therapy_room.jpg"
            alt="Calming Therapy Room"
            fill
            className="object-cover opacity-15 dark:opacity-10 scale-105 animate-[pulse_20s_ease-in-out_infinite_alternate]"
            priority
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background z-10" />
        </div>

        <div className="relative z-20 max-w-4xl mx-auto px-6 text-center animate-slide-up">
          <span className="inline-block py-1.5 px-4 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 border border-primary-200/60 dark:border-primary-800/40 text-sm font-semibold mb-5 animate-fade-in shadow-sm">
            Counselling & Emotional WellBeing
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            <span className="text-secondary-700 dark:text-secondary-200">
              Find Clarity.
            </span>
            <br/>
            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-accent-600 to-orange-600 dark:from-primary-400 dark:via-accent-400 dark:to-orange-400">
              Restore
            </span>{" "}
            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-accent-600 to-orange-600 dark:from-primary-400 dark:via-accent-400 dark:to-orange-400">
              Balance.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-secondary-800 dark:text-secondary-200 font-medium mb-8 max-w-2xl mx-auto leading-relaxed">
            A supportive space to understand yourself, navigate life&apos;s challenges and find greater clarity in your thoughts, emotions and relationships.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/book" 
              className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-full font-medium transition-all hover:shadow-xl hover:shadow-primary-500/20 hover:-translate-y-1 text-lg flex items-center justify-center gap-2"
            >
              Book an Appointment
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link 
              href="/book?type=free" 
              className="w-full sm:w-auto px-8 py-4 bg-secondary-50 dark:bg-secondary-900 border border-primary-500/40 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-foreground rounded-full font-medium transition-all text-lg text-center flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-primary-500">
                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
              </svg>
              Know Your Counsellor
              <span className="text-xs font-bold text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full">FREE</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="pt-16 pb-10 md:pt-20 md:pb-12 bg-background">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl animate-slide-up">
            <Image
              src="/ridhi.jpg"
              alt="Ridhi - Psychologist & Mental Health Practitioner"
              fill
              className="object-cover"
            />
          </div>
          <div className="animate-slide-up animation-delay-200">
            <h2 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">
              I’m Ridhi.
            </h2>
            <p className="text-lg italic text-primary-600 dark:text-primary-400 font-medium mb-6">
              Psychologist | Counsellor | Mental Health Practitioner
            </p>
            <div className="space-y-4 text-secondary-700 dark:text-secondary-300 text-lg leading-relaxed">
              <p>
                Some of us feel stuck without quite knowing why. Others aren&apos;t stuck at all but feel there is more within them waiting to grow. And sometimes, we just need a space to talk, reflect, and make sense of what&apos;s happening in our lives.
              </p>
              <p>
                I believe both begin at the same place: <em className="italic font-bold text-foreground">insight</em>.
              </p>
              <p>
                My work across counselling, human behaviour, organisational psychology, and learning and development has taught me that people don&apos;t always need more advice. Sometimes, they need someone to listen, the right questions to reflect on, and the space to understand themselves and their circumstances more clearly.
              </p>
              <p className="italic font-semibold text-foreground">
                Echo&amp;Insight was born from this belief: understanding ourselves is not just a way out of difficult situations, but a way into a fuller life.
              </p>
              <p>
                Whether you&apos;re navigating something difficult or simply curious about who you could become, you deserve the space to explore, understand, and grow. With professional support, we can go further and faster than we can alone.
              </p>
              <p className="italic font-semibold text-foreground">
                Echo&amp;Insight is where you&apos;re heard, where you make sense of your life, where you see yourself clearly, and where you move forward.
              </p>
            </div>
            <div className="mt-8">
              <Link href="/about" className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-500 transition-colors">
                Read full profile
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="pt-10 pb-14 md:pt-12 md:pb-16 bg-secondary-50 dark:bg-secondary-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8 animate-slide-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-2.5">Areas of Expertise</h2>
            <p className="text-secondary-500 max-w-2xl mx-auto">Comprehensive mental healthcare services tailored to support your personal growth and healing.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Life Skills Counselling",
                desc: "One-on-one support to build clarity, confidence, and direction — overcoming overthinking, building self-awareness, and setting meaningful goals.",
                icon: "M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.82 1.508-2.316a7.5 7.5 0 1 0-7.516 0c.85.496 1.508 1.333 1.508 2.316V18"
              },
              {
                title: "Relationship Counselling",
                desc: "Support for couples, families, and individuals navigating communication, conflict, pre-marital readiness, and rebuilding trust.",
                icon: "M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632l-.04-.034a.98.98 0 0 1 .112-.018l.015-.003.118-.016M18 18.72l-1.02-1.02m-1.02-1.02A6 6 0 0 0 12 15.75c-1.396 0-2.68.473-3.708 1.272l-1.02 1.02M12 15.75a6.002 6.002 0 0 0-5.46-3.87"
              },
              {
                title: "Mental Health & Emotional Well-Being",
                desc: "A compassionate space for anxiety, stress, low mood, and burnout — professional support before things feel unmanageable.",
                icon: "M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z"
              }
            ].map((service, i) => (
              <div key={i} className="bg-background rounded-3xl p-8 border border-secondary-500/10 hover:border-primary-500/30 transition-all hover:shadow-xl hover:-translate-y-1 animate-slide-up group" style={{ animationDelay: `${(i + 1) * 200}ms` }}>
                <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d={service.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-secondary-500 leading-relaxed mb-6">{service.desc}</p>
                <Link href="/services" className="text-primary-600 font-medium hover:text-primary-700 flex items-center gap-2">
                  Learn more &rarr;
                </Link>
              </div>
            ))}
          </div>
          
          {/* More Services Button */}
          <div className="mt-10 text-center animate-slide-up" style={{ animationDelay: "800ms" }}>
            <Link href="/services" className="inline-flex items-center justify-center px-8 py-3 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 rounded-full font-bold transition-all shadow-sm">
              View All Services →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 relative overflow-hidden bg-primary-700 text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to prioritize your mental health?</h2>
          <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
            Schedule a consultation today and take the first step towards a more balanced, fulfilling life. Appointments available in 60 and 90-minute blocks.
          </p>
          <Link 
            href="/book" 
            className="inline-flex px-10 py-4 bg-white text-primary-700 hover:bg-primary-50 rounded-full font-bold transition-all shadow-xl hover:scale-105 text-lg items-center gap-2"
          >
            Schedule Consultation
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
