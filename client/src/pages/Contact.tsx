import { useState } from "react";
import Container from "../components/layout/Container";
import { motion } from "framer-motion";
import { useToast } from "../hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { submitContactForm } from "../lib/shopify";
import { Helmet } from "react-helmet";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  subject: z.string().min(2, "Subject must be at least 2 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  async function onSubmit(data: ContactFormValues) {
    setIsSubmitting(true);
    
    try {
      await submitContactForm(data);
      
      // Set submission complete instead of resetting form and showing toast
      setSubmissionComplete(true);
    } catch (error) {
      toast({
        title: "Error sending message",
        description: "Please try again later or contact us directly by phone.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Contact | Rich Habits</title>
        <meta name="description" content="Get in touch with Rich Habits. Send us a message or find our contact information." />
      </Helmet>
      
      <div className="bg-white">
        {/* Hero Section */}
        <section className="relative h-[40vh] flex items-center">
          <div className="absolute inset-0 w-full h-full">
            <img 
              src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80" 
              alt="Contact us" 
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          </div>
          
          <Container className="relative z-10 text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl font-serif font-bold mb-4">Contact Us</h1>
              <p className="text-xl">Get in touch with our team.</p>
            </motion.div>
          </Container>
        </section>
        
        {/* Contact Information Section */}
        <section className="py-16">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6"
              >
                <div className="w-16 h-16 bg-[hsl(var(--secondary))] rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="icon ion-md-mail text-2xl"></i>
                </div>
                <h3 className="text-xl font-medium mb-3">Email</h3>
                <p className="text-gray-700 mb-2">For general inquiries:</p>
                <a href="mailto:admin@rich-habits.com" className="text-[hsl(var(--accent))] hover:underline">admin@rich-habits.com</a>
                
                <p className="text-gray-700 mt-3 mb-2">For custom team orders:</p>
                <a href="mailto:samsutton@rich-habits.com" className="text-[hsl(var(--accent))] hover:underline">samsutton@rich-habits.com</a>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-center p-6"
              >
                <div className="w-16 h-16 bg-[hsl(var(--secondary))] rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="icon ion-md-call text-2xl"></i>
                </div>
                <h3 className="text-xl font-medium mb-3">Phone</h3>
                <p className="text-gray-700 mb-2">Customer Service:</p>
                <a href="tel:+14808104477" className="text-[hsl(var(--accent))] hover:underline">+1 (480) 810-4477</a>
                
                <p className="text-gray-700 mt-3 mb-2">Hours of Operation:</p>
                <p className="text-gray-700">Monday - Friday: 9am - 5pm EST</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-center p-6"
              >
                <div className="w-16 h-16 bg-[hsl(var(--secondary))] rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="icon ion-md-locate text-2xl"></i>
                </div>
                <h3 className="text-xl font-medium mb-3">Location</h3>
                <p className="text-gray-700 mb-2">Mailing Address:</p>
                <address className="text-gray-700 not-italic">
                  3101 Whitehall Rd
                </address>
              </motion.div>
            </div>
          </Container>
        </section>
        
        {/* Contact Form Section */}
        <section className="py-16 bg-[hsl(var(--secondary))]">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-serif font-semibold mb-6 group">
                  <AnimatedUnderline>
                    Send Us a Message
                  </AnimatedUnderline>
                </h2>
                <p className="text-lg mb-8">
                  Have a question about our products or services? Fill out the form and we'll get back to you as soon as possible.
                </p>
                
                {submissionComplete ? (
                  <div className="bg-white p-8 shadow-sm text-center rounded-lg">
                    <div className="flex items-center justify-center mb-4">
                      <svg className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-medium mb-2">Message Received!</h3>
                    <p className="text-gray-700 mb-6">Thank you for reaching out. We'll get back to you as soon as possible.</p>
                    <button 
                      onClick={() => window.location.reload()}
                      className="bg-gray-200 text-gray-800 py-2 px-4 font-medium hover:bg-gray-300 transition-colors rounded-md"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Your Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="John Doe" 
                                  {...field} 
                                  disabled={isSubmitting}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="john@example.com" 
                                  {...field} 
                                  disabled={isSubmitting}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="(123) 456-7890" 
                                  {...field} 
                                  disabled={isSubmitting}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Product Inquiry" 
                                  {...field} 
                                  disabled={isSubmitting}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Please let us know how we can help you."
                                className="min-h-[150px] resize-none" 
                                {...field} 
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className={`${isSubmitting ? 'bg-gray-500' : 'bg-primary'} text-white hover:bg-opacity-90 w-full md:w-auto`}
                      >
                        {isSubmitting ? "Sending..." : "Send Message"}
                      </Button>
                    </form>
                  </Form>
                )}
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="h-full"
              >
                <div className="h-full min-h-[400px]">
                  {/* Embedded map */}
                  <div className="relative h-full w-full bg-gray-200 flex items-center justify-center">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2948.2321574127696!2d-71.06530687186771!3d42.36028543520776!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89e3709292cfa4d5%3A0x2e0ae69aec8d831c!2sBoston%2C%20MA%2002110!5e0!3m2!1sen!2sus!4v1656296153732!5m2!1sen!2sus"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={false}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Rich Habits Location"
                    ></iframe>
                  </div>
                </div>
              </motion.div>
            </div>
          </Container>
        </section>
        
        {/* FAQ Section */}
        <section className="py-16">
          <Container>
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-serif font-semibold mb-8 text-center group">
                <AnimatedUnderline>
                  Frequently Asked Questions
                </AnimatedUnderline>
              </h2>
              
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 shadow-sm"
                >
                  <h3 className="text-xl font-medium mb-3">What is your return policy?</h3>
                  <p className="text-gray-700">We offer a 30-day return policy for unworn, unwashed items in their original packaging. Custom team orders are final sale unless defective.</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 shadow-sm"
                >
                  <h3 className="text-xl font-medium mb-3">How long does shipping take?</h3>
                  <p className="text-gray-700">Standard shipping takes 3-5 business days within the continental US. Expedited shipping options are available at checkout. Custom team orders take anywhere from 20-60 days to complete when fully customized, depending on size and variability. Once completed, they take about a week to ship.</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 shadow-sm"
                >
                  <h3 className="text-xl font-medium mb-3">How do I start a custom team order?</h3>
                  <p className="text-gray-700">Fill out the request form on our Custom Apparel page or email samsutton@rich-habits.com with your requirements. Our design team will schedule a consultation to discuss your needs.</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 shadow-sm"
                >
                  <h3 className="text-xl font-medium mb-3">Do you offer bulk discounts?</h3>
                  <p className="text-gray-700">Yes, we offer tiered discounts based on order quantity. Contact our sales team at admin@rich-habits.com for a custom quote.</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 shadow-sm"
                >
                  <h3 className="text-xl font-medium mb-3">How do I register for an event?</h3>
                  <p className="text-gray-700">Visit our Events page, select the event you're interested in, and click "Register Now". Follow the prompts to complete your registration and payment.</p>
                </motion.div>
              </div>
            </div>
          </Container>
        </section>
      </div>
    </>
  );
}
