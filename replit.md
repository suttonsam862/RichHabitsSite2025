# Rich Habits Wrestling Events Platform

## Overview

Rich Habits is a full-stack web application for managing wrestling event registrations and retail sales. The platform combines event registration with Stripe payment processing and retail product management through Shopify integration. Built with React/TypeScript frontend, Express.js backend, and PostgreSQL database using Drizzle ORM.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack React Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Payment UI**: Stripe React components for secure payment forms

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Payment Processing**: Stripe for event registrations and retail payments
- **Session Management**: Express-session with database storage
- **API Design**: RESTful endpoints with modular route organization

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle with typed schema definitions
- **Schema Strategy**: UUID-based entities with comprehensive audit trails
- **Session Storage**: Database-backed sessions for scalability
- **Migration Strategy**: Drizzle Kit for schema migrations

## Key Components

### Event Registration System
- Multi-event support (Birmingham Slam Camp, National Champ Camp, Texas Recruiting Clinic, Panther Train Tour)
- Dynamic pricing with discount code validation
- Comprehensive athlete data collection (age, grade, experience, t-shirt size)
- Payment intent creation with bulletproof error handling
- Registration status tracking and email confirmations

### Retail Integration
- Shopify product catalog integration
- Cart management with session persistence
- Variant selection and inventory tracking
- Automated order creation via Stripe webhooks

### Payment Processing
- Stripe payment intents for secure transactions
- Discount code validation and application
- Payment error logging and recovery
- Webhook handling for order fulfillment
- Comprehensive payment audit trails

### User Management
- Role-based access (customer, coach, designer, staff, sales_agent, admin)
- Team/organization hierarchy support
- OAuth and password authentication ready
- Comprehensive user profiles with preferences

## Data Flow

### Event Registration Flow
1. User selects event and fills registration form
2. Frontend validates data and calculates pricing
3. Payment intent created via backend API
4. Stripe payment form handles secure card processing
5. Webhook confirms payment and creates registration record
6. Email confirmation sent to customer

### Retail Purchase Flow
1. User browses Shopify product catalog
2. Items added to session-based cart
3. Checkout creates Stripe payment intent
4. Payment confirmation triggers Shopify order creation
5. Inventory automatically updated

### Analytics and Monitoring
- Comprehensive error logging for payment failures
- Visitor tracking with device and UTM analysis
- Registration conversion funnel analysis
- Payment intent failure diagnostics

## External Dependencies

### Payment Services
- **Stripe**: Primary payment processor for all transactions
- **PayPal**: Secondary payment option (SDK integrated)

### E-commerce Platform
- **Shopify**: Product catalog and inventory management
- **Shopify Admin API**: Order creation and inventory updates
- **Shopify Storefront API**: Product browsing and cart management

### Communication Services
- **SendGrid**: Email notifications and confirmations
- **Slack**: Internal notifications and alerts

### Database and Infrastructure
- **Neon**: Serverless PostgreSQL hosting
- **Supabase**: Authentication and real-time features (configured but not active)

### AI and Analytics
- **Anthropic Claude**: Content generation and assistance
- **Native Analytics**: Custom visitor tracking system

## Deployment Strategy

### Development Environment
- Replit development environment with hot reloading
- Local PostgreSQL via Replit modules
- Environment variable management
- Concurrent client/server development

### Production Deployment
- **Platform**: Google Cloud Run via Replit deployment
- **Build Process**: Vite for client, esbuild for server bundling
- **Port Configuration**: Dynamic port binding with PORT environment variable
- **Static Assets**: Served from public directory with optimized caching
- **Health Checks**: Comprehensive health endpoint for monitoring

### Build Configuration
- Client builds to `dist/public` directory
- Server bundles to `dist/index.js`
- Static asset optimization with chunking strategy
- TypeScript compilation with strict type checking

## Changelog
- June 17, 2025: **HEADER LOGO RESOLVED** Fixed logo rendering by replacing image element with styled SVG, eliminating browser fallback issues
- June 17, 2025: **PRODUCTION SYNC** Synchronized Replit preview with live domain rich-habits.com for consistent image and video display across all pages
- June 17, 2025: **LOGO FIX** Fixed header logo display by creating SVG version and enhancing server routing with production fallback
- June 17, 2025: **IMAGE SYNCHRONIZATION** Connected development and production image serving with automatic fallback system for header, events, and custom clothing images
- June 17, 2025: **SHOPIFY INTEGRATION** Added complete Shopify order creation and webhook handler to production deployment for Birmingham Slam Camp registrations
- June 17, 2025: **PRODUCTION FIX** Fixed Birmingham Slam Camp payment error in deployed domain by converting CommonJS require() to ES module import() in dist/index.js
- June 17, 2025: **RESOLVED** Birmingham Slam Camp registration error - implemented clean payment endpoint with ES module exports
- June 17, 2025: Server successfully running with clean payment processing for event registrations
- June 17, 2025: Fixed Birmingham Slam Camp registration error by resolving module import conflict with errorLogs schema
- June 17, 2025: Temporarily disabled error logging system to restore payment intent creation functionality
- June 17, 2025: Created isolated payment endpoint to bypass problematic dependencies
- June 16, 2025: Fixed deployment error by removing missing image import from Home.tsx
- June 16, 2025: Added error handling for missing images to prevent build failures
- June 16, 2025: Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.