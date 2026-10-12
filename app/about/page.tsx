import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="w-full">
      {/* Header */}
      <section className="pt-24 pb-12 bg-secondary-50 dark:bg-secondary-900 border-b border-secondary-500/10">
        <div className="max-w-7xl mx-auto px-6 text-center animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Ridhi</h1>
          <p className="text-lg italic text-secondary-500 max-w-2xl mx-auto">
            Psychologist | Counsellor | Mental Health Practitioner
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl animate-fade-in sticky top-28">
            <Image
              src="/ridhi.jpg"
              alt="Ridhi - Psychologist & Mental Health Practitioner"
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-8 animate-slide-up animation-delay-200">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">Hi, I’m Ridhi.</h2>
              <p className="text-lg italic text-primary-600 dark:text-primary-400 font-medium mb-8">
                Psychologist | Counsellor | Mental Health Practitioner
              </p>
              
              <div className="space-y-6 text-secondary-600 dark:text-secondary-300 text-lg leading-relaxed">
                <p>
                  My work across counselling, human behaviour, organisational psychology, and learning and development has taught me that people don’t always need more advice. Sometimes, they need the space to pause, look within, and find clarity.
                </p>

                <p>
                  Some of us feel stuck without quite knowing why. Others aren’t stuck at all, but sense there is more within them waiting to grow. I believe both begin at the same place: <strong className="text-foreground font-bold">insight</strong>.
                </p>

                <p className="font-bold text-foreground text-lg">
                  Echo&Insight was born from this belief: understanding ourselves is not just a way out of difficult situations, but a way into a fuller life.
                </p>

                <p>
                  Whether it’s your mental well-being, relationships, career, or personal growth, there is always room to understand more, discover more, and become more. And doing it with professional support takes us further, faster than doing it alone.
                </p>

                <p className="font-bold text-foreground text-lg">
                  Echo&Insight is where you’re heard, where you see yourself clearly, and where you move forward.
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
