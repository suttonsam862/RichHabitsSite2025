import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Container } from '@/components/ui/container';
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";

export default function CheckoutDebug() {
  const [variantId, setVariantId] = useState<string>('47808556531949'); // Texas Recruiting Clinic
  const [loading, setLoading] = useState<boolean>(false);
  
  // Use the Shopify domain
  const shopifyDomain = 'rich-habits-2022.myshopify.com';

  // Generate test checkout URLs
  const generateCheckoutUrl = () => {
    // Ensure variant ID is clean
    const cleanVariantId = variantId.replace(/\D/g, '');
    
    // Create the base URL with checkout_url parameter to prevent redirection
    const baseUrl = `https://${shopifyDomain}/cart/add?id=${cleanVariantId}&quantity=1&checkout_url=https://${shopifyDomain}/checkout`;
    
    // Create a success redirect URL (for testing return to our app)
    const successRedirectUrl = encodeURIComponent(
      `${window.location.origin}/checkout-debug?success=true&variantId=${cleanVariantId}`
    );
    
    // Create primary checkout URL with return_to parameter
    const checkoutUrl = `${baseUrl}&return_to=${successRedirectUrl}`;
    
    // Create alternative format URL (cart/{variant}:1)
    const altCheckoutUrl = `https://${shopifyDomain}/cart/${cleanVariantId}:1?checkout_url=https://${shopifyDomain}/checkout&return_to=${successRedirectUrl}`;
    
    return {
      checkoutUrl,
      altCheckoutUrl
    };
  };

  // Test primary checkout URL
  const testPrimaryCheckout = () => {
    setLoading(true);
    const { checkoutUrl } = generateCheckoutUrl();
    // Store the URLs in localStorage for access after redirect
    localStorage.setItem('debug_checkout_url', checkoutUrl);
    window.location.href = checkoutUrl;
  };

  // Test alternative checkout URL
  const testAltCheckout = () => {
    setLoading(true);
    const { altCheckoutUrl } = generateCheckoutUrl();
    // Store the URLs in localStorage for access after redirect
    localStorage.setItem('debug_alt_checkout_url', altCheckoutUrl);
    window.location.href = altCheckoutUrl;
  };

  // Test direct URL without return_to parameter
  const testDirectCheckout = () => {
    setLoading(true);
    const cleanVariantId = variantId.replace(/\D/g, '');
    const directUrl = `https://${shopifyDomain}/cart/add?id=${cleanVariantId}&quantity=1&checkout_url=https://${shopifyDomain}/checkout`;
    localStorage.setItem('debug_direct_url', directUrl);
    window.location.href = directUrl;
  };
  
  // Check if we returned from a checkout test
  const params = new URLSearchParams(window.location.search);
  const success = params.get('success') === 'true';

  return (
    <Container>
      <div className="py-10">
        <h1 className="text-2xl font-bold mb-2">Checkout Debug Tool</h1>
        <p className="text-gray-600 mb-6">
          This page lets you test different checkout URL formats directly to diagnose and fix any issues.
        </p>
        
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md mb-6">
            <h2 className="text-green-800 font-medium mb-2">Return Successful!</h2>
            <p className="text-green-700 text-sm">
              You were successfully redirected back from Shopify checkout, which means the return_to parameter worked correctly.
            </p>
          </div>
        )}
        
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
            <div>
              <h3 className="text-amber-800 font-medium mb-1">IMPORTANT</h3>
              <p className="text-amber-700 text-sm">
                This tool is for debugging purposes only. Add <code>checkout_url=https://{shopifyDomain}/checkout</code> to all
                checkout URLs to prevent Shopify from redirecting to a non-existent 404 page on the custom domain.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Checkout URL Generator</h2>
          
          <div className="mb-4">
            <Label htmlFor="variantId" className="block mb-2">Variant ID</Label>
            <Input
              id="variantId"
              type="text"
              value={variantId}
              onChange={(e) => setVariantId(e.target.value)}
              className="max-w-md"
              placeholder="Enter Shopify variant ID"
            />
            <p className="text-sm text-gray-500 mt-1">
              Example variant IDs: 47808556531949 (Texas), 47808555679981 (Birmingham), 47800987943149 (National)
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-6">
            <Button 
              onClick={testPrimaryCheckout} 
              disabled={loading}
              className="bg-primary hover:bg-primary/90"
            >
              Test Primary Checkout URL
            </Button>
            
            <Button 
              onClick={testAltCheckout}
              disabled={loading}
              className="bg-secondary hover:bg-secondary/90"
            >
              Test Alternative Checkout URL
            </Button>
            
            <Button 
              onClick={testDirectCheckout}
              disabled={loading}
              variant="outline"
            >
              Test Direct Checkout (No Return URL)
            </Button>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <div className="bg-gray-50 rounded-md p-6">
          <h2 className="text-xl font-semibold mb-4">URL Formats</h2>
          
          <div className="mb-4">
            <h3 className="font-medium text-gray-700 mb-2">Primary Format (cart/add)</h3>
            <div className="bg-gray-100 p-3 rounded text-sm font-mono overflow-x-auto">
              https://{shopifyDomain}/cart/add?id=VARIANT_ID&quantity=1&checkout_url=https://{shopifyDomain}/checkout&return_to=ENCODED_RETURN_URL
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium text-gray-700 mb-2">Alternative Format (cart/VARIANT:QTY)</h3>
            <div className="bg-gray-100 p-3 rounded text-sm font-mono overflow-x-auto">
              https://{shopifyDomain}/cart/VARIANT_ID:1?checkout_url=https://{shopifyDomain}/checkout&return_to=ENCODED_RETURN_URL
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium text-gray-700 mb-2">Direct Format (No Return)</h3>
            <div className="bg-gray-100 p-3 rounded text-sm font-mono overflow-x-auto">
              https://{shopifyDomain}/cart/add?id=VARIANT_ID&quantity=1&checkout_url=https://{shopifyDomain}/checkout
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
