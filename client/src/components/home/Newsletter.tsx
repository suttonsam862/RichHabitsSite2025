import { useState } from "react";
import { Container } from "@/components/ui/container";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // This would normally send the data to an API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network request
      
      toast({
        title: "Successfully subscribed!",
        description: "Thank you for joining our community.",
      });
      
      setEmail("");
    } catch (error) {
      toast({
        title: "Subscription failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-[hsl(var(--secondary))]">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-3xl font-serif font-semibold mb-4">Join Our Community</h2>
          <p className="text-lg mb-8">Subscribe for exclusive releases, event notifications, and training insights.</p>
          
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 mb-4">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-grow py-3 px-4 border border-[hsl(var(--shadow))] focus:border-primary focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button 
              type="submit" 
              className="bg-primary text-white py-3 px-6 font-medium hover:bg-opacity-90 transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
          
          <p className="text-sm text-gray-600">We respect your privacy. Unsubscribe at any time.</p>
        </motion.div>
      </Container>
    </section>
  );
}
