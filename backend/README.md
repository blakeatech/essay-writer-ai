# EssayGenius Backend

FastAPI backend service for the EssayGenius AI-powered essay writing platform.

## Overview

The backend is built with FastAPI and provides RESTful APIs for essay generation, user authentication, payment processing, and document management. It integrates with OpenAI for AI-powered content generation and Supabase for data persistence.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FastAPI Application                     │
├─────────────────────────────────────────────────────────────┤
│  API Layer                                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Essay API   │ │  Auth API   │ │ Stripe API  │          │
│  │ Endpoints   │ │ Endpoints   │ │ Endpoints   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│  Service Layer                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Outline     │ │ Source      │ │ Draft       │          │
│  │ Service     │ │ Service     │ │ Service     │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Document    │ │ Guardrail   │ │ Supabase    │          │
│  │ Service     │ │ Service     │ │ Service     │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│  External Integrations                                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ OpenAI      │ │ Supabase    │ │ Stripe      │          │
│  │ GPT-4       │ │ Database    │ │ Payments    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## Essay Generation Flow

```
Request → Validation → Credit Check → Background Job
   ↓           ↓           ↓              ↓
Input       Schema      User Credits   Job Queue
Validation  Validation   Verification      ↓
   ↓           ↓           ↓         Outline Generation
Error       Error       Error              ↓
Response    Response    Response    Source Discovery
   ↓           ↓           ↓              ↓
Success     Success     Success     Draft Generation
   ↓           ↓           ↓              ↓
Continue    Continue    Continue    Document Creation
                                          ↓
                                   File Storage
                                          ↓
                                   Database Save
                                          ↓
                                   Job Complete
```

## Key Features

- **AI Essay Generation**: Multi-step essay creation with OpenAI GPT-4
- **Source Integration**: Automatic academic source discovery and citation
- **Document Generation**: Word document creation with proper formatting
- **User Authentication**: JWT-based auth with Supabase integration
- **Payment Processing**: Credit system with Stripe integration
- **Rate Limiting**: API rate limiting and abuse prevention
- **Background Jobs**: Asynchronous essay generation processing
- **Content Moderation**: Guardrails for inappropriate content

## Technology Stack

- **Framework**: FastAPI 0.115+
- **Language**: Python 3.9+
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: OpenAI GPT-4
- **Authentication**: Supabase Auth + JWT
- **Payment Processing**: Stripe
- **Document Generation**: python-docx
- **Rate Limiting**: SlowAPI
- **HTTP Client**: httpx
- **Validation**: Pydantic v2

## Project Structure

```
essaygenius_backend/
├── app/                          # Main application package
│   ├── api/                      # API route handlers
│   │   └── v1/                   # API version 1
│   │       ├── endpoints.py      # General endpoints
│   │       ├── essay_endpoints.py # Essay generation endpoints
│   │       ├── stripe_endpoints.py # Payment endpoints
│   │       └── auth.py           # Authentication endpoints
│   ├── services/                 # Business logic services
│   │   ├── outline_service.py    # Essay outline generation
│   │   ├── source_service.py     # Academic source discovery
│   │   ├── draft_service.py      # Essay draft generation
│   │   ├── document_service.py   # Word document creation
│   │   ├── guardrail_service.py  # Content moderation
│   │   └── supabase_service.py   # Database operations
│   ├── models/                   # Pydantic models
│   │   ├── essay.py             # Essay-related models
│   │   ├── outline.py           # Outline models
│   │   └── source.py            # Source models
│   ├── schemas/                  # Data schemas
│   │   ├── essay.py             # Essay schemas
│   │   └── user.py              # User schemas
│   ├── core/                     # Core configuration
│   │   ├── config.py            # Application settings
│   │   └── limiter.py           # Rate limiting config
│   ├── utils/                    # Utility functions
│   │   ├── auth.py              # Authentication utilities
│   │   └── helpers.py           # General helpers
│   ├── middleware/               # Custom middleware
│   └── main.py                   # FastAPI application entry point
├── requirements.txt              # Python dependencies
├── Dockerfile                    # Docker configuration
├── fly.toml                      # Fly.io deployment config
└── .env                          # Environment variables
```

## Getting Started

### Prerequisites

- Python 3.9 or later
- pip or poetry for dependency management
- Supabase project setup
- OpenAI API key
- Stripe account (for payments)

### Installation

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Required environment variables:
```env
# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Application
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
SECRET_KEY=your_secret_key
```

4. Start the development server:
```bash
uvicorn app.main:app --reload --port 8000
```

