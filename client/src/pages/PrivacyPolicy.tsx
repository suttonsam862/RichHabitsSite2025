import React from "react";
import { Helmet } from "react-helmet";

export default function PrivacyPolicy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - Rich Habits</title>
        <meta name="description" content="Privacy Policy for Rich Habits athletic apparel." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-serif font-semibold mb-8">Privacy Policy</h1>
        
        <div className="prose max-w-none">
          <p className="text-lg mb-6">
            Last Updated: April 27, 2025
          </p>
          
          <h2 className="text-2xl font-medium mt-8 mb-4">Introduction</h2>
          <p>
            At Rich Habits, we respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you about how we look after your personal data when you visit 
            our website and tell you about your privacy rights and how the law protects you.
          </p>
          
          <h2 className="text-2xl font-medium mt-8 mb-4">The Data We Collect</h2>
          <p>
            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Identity Data: includes first name, last name, username or similar identifier.</li>
            <li>Contact Data: includes billing address, delivery address, email address and telephone numbers.</li>
            <li>Transaction Data: includes details about payments to and from you and other details of products you have purchased from us.</li>
            <li>Technical Data: includes internet protocol (IP) address, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
          </ul>
          
          <h2 className="text-2xl font-medium mt-8 mb-4">How We Use Your Data</h2>
          <p>
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>To process and deliver your order.</li>
            <li>To manage our relationship with you.</li>
            <li>To improve our website, products/services, marketing or customer relationships.</li>
            <li>To recommend products or services that may be of interest to you.</li>
          </ul>
          
          <h2 className="text-2xl font-medium mt-8 mb-4">Data Security</h2>
          <p>
            We have put in place appropriate security measures to prevent your personal data from being 
            accidentally lost, used or accessed in an unauthorized way, altered or disclosed. We also 
            limit access to your personal data to those employees, agents, contractors and other third 
            parties who have a business need to know.
          </p>
          
          <h2 className="text-2xl font-medium mt-8 mb-4">Your Legal Rights</h2>
          <p>
            Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Request access to your personal data.</li>
            <li>Request correction of your personal data.</li>
            <li>Request erasure of your personal data.</li>
            <li>Object to processing of your personal data.</li>
            <li>Request restriction of processing your personal data.</li>
            <li>Request transfer of your personal data.</li>
            <li>Right to withdraw consent.</li>
          </ul>
          
          <h2 className="text-2xl font-medium mt-8 mb-4">Contact Us</h2>
          <p>
            If you have any questions about this privacy policy or our privacy practices, please contact us at:
          </p>
          <p className="mb-6">
            <strong>Email:</strong> info@richhabits.com
          </p>
        </div>
      </div>
    </>
  );
}