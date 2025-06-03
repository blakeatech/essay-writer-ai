# EssayGenius Frontend

Next.js frontend application for the EssayGenius AI-powered essay writing platform.

## Overview

The frontend is built with Next.js 15 using the App Router, TypeScript, and Tailwind CSS. It provides a modern, responsive interface for essay generation, user authentication, and document management.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                       │
├─────────────────────────────────────────────────────────────┤
│  Pages & Layouts                                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │    Home     │ │ Dashboard   │ │    Auth     │          │
│  │   (page)    │ │   (page)    │ │   (pages)   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│  Components Layer                                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Essay Form  │ │ UI Library  │ │ Auth Forms  │          │
│  │ Components  │ │ (Radix UI)  │ │ Components  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│  Services & State                                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ API Client  │ │ Auth State  │ │ Form State  │          │
│  │ (Axios)     │ │ (Supabase)  │ │ (React)     │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## Key Features

- **Multi-step Essay Form**: Guided essay creation process with validation
- **Real-time Progress**: Live updates during essay generation
- **Document Management**: View, download, and manage generated essays
- **Authentication**: Secure login/signup with Supabase Auth
- **Payment Integration**: Credit system with Stripe checkout
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Type Safety**: Full TypeScript implementation

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Authentication**: Supabase Auth
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: React Context and hooks
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Project Structure

```
essaygenius_frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── signin/               # Sign in page
│   │   └── signup/               # Sign up page
│   ├── dashboard/                # Dashboard page
│   ├── api/                      # API route handlers
│   ├── components/               # Page-specific components
│   │   ├── essay-form.tsx        # Main essay generation form
│   │   ├── dashboard-content.tsx # Dashboard interface
│   │   └── auth-forms.tsx        # Authentication forms
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # Reusable UI components
│   ├── ui/                       # Base UI components (Radix)
│   ├── forms/                    # Form components
│   └── layout/                   # Layout components
├── lib/                          # Utility functions
│   ├── supabase.ts              # Supabase client
│   ├── utils.ts                 # General utilities
│   └── validations.ts           # Zod schemas
├── hooks/                        # Custom React hooks
│   ├── use-auth.ts              # Authentication hook
│   └── use-api.ts               # API interaction hooks
├── services/                     # API service functions
│   ├── api.ts                   # Main API client
│   ├── auth.ts                  # Auth services
│   └── essays.ts                # Essay-related services
├── types/                        # TypeScript type definitions
├── middleware.ts                 # Next.js middleware
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind configuration
└── package.json                 # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm, yarn, or pnpm
- Supabase project setup

### Installation

1. Install dependencies:
```bash
npm install
# or
pnpm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Required environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=your_backend_api_url
NEXT_PUBLIC_SITE_URL=your_frontend_url
CSRF_SECRET=your_csrf_secret
```

3. Start the development server:
```bash
npm run dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

### Code Style

The project uses:
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type checking
- Tailwind CSS for styling

### Component Development

Components follow these conventions:
- Use TypeScript interfaces for props
- Implement proper error boundaries
- Follow accessibility best practices
- Use Tailwind CSS for styling
- Implement loading and error states

Example component structure:
```typescript
interface ComponentProps {
  title: string;
  onSubmit: (data: FormData) => void;
}

export function Component({ title, onSubmit }: ComponentProps) {
  // Component implementation
}
```

## API Integration

The frontend communicates with the backend through:

### API Client (`services/api.ts`)
- Centralized HTTP client with Axios
- Request/response interceptors
- Error handling
- Authentication headers

### Service Functions
- `essayAPI` - Essay generation and management
- `authAPI` - Authentication operations
- `paymentAPI` - Payment processing

### Data Flow
```
Component → Hook → Service → API Client → Backend
    ↓         ↓        ↓         ↓          ↓
  UI State  Logic   Format   HTTP Req   Response
```

## Authentication

Authentication is handled through Supabase Auth:

- **Sign Up/Sign In**: Email and password authentication
- **Session Management**: Automatic token refresh
- **Protected Routes**: Middleware-based route protection
- **User Context**: Global user state management

## State Management

The application uses React's built-in state management:

- **Local State**: useState for component-specific state
- **Global State**: Context API for user authentication
- **Server State**: React Query patterns for API data
- **Form State**: React Hook Form for form management

## Styling

Tailwind CSS is used for styling with:

- **Design System**: Consistent spacing, colors, and typography
- **Component Variants**: Class variance authority for component styles
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Theme switching capability

## Deployment

The application is configured for deployment on Fly.io:

### Docker Deployment
```bash
# Build and deploy
fly deploy
```

### Environment Variables
Set production environment variables in Fly.io dashboard or via CLI:
```bash
fly secrets set NEXT_PUBLIC_API_URL=https://your-api.fly.dev
```

## Performance Optimization

- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Built-in bundle analyzer
- **Caching**: Static generation where possible

## Testing

Testing setup includes:
- Jest for unit testing
- React Testing Library for component testing
- Cypress for end-to-end testing

Run tests:
```bash
npm run test
npm run test:e2e
```

## Contributing

1. Follow the existing code style and conventions
2. Write tests for new features
3. Update documentation as needed
4. Ensure TypeScript compilation passes
5. Test on multiple screen sizes

## Troubleshooting

### Common Issues

**Build Errors**
- Check TypeScript errors: `npm run type-check`
- Verify environment variables are set
- Clear Next.js cache: `rm -rf .next`

**Authentication Issues**
- Verify Supabase configuration
- Check environment variables
- Ensure proper middleware setup

**API Connection Issues**
- Verify backend is running
- Check CORS configuration
- Validate API endpoints 