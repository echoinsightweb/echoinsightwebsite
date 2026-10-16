import Link from "next/link";
import Image from "next/image";

export default function ServicesPage() {
  const services = [
    {
      title: "Life Skills Counselling",
      punchLine: "Grow Into the Life You Want",
      description:
        "One-on-one support to build clarity, confidence, and direction in everyday life.",
      bullets: [
        "Overcoming indecision and chronic overthinking",
        "Building self-awareness and emotional clarity",
        "Personal growth and goal-setting support",
        "Developing resilience and coping strategies",
        "Strengthening confidence and self-esteem",
      ],
      duration: "60 / 90 mins",
      image: "/services/life-skills.jpg",
      icon: "M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.82 1.508-2.316a7.5 7.5 0 1 0-7.516 0c.85.496 1.508 1.333 1.508 2.316V18",
    },
    {
      title: "Relationship Counselling",
      punchLine: "For the People You Love",
      description:
        "Support for couples, families, and individuals working through the relationships that matter most.",
      bullets: [
        "Resolving communication breakdowns",
        "Breaking recurring conflict cycles",
        "Pre-marital counselling and relationship readiness",
        "Navigating family dynamics and in-law relationships",
        "Rebuilding trust and emotional intimacy",
      ],
      duration: "60 / 90 mins",
      image: "/services/relationship-counselling.jpg",
      icon: "M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632l-.04-.034a.98.98 0 0 1 .112-.018l.015-.003.118-.016M18 18.72l-1.02-1.02m-1.02-1.02A6 6 0 0 0 12 15.75c-1.396 0-2.68.473-3.708 1.272l-1.02 1.02M12 15.75a6.002 6.002 0 0 0-5.46-3.87",
    },
    {
      title: "Mental Health & Emotional Well-Being",
      punchLine: "A Hearing Ear, When You Need One",
      description:
        "Professional support for anxiety, stress, low mood, and burnout — a space to be heard before things feel unmanageable.",
      bullets: [
        "Anxiety and persistent worry",
        "Chronic stress management",
        "Low mood and emotional exhaustion",
        "Burnout recovery",
        "Emotional regulation and long-term wellness habits",
      ],
      duration: "60 / 90 mins",
      image: "/services/mental-health-wellbeing.jpg",
      icon: "M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z",
    },
    {
      title: "Parental & Child Behaviour Counselling",
      punchLine: "Raising Confident Kids, Together",
      description:
        "Support for children, adolescents, and the parents guiding them through it.",
      bullets: [
        "Child and adolescent counselling",
        "Behavioural concerns and emotional outbursts",
        "Gaming and screen addiction",
        "School-related issues and academic pressure",
        "Parenting guidance and family communication",
      ],
      duration: "60 / 90 mins",
      image: "/services/parental-child.jpg",
      icon: "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z",
    },
    {
      title: "Corporate / Group Workshops",
      punchLine: "Better Teams Start Here",
      description:
        "Psychology-led workshops that build healthier, more resilient teams.",
      bullets: [
        "Employee wellness and burnout prevention",
        "Team communication and collaboration training",
        "Workplace stress management programs",
        "Leadership and emotional intelligence training",
        "Customised L&D and organisational consulting",
      ],
      duration: "Custom Duration",
      image: "/services/corporate-workshops.jpg",
      icon: "M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632l-.04-.034a.98.98 0 0 1 .112-.018l.015-.003.118-.016",
    },
    {
      title: "Emotional & Communication Counselling",
      punchLine: "Say What You Mean. Be Understood.",
      description:
        "Strengthen the skills behind every relationship — personal and professional.",
      bullets: [
        "Interpersonal skills development",
        "Emotional intelligence building",
        "Assertiveness and boundary-setting",
        "Active listening and conflict communication",
        "Managing difficult conversations",
      ],
      duration: "60 / 90 mins",
      image: "/services/emotional-communication.jpg",
      icon: "M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z",
    },
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <section className="pt-16 md:pt-20 pb-10 bg-secondary-50 dark:bg-secondary-900 border-b border-secondary-500/10">
        <div className="max-w-7xl mx-auto px-6 text-center animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Our Services</h1>
          <p className="text-lg text-secondary-500 max-w-2xl mx-auto">Comprehensive online mental healthcare, bringing professional support directly to your safe space.</p>
        </div>

        {/* Know Your Counsellor CTA */}
        <div className="max-w-2xl mx-auto mt-8 px-6">
          <div className="rounded-3xl bg-gradient-to-r from-primary-600 via-accent-600 to-orange-600 p-px shadow-xl">
            <div className="rounded-3xl bg-gradient-to-r from-primary-600 via-accent-600 to-orange-600 px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-white text-center sm:text-left">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary-100 mb-1">Not sure where to start?</p>
                <h2 className="text-xl font-bold">Know Your Counsellor</h2>
                <p className="text-sm text-white/90 mt-1">A free 15-minute intro session — no payment, no pressure.</p>
              </div>
              <a
                href="/book?type=free"
                className="shrink-0 px-6 py-3 bg-white text-primary-700 hover:text-orange-600 hover:bg-orange-50 rounded-full font-bold text-sm transition-all hover:scale-105 shadow-lg whitespace-nowrap"
              >
                Book Free Session →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services List */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <div key={i} className="bg-background rounded-3xl p-8 border border-secondary-500/20 hover:border-primary-500/50 hover:shadow-2xl transition-all group animate-slide-up flex flex-col" style={{ animationDelay: `${(i + 1) * 150}ms` }}>
              {/* Icon & Duration */}
              <div className="flex items-start justify-between mb-5">
                {service.image ? (
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-sm group-hover:scale-110 transition-transform duration-300 shrink-0 border border-primary-500/20">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                      <path strokeLinecap="round" strokeLinejoin="round" d={service.icon} />
                    </svg>
                  </div>
                )}
                <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full mt-1">
                  {service.duration}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold mb-1 leading-snug">{service.title}</h3>

              {/* Punchline */}
              <p className="text-base italic text-primary-500 font-medium mb-3">{service.punchLine}</p>

              {/* Description */}
              <p className="text-secondary-500 text-sm leading-relaxed mb-5">{service.description}</p>

              {/* Bullet Points */}
              <ul className="space-y-2 mb-6 flex-grow">
                {service.bullets.map((b, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-secondary-600">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-primary-500 mt-0.5 shrink-0">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                    </svg>
                    {b}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {service.title === "Corporate / Group Workshops" ? (
                <Link href="/corporate-enquiry" className="inline-flex items-center justify-center px-6 py-2.5 bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white rounded-full font-medium transition-colors text-sm mt-auto">
                  Send Enquiry →
                </Link>
              ) : (
                <Link href="/book" className="inline-flex items-center justify-center px-6 py-2.5 bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white rounded-full font-medium transition-colors text-sm mt-auto">
                  Book Session →
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Banner */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center animate-slide-up">
          <h2 className="text-3xl font-bold mb-2">Transparent Pricing</h2>
          <p className="text-primary-100 mb-8">All sessions available in 60 or 90 minutes as per your preference.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 relative overflow-hidden">
              <span className="absolute top-0 left-0 right-0 text-center text-xs py-1.5 bg-white/20 font-semibold tracking-wider">INTRODUCTORY</span>
              <div className="mt-5">
                <h3 className="text-xl font-medium mb-2 text-primary-100">Know Your Counsellor</h3>
                <p className="text-xl font-medium mb-1 text-primary-100">15 Minutes</p>
                <p className="text-4xl font-bold">FREE</p>
                <p className="text-sm mt-2 opacity-80">No commitment required</p>
                <a href="/book?type=free" className="mt-4 inline-block px-5 py-2 bg-white text-primary-700 rounded-full font-semibold text-sm hover:bg-primary-50 transition-colors">Book Now</a>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-medium mb-2 text-primary-100">Standard Session</h3>
              <p className="text-xl font-medium mb-1 text-primary-100">60 Minutes</p>
              <p className="text-4xl font-bold">₹1500</p>
              <p className="text-sm mt-2 opacity-80">+ Applicable taxes</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-medium mb-2 text-primary-100">Extended Session</h3>
              <p className="text-xl font-medium mb-1 text-primary-100">90 Minutes</p>
              <p className="text-4xl font-bold">₹2000</p>
              <p className="text-sm mt-2 opacity-80">+ Applicable taxes</p>
            </div>
          </div>
          <p className="mt-8 text-sm text-primary-200">* Corporate / Group Workshop pricing is customised. <Link href="/corporate-enquiry" className="underline hover:text-white transition-colors">Send Enquiry</Link> for a quote.</p>
        </div>
      </section>
    </div>
  );
}
