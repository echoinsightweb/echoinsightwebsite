import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Ridhi | Echo & Insight",
  description: "Learn about Ridhi, Psychologist, Counsellor & Mental Health Practitioner at Echo & Insight.",
};

export default function AboutPage() {
  return (
    <div className="w-full">
      {/* Main Content */}
      <section className="pt-8 pb-20 md:pt-12 md:pb-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl animate-fade-in lg:sticky lg:top-28">
            <Image
              src="/ridhi.jpg"
              alt="Ridhi - Psychologist & Mental Health Practitioner"
              fill
              priority
              className="object-cover"
            />
          </div>
          <div className="space-y-8 animate-slide-up animation-delay-200">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold mb-3 text-foreground tracking-tight">I’m Ridhi.</h1>
              <p className="text-lg italic text-primary-600 dark:text-primary-400 font-medium mb-8">
                Psychologist | Counsellor | Mental Health Practitioner
              </p>
              
              <div className="space-y-6 text-secondary-700 dark:text-secondary-300 text-lg leading-relaxed">
                <p>
                  Some of us feel stuck without quite knowing why. Others aren&apos;t stuck at all but feel there is more within them waiting to grow. And sometimes, we just need a space to talk, reflect, and make sense of what&apos;s happening in our lives.
                </p>

                <p>
                  I believe both begin at the same place: <em className="italic font-bold text-foreground">insight</em>.
                </p>

                <p>
                  My work across counselling, human behaviour, organisational psychology, and learning and development has taught me that people don&apos;t always need more advice. Sometimes, they need someone to listen, the right questions to reflect on, and the space to understand themselves and their circumstances more clearly.
                </p>

                <p className="italic font-semibold text-foreground text-lg">
                  Echo&amp;Insight was born from this belief: understanding ourselves is not just a way out of difficult situations, but a way into a fuller life.
                </p>

                <p>
                  Whether you&apos;re navigating something difficult or simply curious about who you could become, you deserve the space to explore, understand, and grow. With professional support, we can go further and faster than we can alone.
                </p>

                <p className="italic font-semibold text-foreground text-lg">
                  Echo&amp;Insight is where you&apos;re heard, where you make sense of your life, where you see yourself clearly, and where you move forward.
                </p>
              </div>

              <div className="mt-10 pt-8 border-t border-secondary-500/10 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/book"
                  className="px-8 py-3.5 bg-primary-600 hover:bg-primary-500 text-white rounded-full font-bold transition-all shadow-lg shadow-primary-500/20 text-center"
                >
                  Book a Session
                </Link>
                <Link
                  href="/book?type=free"
                  className="px-8 py-3.5 bg-secondary-50 dark:bg-secondary-800 border border-primary-500/30 hover:border-primary-500 text-foreground rounded-full font-bold transition-all text-center"
                >
                  Know Your Counsellor (Free)
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
