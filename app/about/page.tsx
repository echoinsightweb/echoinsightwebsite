import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="w-full">
      {/* Header */}
      <section className="pt-24 pb-12 bg-secondary-50 dark:bg-secondary-900 border-b border-secondary-500/10">
        <div className="max-w-7xl mx-auto px-6 text-center animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Dr. Aiden Wright</h1>
          <p className="text-lg text-secondary-500 max-w-2xl mx-auto">Dedicated to providing compassionate and evidence-based mental healthcare.</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="relative aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl animate-fade-in sticky top-28">
            <Image
              src="/dr_aiden.jpg"
              alt="Dr. Aiden Wright Professional Portrait"
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-8 animate-slide-up animation-delay-200">
            <div>
              <h2 className="text-3xl font-bold mb-4">Professional Journey</h2>
              <p className="text-secondary-500 leading-relaxed">
                With over a decade of clinical experience in both hospital and private practice settings, Dr. Aiden Wright is a licensed clinical psychologist who specializes in the treatment of anxiety, depression, and trauma. He earned his Doctorate in Clinical Psychology (Psy.D.) from a top-tier university, where his research focused on mindfulness-based cognitive therapies.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-4">Therapeutic Approach</h2>
              <p className="text-secondary-500 leading-relaxed">
                Dr. Wright believes that therapy is a collaborative process. His approach is highly individualized, drawing primarily from Cognitive Behavioral Therapy (CBT), Acceptance and Commitment Therapy (ACT), and humanistic principles. He strives to create a warm, non-judgmental, and safe environment where clients feel empowered to explore their challenges and unlock their potential for growth.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-4">Qualifications & Credentials</h2>
              <ul className="space-y-3 text-secondary-500">
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                  Doctor of Psychology (Psy.D.) in Clinical Psychology
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                  Licensed Clinical Psychologist (State Board Certified)
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                  Advanced Certification in Cognitive Behavioral Therapy (CBT)
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                  Member of the American Psychological Association (APA)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
