import React from "react";
import { Helmet } from "react-helmet";

export default function ReturnPolicy() {
  return (
    <>
      <Helmet>
        <title>Return Policy - Rich Habits</title>
        <meta name="description" content="Return and refund policy for Rich Habits athletic apparel." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-serif font-semibold mb-8">Return Policy</h1>
        
        <div className="prose max-w-none">
          <p className="text-lg mb-6">
            Last Updated: April 27, 2025
          </p>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
            <p className="text-blue-700 font-medium">
              We always offer returns on all our products. If you're not satisfied with your purchase for any reason, 
              simply email us at returns@richhabits.com and we'll assist you with the return process.
            </p>
          </div>
          
          <h2 className="text-2xl font-medium mt-8 mb-4">Return Process</h2>
          <p>
            To initiate a return, please follow these simple steps:
          </p>
          <ol className="list-decimal pl-6 mb-6">
            <li>Email us at returns@richhabits.com with your order number and reason for return.</li>
            <li>Our customer service team will respond within 24-48 hours with return instructions.</li>
            <li>Once your return is approved, you'll receive a prepaid shipping label.</li>
            <li>Package your items securely and attach the shipping label.</li>
            <li>Drop off your package at any authorized shipping location.</li>
          </ol>
          
          <h2 className="text-2xl font-medium mt-8 mb-4">Return Eligibility</h2>
          <p>
            To be eligible for a return, please ensure that:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>The item is unused and in the same condition that you received it.</li>
            <li>The item is in its original packaging.</li>
            <li>You have the receipt or proof of purchase.</li>
            <li>The return is initiated within 30 days of receiving your order.</li>
          </ul>
          
          <h2 className="text-2xl font-medium mt-8 mb-4">Refunds</h2>
          <p>
            Once your return is received and inspected, we will send you an email to notify you that we have 
            received your returned item. We will also notify you of the approval or rejection of your refund.
          </p>
          <p>
            If approved, your refund will be processed, and a credit will automatically be applied to your 
            original method of payment within 5-7 business days.
          </p>
          
          <h2 className="text-2xl font-medium mt-8 mb-4">Exchanges</h2>
          <p>
            If you need to exchange an item for a different size or color, please email us at returns@richhabits.com 
            with your order number and exchange request details. We'll guide you through the exchange process.
          </p>
          
          <h2 className="text-2xl font-medium mt-8 mb-4">Custom Orders & Event Registrations</h2>
          <p>
            Please note that custom team apparel orders and event registrations have special return policies:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Custom apparel orders cannot be returned unless there is a manufacturing defect.</li>
            <li>Event registrations can be refunded up to 14 days before the event date, after which they are non-refundable but may be transferred to another participant.</li>
          </ul>
          
          <h2 className="text-2xl font-medium mt-8 mb-4">Damaged or Defective Items</h2>
          <p>
            If you receive a damaged or defective item, please email us at returns@richhabits.com immediately 
            with photos of the damage. We will replace the item at no additional cost to you.
          </p>
          
          <h2 className="text-2xl font-medium mt-8 mb-4">Contact Us</h2>
          <p>
            If you have any questions about our return policy, please contact us at:
          </p>
          <p className="mb-6">
            <strong>Email:</strong> returns@richhabits.com
          </p>
        </div>
      </div>
    </>
  );
}