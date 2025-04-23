import { Link } from "wouter";
import { AnimatedUnderline } from "@/components/ui/animated-underline";
import { Container } from "@/components/ui/container";
import { motion } from "framer-motion";

const events = [
  {
    id: 1,
    title: "Elite Point Guard Clinic",
    category: "Basketball",
    categoryClass: "bg-[hsl(var(--accent)_/_0.1)] text-[hsl(var(--accent))]",
    date: "August 15, 2023 • 9:00 AM - 2:00 PM",
    description: "Intensive training for high school point guards focusing on ball handling, vision, and leadership.",
    price: "$89.00",
    link: "/events/elite-point-guard-clinic"
  },
  {
    id: 2,
    title: "Speed & Agility Camp",
    category: "Football",
    categoryClass: "bg-[hsl(var(--accent2)_/_0.1)] text-[hsl(var(--accent2))]",
    date: "September 3, 2023 • 10:00 AM - 3:00 PM",
    description: "Professional training methods to improve acceleration, lateral movement, and game speed.",
    price: "$125.00",
    link: "/events/speed-agility-camp"
  },
  {
    id: 3,
    title: "College Recruiting Workshop",
    category: "Multi-Sport",
    categoryClass: "bg-[hsl(var(--accent3)_/_0.1)] text-[hsl(var(--accent3))]",
    date: "October 12, 2023 • 6:00 PM - 8:30 PM",
    description: "Essential guidance for athletes and parents navigating the college recruitment process.",
    price: "$45.00",
    link: "/events/college-recruiting-workshop"
  }
];

export function EventsSection() {
  return (
    <section className="py-20 bg-white">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-serif font-semibold mb-4 group">
            <AnimatedUnderline>
              Upcoming Events
            </AnimatedUnderline>
          </h2>
          <p className="text-lg mb-12">Elite sports clinics and training events for dedicated athletes.</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="event-card bg-white border border-[hsl(var(--shadow))] p-6"
            >
              <div className="mb-4">
                <span className={`inline-block ${event.categoryClass} text-xs font-medium px-3 py-1`}>
                  {event.category}
                </span>
              </div>
              <h3 className="text-xl font-medium mb-2">{event.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{event.date}</p>
              <p className="text-gray-700 mb-4">{event.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-primary font-medium">{event.price}</span>
                <Link href={event.link} className="text-sm font-medium underline">
                  Register Now
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Link href="/events" className="inline-block border border-primary py-3 px-8 font-medium tracking-wide hover:bg-primary hover:text-white transition-colors">
            View All Events
          </Link>
        </div>
      </Container>
    </section>
  );
}
