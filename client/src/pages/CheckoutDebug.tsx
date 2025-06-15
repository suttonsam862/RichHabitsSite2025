import React from "react";
/**
 * This page provides debugging tools for Shopify checkout URLs
 * to help identify and fix issues with the checkout process.
 */
import { useState } from 'react';
import { useToast } from '../hooks/use-toast';
import { Container } from '../components/Container';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { createDirectShopifyCartUrl, createAddToCartUrl, attemptDirectCheckout, SHOPIFY_DOMAIN } from '../lib/shopifyRedirectFix';

export default function CheckoutDebug() {
  const [variantId, setVariantId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [returnUrl, setReturnUrl] = useState<string>('');
  const [directCartUrl, setDirectCartUrl] = useState<string>('');
  const [addToCartUrl, setAddToCartUrl] = useState<string>('');
  const { toast } = useToast();

  // Function to generate URLs based on input
  const generateUrls = () => {
    if (!variantId.trim()) {
      toast({
        title: "Variant ID Required",
        description: "Please enter a Shopify product variant ID to continue.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Generate direct cart URL
      const directUrl = createDirectShopifyCartUrl(variantId, parseInt(quantity) || 1);
      setDirectCartUrl(directUrl);

      // Generate add to cart URL
      const cartUrl = createAddToCartUrl(
        variantId, 
        parseInt(quantity) || 1,
        returnUrl.trim() ? returnUrl : undefined
      );
      setAddToCartUrl(cartUrl);

      toast({
        title: "URLs Generated",
        description: "Checkout URLs have been created successfully.",
      });
    } catch (error) {
      console.error('Error generating URLs:', error);
      toast({
        title: "URL Generation Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  // Function to attempt checkout with current variant ID
  const tryCheckout = () => {
    if (!variantId.trim()) {
      toast({
        title: "Variant ID Required",
        description: "Please enter a Shopify product variant ID to continue.",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "Attempting Checkout",
        description: "Redirecting to Shopify...",
      });

      // Use our utility to attempt checkout with multiple fallback methods
      attemptDirectCheckout(variantId, parseInt(quantity) || 1);
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Copied to Clipboard",
          description: "The URL has been copied to your clipboard.",
        });
      },
      (err) => {
        toast({
          title: "Copy Failed",
          description: "Could not copy to clipboard: " + err,
          variant: "destructive"
        });
      }
    );
  };

  return (
    <Container className="py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Shopify Checkout Debug Tool</h1>
        <p className="text-gray-600 mb-6">
          This tool helps diagnose and fix Shopify checkout issues by creating reliable checkout URLs.
        </p>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Input Parameters</CardTitle>
            <CardDescription>
              Enter a Shopify variant ID to generate checkout URLs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="variantId">Variant ID <span className="text-red-500">*</span></Label>
                  <Input
                    id="variantId"
                    placeholder="e.g., 47808556531949 or gid://shopify/ProductVariant/47808556531949"
                    value={variantId}
                    onChange={(e) => setVariantId(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Enter a Shopify variant ID in any format (numeric or GraphQL)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="returnUrl">Return URL (Optional)</Label>
                <Input
                  id="returnUrl"
                  placeholder="e.g., https://your-site.com/success"
                  value={returnUrl}
                  onChange={(e) => setReturnUrl(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Where to redirect after checkout (leave empty for default)
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between flex-wrap gap-4">
            <Button onClick={generateUrls}>Generate Checkout URLs</Button>
            <Button variant="outline" onClick={tryCheckout}>Test Direct Checkout</Button>
          </CardFooter>
        </Card>

        {(directCartUrl || addToCartUrl) && (
          <Tabs defaultValue="direct-cart">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="direct-cart">Direct Cart URL</TabsTrigger>
              <TabsTrigger value="add-to-cart">Add to Cart URL</TabsTrigger>
            </TabsList>

            <TabsContent value="direct-cart">
              <Card>
                <CardHeader>
                  <CardTitle>Direct Cart URL</CardTitle>
                  <CardDescription>
                    More reliable method that directly accesses the cart with a specific format
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-gray-50 rounded-md overflow-x-auto">
                    <pre className="text-xs md:text-sm break-all whitespace-pre-wrap">
                      {directCartUrl}
                    </pre>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex flex-wrap gap-3">
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(directCartUrl)}>
                      Copy URL
                    </Button>
                    <Button size="sm" onClick={() => window.open(directCartUrl, '_blank')}>
                      Test URL
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="add-to-cart">
              <Card>
                <CardHeader>
                  <CardTitle>Add to Cart URL</CardTitle>
                  <CardDescription>
                    Standard method using the cart/add endpoint (may be subject to redirection issues)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-gray-50 rounded-md overflow-x-auto">
                    <pre className="text-xs md:text-sm break-all whitespace-pre-wrap">
                      {addToCartUrl}
                    </pre>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex flex-wrap gap-3">
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(addToCartUrl)}>
                      Copy URL
                    </Button>
                    <Button size="sm" onClick={() => window.open(addToCartUrl, '_blank')}>
                      Test URL
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        <Separator className="my-8" />

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
          <h2 className="font-bold text-amber-800 mb-2">Important Notes</h2>
          <ul className="list-disc list-inside text-amber-700 space-y-1 text-sm">
            <li>Shopify redirects from rich-habits-2022.myshopify.com to rich-habits.com which can cause checkout errors</li>
            <li>This tool helps bypass this issue by using a specific URL format that avoids the domain redirection</li>
            <li>The direct cart URL format is the most reliable method for bypassing domain redirection issues</li>
            <li>All generated URLs will force the checkout to stay on the myshopify.com domain</li>
          </ul>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h2 className="font-bold text-gray-800 mb-2">How to Use This Tool</h2>
          <ol className="list-decimal list-inside text-gray-700 space-y-1 text-sm">
            <li>Enter a Shopify variant ID (in any format)</li>
            <li>Set the quantity (defaults to 1)</li>
            <li>Optionally add a return URL for after checkout</li>
            <li>Click "Generate Checkout URLs" to create checkout links</li>
            <li>Use "Test Direct Checkout" to immediately attempt a checkout with the entered variant ID</li>
            <li>Copy the generated URLs or test them directly with the provided buttons</li>
          </ol>
          <p className="mt-4 text-sm text-gray-600">
            Current Shopify domain: <code className="bg-gray-200 px-1 py-0.5 rounded">{SHOPIFY_DOMAIN}</code>
          </p>
        </div>
      </div>
    </Container>
  );
}
