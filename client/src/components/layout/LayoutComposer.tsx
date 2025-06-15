import React, { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import MaintenanceBanner from './MaintenanceBanner';

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  showMaintenance?: boolean;
  className?: string;
}

export function Layout({ 
  children, 
  showHeader = true, 
  showFooter = true, 
  showMaintenance = true,
  className = '' 
}: LayoutProps) {
  return (
    <div className={`flex flex-col min-h-screen ${className}`}>
      {showMaintenance && <MaintenanceBanner />}
      {showHeader && <Header />}
      <main className={`flex-grow ${showHeader ? 'pt-16' : ''}`}>
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}

// Specialized layout variants
export function EventLayout({ children }: { children: ReactNode }) {
  return (
    <Layout showMaintenance={false} className="bg-gray-50">
      {children}
    </Layout>
  );
}

export function RetailLayout({ children }: { children: ReactNode }) {
  return (
    <Layout className="bg-white">
      {children}
    </Layout>
  );
}

export function MinimalLayout({ children }: { children: ReactNode }) {
  return (
    <Layout showHeader={false} showFooter={false} showMaintenance={false}>
      {children}
    </Layout>
  );
}