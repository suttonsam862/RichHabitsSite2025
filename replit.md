# Rich Habits Wrestling Events Platform

## Overview

Rich Habits is a comprehensive e-commerce and event management platform for wrestling camps and retail merchandise. The platform integrates Stripe payments, Shopify e-commerce, and custom registration systems to provide a complete solution for wrestling event management and product sales.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript and Vite build system
- **UI Components**: Radix UI components with Tailwind CSS styling
- **State Management**: React Query for server state management
- **Routing**: Client-side routing with catch-all server configuration
- **Payment UI**: Stripe React components for secure payment processing

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe queries
- **Authentication**: Supabase integration (currently bypassed for deployment)
- **Session Management**: Express sessions with PostgreSQL store

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle with automatic migrations
- **Session Storage**: Database-backed sessions table
- **File Storage**: Static asset serving for videos and images

### Authentication and Authorization
- **Provider**: Supabase (currently disabled for stability)
- **Fallback**: Temporary bypass allowing all requests
- **Session Security**: Secure cookie-based sessions
- **Role Management**: User roles defined in database schema

## Key Components

### Payment Processing System
- **Provider**: Stripe with comprehensive webhook handling
- **Security Features**: Bulletproof duplicate payment prevention
- **Validation**: Multi-layer payment verification system
- **Integration**: Automatic Shopify order creation from successful payments

### Event Registration System
- **Individual Registrations**: Full event and 1-day options
- **Team Registrations**: Batch processing with coach contact management
- **Pricing Logic**: Centralized pricing calculations with discount support
- **Data Integrity**: UUID-based atomic registration system

### E-commerce Integration
- **Platform**: Shopify Admin API for product and order management
- **Cart System**: Session-based cart with Shopify checkout
- **Product Display**: Dynamic product fetching from Shopify collections
- **Order Management**: Automatic order creation with complete metadata

### Discount and Pricing System
- **Admin Discounts**: 100% off codes for administrative use
- **Promotional Codes**: Percentage and fixed-price discounts
- **Team Pricing**: Automatic calculation for bulk registrations
- **1-Day Pricing**: 50% of full event pricing for single-day attendance

## Data Flow

### Event Registration Flow
1. User selects event and fills registration form
2. Frontend validates discount codes in real-time
3. Backend creates Stripe payment intent with metadata
4. User completes payment through Stripe
5. Webhook receives payment confirmation
6. System creates Shopify order with registration data
7. Confirmation email sent to registrant

### E-commerce Flow
1. User browses products via Shopify API
2. Items added to session-based cart
3. Shopify checkout session created
4. User redirected to Shopify for payment
5. Order completion handled by Shopify
6. User redirected back to platform

### Team Registration Flow
1. Coach submits team registration with athlete data
2. System creates team contact record and individual athlete records
3. Single payment intent created for total team cost
4. Payment processed through standard webhook flow
5. Single Shopify order created with team details

## External Dependencies

### Payment Services
- **Stripe**: Payment processing, webhooks, and customer management
- **Webhook Security**: Signature verification for all incoming webhooks

### E-commerce Platform
- **Shopify**: Product catalog, order management, and checkout
- **API Integration**: Admin API for order creation and product fetching

### Communication Services
- **SendGrid**: Email delivery for registration confirmations
- **Slack**: Error notifications and system monitoring

### Infrastructure
- **Neon**: Serverless PostgreSQL database hosting
- **Replit**: Application hosting and deployment platform

## Deployment Strategy

### Build Process
- **Client Build**: Vite compiles React app to `dist/public`
- **Server Build**: esbuild compiles TypeScript server to `dist/index.js`
- **Static Assets**: Video and image files served from `public` directory

### Environment Configuration
- **Development**: Hot-reloading with separate client and server processes
- **Production**: Single Node.js process serving built assets
- **Environment Variables**: Stripe keys, database URL, and service credentials

### Database Management
- **Migrations**: Drizzle migrations for schema changes
- **Connection Pooling**: Neon serverless pool with WebSocket support
- **Health Monitoring**: Database connection health checks

### Monitoring and Logging
- **Error Tracking**: Comprehensive error logging for payment failures
- **Performance Monitoring**: Request timing and success rate tracking
- **Health Endpoints**: System health and status monitoring

## Changelog

Changelog:
- June 13, 2025. Initial setup
- June 13, 2025. Fixed React hooks error and implemented complete add-to-cart functionality with localStorage-based storage, product card buttons, and cart page display
- June 13, 2025. Fixed React hooks error in Shop component and implemented server-side cart functionality with session persistence, proper Shopify ID validation, and complete cart page integration
- June 13, 2025. Fixed React hooks ordering violation in Shop component using useMemo, implemented mobile-responsive header with hamburger menu and proper sizing, verified add to cart functionality with session-based cart storage and toast notifications
- June 14, 2025. Completed comprehensive retail cart and checkout experience with Stripe payment processing, automatic Shopify order creation, variant selection tracking (size/color), professional cart page with quantity controls, and webhook integration for payment verification

## User Preferences

Preferred communication style: Simple, everyday language.