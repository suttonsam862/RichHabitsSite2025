import React from "react";
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet';
import shopifyClient from '@/lib/shopifyClient';

export default function AddToCart() {
  const [location, navigate] = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const addToCart = async () => {
      try {
        // Get parameters from the URL
        const params = new URLSearchParams(window.location.search);
        const variantId = params.get('variantId');
        const quantity = params.get('quantity');
        
        // Check if required parameters are present
        if (!variantId) {
          setError('Missing required parameter: variantId');
          setLoading(false);
          return;
        }
        
        // Check if there's an existing cart in localStorage
        let cartId = localStorage.getItem('shopify_cart_id');
        let cart;
        
        // If there's no existing cart, create one
        if (!cartId) {
          cart = await shopifyClient.checkout.create();
          if (cart && cart.id) {
            localStorage.setItem('shopify_cart_id', cart.id);
            cartId = cart.id;
          } else {
            throw new Error('Failed to create cart');
          }
        } else {
          // Fetch the existing cart
          try {
            cart = await shopifyClient.checkout.fetch(cartId);
          } catch (error) {
            console.error('Error fetching existing cart, creating new one:', error);
            cart = await shopifyClient.checkout.create();
            if (cart && cart.id) {
              localStorage.setItem('shopify_cart_id', cart.id);
              cartId = cart.id;
            } else {
              throw new Error('Failed to create cart');
            }
          }
        }
        
        // Add the item to the cart
        const lineItems = [{
          variantId,
          quantity: quantity ? parseInt(quantity) : 1
        }];
        
        // Update the cart with the new item
        const updatedCart = await shopifyClient.checkout.addLineItems(cartId, lineItems);
        
        // Success, redirect to cart page
        setSuccess(true);
        setLoading(false);
        
        // Auto-redirect to cart page after a short delay
        setTimeout(() => {
          navigate('/embedded-cart');
        }, 1500);
      } catch (error) {
        console.error('Error adding item to cart:', error);
        setError('Failed to add item to cart. Please try again.');
        setLoading(false);
      }
    };
    
    addToCart();
  }, [navigate]);
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <Helmet>
          <title>Error Adding to Cart | Rich Habits</title>
        </Helmet>
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-4">Error Adding to Cart</h1>
          <p className="mb-6 text-gray-600">{error}</p>
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full py-2 px-4 bg-primary text-white rounded hover:bg-primary/90"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <Helmet>
          <title>Adding to Cart | Rich Habits</title>
        </Helmet>
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Adding to Cart</h1>
          <p className="mb-6 text-gray-600">
            Please wait while we add this item to your cart...
          </p>
        </div>
      </div>
    );
  }
  
  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <Helmet>
          <title>Added to Cart | Rich Habits</title>
        </Helmet>
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
          <div className="text-green-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Added to Cart!</h1>
          <p className="mb-6 text-gray-600">
            The item has been added to your cart. You are being redirected to your cart...
          </p>
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => navigate('/embedded-cart')}
              className="w-full py-2 px-4 bg-primary text-white rounded hover:bg-primary/90"
            >
              View Cart
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Fallback UI (should not be shown)
  return null;
}