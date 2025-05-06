import { useState } from "react";
import { Container } from "@/components/ui/container";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);
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
      // Import the submission function
      const { subscribeToNewsletter } = await import('@/lib/shopify');
      await subscribeToNewsletter(email);
      
      // Set success state instead of showing toast and resetting form
      setSubmissionComplete(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Please try again later.';
      
      toast({
        title: "Subscription failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-[hsl(var(--secondary))]">
      <Container>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-serif font-semibold mb-4">Join Our Community</h2>
          <p className="text-lg mb-8">Subscribe for exclusive releases, event notifications, and training insights.</p>
          
          {submissionComplete ? (
            <div className="bg-white p-8 shadow-sm text-center rounded-lg">
              <div className="flex items-center justify-center mb-4">
                <svg className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Subscription Confirmed!</h3>
              <p className="text-gray-700 mb-6">Thank you for joining our community. You'll start receiving updates soon.</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-gray-200 text-gray-800 py-2 px-4 font-medium hover:bg-gray-300 transition-colors rounded-md"
              >
                Subscribe Another Email
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 mb-4">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="flex-grow py-3 px-4 border border-[hsl(var(--shadow))] focus:border-primary focus:outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
                <button 
                  type="submit" 
                  className={`${isSubmitting ? 'bg-gray-500' : 'bg-primary'} text-white py-3 px-6 font-medium hover:bg-opacity-90 transition-colors`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Subscribing..." : "Subscribe"}
                </button>
              </form>
              
              <p className="text-sm text-gray-600">We respect your privacy. Unsubscribe at any time.</p>
            </>
          )}
        </div>
      </Container>
    </section>
  );
}
