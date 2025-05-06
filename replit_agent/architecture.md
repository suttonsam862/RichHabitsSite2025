# Rich Habits Architecture

## Overview

Rich Habits is a full-stack web application for athletic apparel and event registration, built with a React frontend and Express.js backend. The application provides e-commerce functionality for athletic apparel sales, event registration management, and custom apparel inquiries. The system integrates with Shopify for product management and Stripe for payment processing, with a PostgreSQL database managed through Drizzle ORM for storing application-specific data.

## System Architecture

The application follows a modern single-page application (SPA) architecture with separate client and server components:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────────┐
│             │     │             │     │                     │
│  React SPA  │────▶│  Express.js │────▶│  PostgreSQL (Neon)  │
│  (Client)   │     │  (Server)   │     │                     │
│             │     │             │     │                     │
└─────────────┘     └─────────────┘     └─────────────────────┘
       │                   │                      
       │                   │                      
       ▼                   ▼                      
┌─────────────┐     ┌─────────────┐              
│             │     │             │              
│   Shopify   │     │   Stripe    │              
│  Storefront │     │  Payments   │              
│             │     │             │              
└─────────────┘     └─────────────┘              
```

### Key Design Decisions

1. **Unified Repository Structure**: The project uses a monorepo approach with both client and server code in a single repository for easier development and deployment.

2. **Type-Safety**: TypeScript is used throughout for strong typing, enhancing code quality and development experience.

3. **Server-Side Rendering**: The application uses a hybrid approach with a server that can render the initial page while the client handles subsequent navigation.

## Key Components

### Frontend (Client)

- **Framework**: React with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Custom component library built with Radix UI primitives and TailwindCSS
- **State Management**: React Query for server state management
- **Styling**: TailwindCSS with a custom design system

#### Frontend Structure

```
client/
├── src/
│   ├── components/   # Reusable UI components
│   ├── pages/        # Page components
│   ├── lib/          # Utility functions and API clients
│   ├── hooks/        # Custom React hooks
│   ├── utils/        # Helper utilities
│   ├── types/        # TypeScript type definitions
│   ├── App.tsx       # Main application component
│   ├── main.tsx      # Entry point
│   └── index.css     # Global styles
└── index.html        # HTML template
```

### Backend (Server)

- **Framework**: Express.js with TypeScript
- **API Layer**: RESTful API endpoints
- **Database ORM**: Drizzle ORM for PostgreSQL
- **Authentication**: Token-based authentication

#### Backend Structure

```
server/
├── index.ts          # Entry point and Express setup
├── routes.ts         # API route definitions
├── db.ts             # Database connection and configuration
├── shopify.ts        # Shopify integration
├── stripe.ts         # Stripe integration
├── storage.ts        # Database access layer
└── vite.ts           # Development server configuration
```

### Shared

- **Schema**: Database schema definitions shared between client and server
- **Types**: Shared TypeScript type definitions

```
shared/
└── schema.ts         # Database schema definitions with Drizzle
```

## Data Flow

### Product Flow

1. Products are managed in Shopify
2. The server fetches products from Shopify and caches them in the local database
3. The client requests products from the server API
4. For checkout, the client either:
   - Redirects to Shopify checkout for product purchases
   - Uses Stripe for event registrations

### Event Registration Flow

1. User browses events on the Events page
2. User selects an event and proceeds to registration
3. User completes the registration form
4. The server creates a Stripe payment intent
5. User completes payment via Stripe
6. The server stores the registration in the database
7. Confirmation is sent to the user

## Data Model

### Key Entities

1. **Users**: Customers and administrators
2. **Products**: Athletic apparel products (synced from Shopify)
3. **Events**: Wrestling camps and clinics
4. **EventRegistrations**: User registrations for events
5. **Coaches**: Coaches for events
6. **CustomApparelInquiries**: Inquiries for custom team apparel

### Database Schema Highlights

```
users
  - id (PK)
  - username
  - password
  - email
  - isAdmin

products
  - id (PK)
  - shopifyId
  - title
  - handle
  - description
  - price
  - collection

events
  - id (PK)
  - title
  - date
  - location
  - description
  - price

eventRegistrations
  - id (PK)
  - eventId (FK)
  - firstName
  - lastName
  - email
  - phone
  - paymentStatus

coaches
  - id (PK)
  - name
  - title
  - bio
  - image

eventCoaches
  - id (PK)
  - eventId (FK)
  - coachId (FK)
```

## External Dependencies

### Third-Party Services

1. **Shopify**: Used for product management and e-commerce functionality
   - Storefront API for retrieving products
   - Admin API for managing products
   - Checkout API for processing orders

2. **Stripe**: Used for payment processing
   - Payment Intents API for event registrations
   - Webhooks for payment status updates

3. **Neon Serverless Postgres**: Used for database storage
   - Serverless PostgreSQL for data persistence
   - Connection pooling for efficient database access

4. **SendGrid**: Used for email notifications
   - Transactional emails for order confirmations and event registrations

### Key Libraries

1. **Drizzle ORM**: SQL toolkit and ORM
2. **React Query**: Data fetching and state management
3. **Radix UI**: Accessible component primitives
4. **TailwindCSS**: Utility-first CSS framework
5. **Framer Motion**: Animation library

## Deployment Strategy

The application is deployed to Replit with the following configuration:

```
Frontend → Vite build → Served by Express.js
Backend → ESBuild → Node.js runtime
```

### Build Process

1. Client code is built using Vite (`vite build`)
2. Server code is bundled using ESBuild
3. The Express.js server serves both the API endpoints and the static files

### Environment Configuration

The application uses environment variables for configuration:

- `DATABASE_URL`: PostgreSQL connection string
- `SHOPIFY_STORE_DOMAIN`: Shopify store domain
- `SHOPIFY_API_KEY`: Shopify API key
- `SHOPIFY_ACCESS_TOKEN`: Shopify access token
- `STRIPE_SECRET_KEY`: Stripe secret key

## Performance Considerations

1. **Static Asset Optimization**: Media files (videos, images) are served with appropriate headers for caching and compression.

2. **Responsive Design**: UI components are designed to be responsive across different devices and screen sizes.

3. **Error Handling**: Comprehensive error handling for media playback and API requests, with fallback strategies for failed requests.

## Security Considerations

1. **Payment Security**: Stripe Elements for secure payment processing without handling card data directly.

2. **API Security**: Server-side validation of all user inputs.

3. **Media Security**: Proper MIME type handling for served media assets.

4. **Environmental Variables**: Sensitive configuration stored in environment variables rather than in code.