5. Access the API at [http://localhost:8000](http://localhost:8000)

## API Documentation

### Core Endpoints

#### Essay Generation
```http
POST /api/v1/outline-and-sources
Content-Type: application/json

{
  "topic": "Climate Change Impact",
  "writing_style": "academic",
  "word_count": 1500,
  "citation_format": "APA",
  "num_sources": 5
}
```

```http
POST /api/v1/generate-essay
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Essay Title",
  "outline": {...},
  "sources": [...],
  "word_count": 1500,
  "writing_analysis": "..."
}
```

#### Job Status
```http
GET /api/v1/essay-status/{job_id}
Authorization: Bearer <token>
```

#### User Essays
```http
GET /api/v1/my-papers
Authorization: Bearer <token>
```

### Authentication

The API uses JWT tokens provided by Supabase Auth:

```http
Authorization: Bearer <supabase_jwt_token>
```

### Rate Limiting

- General endpoints: 100 requests per minute
- Essay generation: 5 requests per minute
- Authentication: 10 requests per minute

### Error Responses

```json
{
  "detail": "Error message",
  "error_code": "SPECIFIC_ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Services

### OutlineService
Generates structured essay outlines using OpenAI GPT-4.

**Key Methods:**
- `generate_outline()` - Creates essay outline
- `get_writing_style_analysis()` - Analyzes writing patterns

### SourceService
Discovers and formats academic sources for essays.

**Key Methods:**
- `find_sources()` - Searches for relevant sources
- `format_citations()` - Formats citations in specified style

### DraftService
Generates essay content based on outlines and sources.

**Key Methods:**
- `generate_draft()` - Creates complete essay
- `generate_section()` - Generates individual sections

### DocumentService
Creates formatted Word documents from essay content.

**Key Methods:**
- `create_document()` - Generates .docx file
- `format_citations()` - Applies citation formatting

### GuardrailService
Moderates content for inappropriate or harmful material.

**Key Methods:**
- `moderate_prompt()` - Checks input content
- `validate_output()` - Validates generated content

## Development

### Available Scripts

- `uvicorn app.main:app --reload` - Start development server
- `python -m pytest` - Run tests
- `python -m black .` - Format code
- `python -m flake8` - Lint code
- `python -m mypy app` - Type checking

### Code Style

The project follows:
- PEP 8 style guidelines
- Black code formatting
- Type hints with mypy
- Docstring conventions

### Adding New Endpoints

1. Create endpoint in appropriate router file
2. Add business logic to service layer
3. Define Pydantic models for request/response
4. Add authentication if required
5. Include rate limiting
6. Write tests

Example endpoint:
```python
@router.post("/new-endpoint")
@limiter.limit("10/minute")
async def new_endpoint(
    request: Request,
    data: RequestModel,
    current_user: dict = Depends(get_current_user)
):
    try:
        result = await service.process_data(data)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## Testing

### Running Tests
```bash
# Run all tests
python -m pytest

# Run with coverage
python -m pytest --cov=app

# Run specific test file
python -m pytest tests/test_essay_service.py
```

### Test Structure
```
tests/
├── test_services/
│   ├── test_outline_service.py
│   ├── test_source_service.py
│   └── test_draft_service.py
├── test_api/
│   ├── test_essay_endpoints.py
│   └── test_auth_endpoints.py
└── conftest.py
```

## Deployment

### Docker Deployment
```bash
# Build image
docker build -t essaygenius-backend .

# Run container
docker run -p 8000:8000 essaygenius-backend
```

### Fly.io Deployment
```bash
# Deploy to Fly.io
fly deploy

# Set environment variables
fly secrets set OPENAI_API_KEY=your_key
```

### Environment Configuration

Production environment variables:
```bash
# Set production secrets
fly secrets set OPENAI_API_KEY=prod_key
fly secrets set SUPABASE_KEY=prod_key
fly secrets set STRIPE_SECRET_KEY=prod_key
```

## Monitoring and Logging

### Logging
- Structured logging with Python logging module
- Log levels: DEBUG, INFO, WARNING, ERROR, CRITICAL
- Request/response logging for debugging

### Health Checks
```http
GET /health
```

### Metrics
- Request count and latency
- Error rates by endpoint
- Background job processing times

## Security

### Authentication
- JWT token validation
- Supabase Auth integration
- Protected route middleware

### Rate Limiting
- Per-IP rate limiting
- Per-user rate limiting for authenticated endpoints
- Configurable limits per endpoint

### Input Validation
- Pydantic model validation
- Content moderation with guardrails
- SQL injection prevention

### CORS
- Configurable CORS origins
- Secure headers
- Credential handling

## Troubleshooting

### Common Issues

**OpenAI API Errors**
- Verify API key is valid
- Check rate limits and quotas
- Monitor token usage

**Database Connection Issues**
- Verify Supabase credentials
- Check network connectivity
- Validate connection string

**Background Job Failures**
- Check job status in logs
- Verify external service availability
- Monitor memory usage

**Performance Issues**
- Monitor response times
- Check database query performance
- Optimize AI service calls

### Debug Mode
```bash
# Run with debug logging
uvicorn app.main:app --reload --log-level debug
```

## Contributing

1. Follow PEP 8 style guidelines
2. Add type hints to all functions
3. Write comprehensive tests
4. Update documentation
5. Use meaningful commit messages 