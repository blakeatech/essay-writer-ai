# EssayGenius

AI-powered essay writing assistant that generates academic papers with proper citations and formatting.

## Overview

EssayGenius is a full-stack web application that helps students create high-quality academic essays. The platform uses advanced AI to generate outlines, find relevant sources, and produce well-structured papers with proper citations in multiple formats (APA, MLA, Chicago).

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   External      │
│   (Next.js)     │    │   (FastAPI)     │    │   Services      │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Essay Form  │ │    │ │ Essay API   │ │    │ │ OpenAI GPT  │ │
│ │ Dashboard   │ │◄──►│ │ Auth API    │ │◄──►│ │ Supabase    │ │
│ │ Auth Pages  │ │    │ │ Stripe API  │ │    │ │ Stripe      │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │                 │
│ │ Supabase    │ │    │ │ Services    │ │    │                 │
│ │ Auth Client │ │    │ │ - Outline   │ │    │                 │
│ └─────────────┘ │    │ │ - Sources   │ │    │                 │
│                 │    │ │ - Draft     │ │    │                 │
└─────────────────┘    │ │ - Document  │ │    │                 │
                       │ └─────────────┘ │    │                 │
                       └─────────────────┘    └─────────────────┘
```

## System Flow

```
User Input → Essay Form → Backend Processing → AI Generation → Document Creation
    ↓            ↓              ↓                 ↓               ↓
Topic &      Validation    Outline Service   OpenAI API    Word Document
Requirements    ↓         Source Service        ↓               ↓
    ↓       Credit Check   Draft Service    AI Response    File Storage
Auth Check       ↓             ↓               ↓               ↓
    ↓       Rate Limiting  Document Service  Content Gen   Download Link
Database         ↓             ↓               ↓               ↓
Storage     Background Job  File Generation  Quality Check  User Dashboard
```

## Features

- **AI-Powered Essay Generation**: Creates complete academic papers based on topics and requirements
- **Multiple Citation Formats**: Supports APA, MLA, and Chicago citation styles
- **Source Integration**: Automatically finds and integrates relevant academic sources
- **Writing Style Analysis**: Adapts to user's writing style from previous essays
- **Document Export**: Generates properly formatted Word documents
- **User Authentication**: Secure login and registration with Supabase
- **Credit System**: Pay-per-use model with Stripe integration
- **Real-time Progress**: Live updates during essay generation process

## Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Authentication**: Supabase Auth
- **State Management**: React Hooks
- **HTTP Client**: Axios

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.9+
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: OpenAI GPT-4
- **Authentication**: Supabase Auth
- **Payment Processing**: Stripe
- **Document Generation**: python-docx
- **Rate Limiting**: SlowAPI

### Infrastructure
- **Deployment**: Fly.io
- **Database**: Supabase
- **File Storage**: Supabase Storage
- **CDN**: Fly.io Edge
- **Monitoring**: Built-in logging

## Quick Start

### Prerequisites
- Node.js 18+ and npm/pnpm
- Python 3.9+
- Supabase account
- OpenAI API key
- Stripe account (for payments)

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/essaygenius.git
cd essaygenius
```

2. Set up environment variables:
```bash
# Frontend (.env.local)
cp essaygenius_frontend/.env.example essaygenius_frontend/.env.local

# Backend (.env)
cp essaygenius_backend/.env.example essaygenius_backend/.env
```

3. Install dependencies:
```bash
# Frontend
cd essaygenius_frontend
npm install

# Backend
cd ../essaygenius_backend
pip install -r requirements.txt
```

4. Start development servers:
```bash
# Backend (Terminal 1)
cd essaygenius_backend
uvicorn app.main:app --reload --port 8000

# Frontend (Terminal 2)
cd essaygenius_frontend
npm run dev
```

5. Open http://localhost:3000 in your browser

## Project Structure

```
essaygenius/
├── essaygenius_frontend/     # Next.js frontend application
│   ├── app/                  # App router pages and layouts
│   │   ├── api/              # API route handlers
│   │   ├── components/       # Reusable UI components
│   │   ├── lib/              # Utility functions and configurations
│   │   ├── hooks/            # Custom React hooks
│   │   └── services/         # API service functions
│   └── README.md             # This file
├── essaygenius_backend/      # FastAPI backend application
│   ├── app/                  # Main application code
│   │   ├── api/              # API route handlers
│   │   ├── services/         # Business logic services
│   │   ├── models/           # Pydantic models
│   │   ├── schemas/          # Data schemas
│   │   └── utils/            # Utility functions
│   └── requirements.txt      # Python dependencies
└── README.md                 # This file
```

## Deployment

Both frontend and backend are configured for deployment on Fly.io with Docker containers.

### Frontend Deployment
```bash
cd essaygenius_frontend
fly deploy
```

### Backend Deployment
```bash
cd essaygenius_backend
fly deploy
```

## API Documentation

The backend API provides the following main endpoints:

- `POST /api/v1/outline-and-sources` - Generate essay outline and find sources
- `POST /api/v1/generate-essay` - Generate complete essay
- `GET /api/v1/essay-status/{job_id}` - Check essay generation status
- `GET /api/v1/my-papers` - Get user's essays
- `POST /api/v1/create-payment-intent` - Process payments

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@essaygeniusai.com or create an issue in this repository. 