# Rich Habits Wrestling Platform

A cutting-edge athlete engagement platform specializing in wrestling event management, with advanced mobile-optimized registration and sophisticated performance tracking.

## Technology Stack

- **Frontend:** React.js with TypeScript, Framer Motion, Tailwind CSS
- **Backend:** Express.js with TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **Payments:** Stripe integration
- **Email:** SendGrid service
- **Media:** Sharp image optimization
- **Deployment:** Replit with production optimization

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (Supabase recommended)
- Required environment variables (see Configuration section)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables (see Configuration section)

4. Push database schema:
   ```bash
   npm run db:push
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## Configuration

### Required Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=your_supabase_database_url

# Stripe (Payment Processing)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# SendGrid (Email Service)
SENDGRID_API_KEY=your_sendgrid_api_key

# Application
NODE_ENV=development
```

### Database Setup (Supabase)

1. Go to the [Supabase dashboard](https://supabase.com/dashboard/projects)
2. Create a new project
3. Once in the project page, click the "Connect" button on the top toolbar
4. Copy URI value under "Connection string" → "Transaction pooler"
5. Replace `[YOUR-PASSWORD]` with the database password you set for the project
6. Use this as your `DATABASE_URL`

## Key Features

### Advanced Registration System
- **Unified Registration Table:** Consolidated event registrations with payment verification
- **Team & Individual Registration:** Support for both registration types
- **Real-time Payment Processing:** Stripe integration with webhook validation
- **Email Verification:** Automated confirmation emails via SendGrid

### Performance Optimizations
- **React Code-Splitting:** Lazy loading for all route-level pages
- **Media Optimization:** Sharp-based image resizing with lazy loading
- **Intelligent Prefetching:** Preloads commonly visited pages
- **Error Boundaries:** Comprehensive error handling system

### Production Features
- **Global Error Handling:** Express middleware with proper logging
- **404 Fallback Routes:** Custom NotFound components
- **Media Retry Logic:** Automatic retry for failed media loads
- **Migration System:** Idempotent data migration scripts

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Push database schema changes
npm run db:push

# Run data migration (if needed)
tsx scripts/migrateCompletedRegistrations.ts
```

## Database Migration

If you have legacy data in `completed_event_registrations`, use the migration script:

```bash
tsx scripts/migrateCompletedRegistrations.ts
```

This script:
- Creates automatic backups before migration
- Safely migrates data to the unified `registrations` table
- Is idempotent (safe to re-run)
- Provides detailed migration reports
- Handles errors gracefully

## Architecture Overview

### Frontend Structure
```
client/src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── layout/         # Layout components
│   └── OptimizedMedia.tsx # Media optimization
├── pages/              # Route-level pages (lazy loaded)
├── hooks/              # Custom React hooks
└── contexts/           # React contexts
```

### Backend Structure
```
server/
├── index.ts            # Main server entry point
├── routes.ts           # API route definitions
├── storage.ts          # Database operations
├── stripe.ts           # Stripe payment handling
└── imageOptimizer.ts   # Media optimization
```

### Database Schema
```
shared/schema.ts        # Unified database schema
```

## Authentication Flow

The platform uses Supabase Auth with JWT validation:

1. User registration/login through Supabase Auth
2. JWT tokens passed to backend for verification
3. Protected routes require valid authentication
4. Session management handled client-side

## Payment Processing

Stripe integration handles:
- **Payment Intents:** Secure payment processing
- **Webhooks:** Real-time payment verification
- **Automatic Order Creation:** Shopify integration for merchandise
- **Refund Processing:** Administrative refund capabilities

## Media Optimization

The platform includes advanced media handling:
- **Dynamic Image Resizing:** Sharp-based optimization with query parameters
- **Lazy Loading:** Intersection Observer for performance
- **Retry Logic:** Automatic retry for failed loads
- **MIME Type Correction:** Proper video/audio serving

## Error Handling

Comprehensive error management:
- **Global Express Middleware:** Catches and logs all server errors
- **React Error Boundaries:** Frontend error containment
- **Custom 404 Pages:** User-friendly error pages
- **Production Security:** No stack traces in production

## Deployment

### Production Checklist

1. Set `NODE_ENV=production`
2. Configure all environment variables
3. Run database migrations
4. Build the application: `npm run build`
5. Start production server: `npm start`

### Replit Deployment

The application is optimized for Replit deployment:
- Automatic port detection
- Static file serving
- Environment variable management
- Hot reload in development

## Performance Monitoring

Key metrics to monitor:
- **Initial Page Load:** React code-splitting reduces bundle size
- **Media Loading:** Optimized images and lazy loading
- **Database Queries:** Efficient Drizzle ORM operations
- **Error Rates:** Comprehensive logging system

## Security Features

- **Environment Variable Protection:** Sensitive data in environment
- **CORS Configuration:** Proper cross-origin handling
- **Rate Limiting:** Express rate limiting middleware
- **Input Validation:** Zod schema validation
- **SQL Injection Prevention:** Drizzle ORM protection

## Support

For technical support or questions:
1. Check the application logs for error details
2. Verify environment variables are correctly set
3. Ensure database connectivity
4. Review Stripe webhook configuration

## Contributing

When making changes:
1. Follow TypeScript best practices
2. Use the existing component patterns
3. Add proper error handling
4. Test migration scripts thoroughly
5. Update documentation as needed

---

**Rich Habits Wrestling Platform** - Built for performance, designed for growth.