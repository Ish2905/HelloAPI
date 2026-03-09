# HelloAPI — Project Summary

## Overview
**HelloAPI** is an interactive API learning platform that transforms API documentation into a developer-ready experience. It parses OpenAPI/Swagger specifications (or raw text docs) and generates an interactive playground, quickstart code, AI-powered explanations, and structured learning paths — helping developers go from docs to their first successful API request in minutes.

Users can also **search and import from 2,000+ real-world public APIs** via the APIs.guru catalog, making it a one-stop tool for API discovery, exploration, and learning.

## Problem Statement
Developers waste hours reading scattered API documentation before making their first successful API call. Onboarding to new APIs involves unclear authentication requirements, missing code examples, trial-and-error debugging, and no structured learning. There is no single tool that combines API discovery, spec parsing, live testing, code generation, AI guidance, and learning paths — all in one place.

## Solution
A unified web platform that covers the full API learning lifecycle:
1. **API Discovery** — search 2,000+ public APIs from APIs.guru and import specs instantly
2. **Interactive Playground** — explore endpoints, fill parameter forms, execute requests, view responses
3. **Code Generation** — auto-generated Python, TypeScript, and curl starter code
4. **AI-Powered Intelligence** — Groq-powered (Llama 3.3 70B) endpoint explanations, error troubleshooting, and API overviews
5. **Guided Learning Paths** — structured step-by-step API onboarding

## Key Features

### 1. API Search & Discovery (NEW)
- Search across **2,000+ real-world public APIs** from the APIs.guru catalog
- Results include API name, description, version, category, and provider logo
- One-click import — fetches the OpenAPI spec server-side (avoids CORS) and loads it directly into the playground
- Category-coded results with color indicators (financial, social, developer, etc.)
- Integrated directly into the landing page alongside manual spec upload

### 2. API Overview (NEW)
- AI-generated API overview when a spec is first loaded
- Provides: what the API does, what you can build with it, key capabilities, and getting started guidance
- Animated request/response flow diagram showing API communication
- "New to APIs?" expandable card for absolute beginners
- Featured endpoints section highlighting key endpoints to explore first

### 3. Interactive API Playground
- Endpoint sidebar grouped by resource/tag
- Dynamic parameter forms auto-generated from the API spec
- "Try It" button executes real API calls via a secure server-side proxy
- Response viewer with syntax highlighting, status codes, and timing
- Authentication support (Bearer tokens, API keys) — credentials stay in browser, sent server-side via proxy

### 4. AI-Powered Intelligence (Groq — Llama 3.3 70B)
- **AI Explain** — generates plain-English endpoint explanations with use cases, important notes, and example flows
- **AI Troubleshoot** — analyzes API error responses and provides actionable fix steps
- **AI Overview** — generates a comprehensive API introduction for newly loaded specs
- Context-aware — sends the full API spec, endpoint details, and error context for grounded responses
- Powered by Groq's fast inference (Llama 3.3 70B Versatile model)

### 5. Quickstart Code Generation
- Auto-generates production-ready starter code for every endpoint:
  - **curl** commands with proper headers and auth
  - **Python** client using `requests` with error handling
  - **TypeScript** client using `fetch` with type definitions
- All generated code includes the correct base URL, auth headers, and parameter placeholders

### 6. Guided Learning Paths
- Three auto-generated learning paths based on API structure:
  - **Getting Started** — authentication setup, first request, understanding responses
  - **CRUD Operations** — create, read, update, delete workflows
  - **Advanced Workflows** — pagination, search/filter, bulk operations
- Step-by-step interactive UI with progress tracking

### 7. Multi-Format Spec Parsing
- OpenAPI 3.x and Swagger 2.0 support (JSON and YAML)
- Free-text document parser for unstructured API documentation
- Server-side spec fetching (`/api/fetch-spec`) to bypass CORS when importing from URLs
- Extracts endpoints, parameters, request bodies, response schemas, auth schemes, and server URLs

### 8. Custom Branding & Icon System
- Custom HelloAPI SVG logo and favicon
- Comprehensive SVG icon library (`Icons.tsx`) for consistent UI across all components
- Light/dark theme support

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Custom CSS design system (dark mode, glassmorphism, micro-animations) |
| AI Integration | Groq API (`llama-3.3-70b-versatile`) via `groq-sdk` |
| API Discovery | APIs.guru catalog (~2,000+ public OpenAPI specs) |
| Deployment | AWS Amplify (Lambda for API routes, CloudFront CDN) |
| Parsing | Custom OpenAPI parser, text doc parser, `js-yaml` |
| Version Control | GitHub (`Ish2905/HelloAPI`) |

## AWS Services Used
- **AWS Amplify** — hosting, CI/CD, auto-deploy from GitHub
- **AWS Lambda** — serverless execution of 6 API routes (parse, generate, proxy, ai, search-apis, fetch-spec)
- **AWS CloudFront** — CDN for global static asset delivery

## Architecture

```
User → Landing Page
  ├── Upload spec (JSON/YAML/text file)
  ├── Paste spec content
  └── Search public APIs (APIs.guru catalog)
         ↓
  /api/search-apis → APIs.guru Registry Client
         ↓
  /api/fetch-spec → Server-side spec download (CORS-free)
         ↓
  Parsing Layer → OpenAPI Parser / Text Document Parser
         ↓
  Normalized Data Model (ApiSpec: endpoints, params, auth, responses)
         ↓
  ┌─────────────────────────────────────────────────────┐
  │  API Overview → AI-generated introduction (Groq)    │
  │  Artifact Generator → README, Python, TS, curl      │
  │  Playground Builder → Forms, Try It, Responses      │
  │  AI Engine → Groq (Explain, Troubleshoot, Overview)  │
  │  Learning Path Generator → Structured Onboarding     │
  └─────────────────────────────────────────────────────┘
         ↓
  User Dashboard: Overview | Playground | Quickstart | Learn
```

## Project Structure
```
HelloAPI/
├── amplify.yml                          # AWS Amplify build config
├── app/
│   ├── public/
│   │   ├── helloapi-logo.svg            # HelloAPI logo
│   │   └── helloapi-icon.svg            # HelloAPI icon
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── ai/route.ts          # AI endpoint (Groq)
│   │   │   │   ├── fetch-spec/route.ts  # Server-side spec fetcher
│   │   │   │   ├── generate/route.ts    # Code generation
│   │   │   │   ├── parse/route.ts       # Spec parsing
│   │   │   │   ├── proxy/route.ts       # API proxy
│   │   │   │   └── search-apis/route.ts # API search (APIs.guru)
│   │   │   ├── globals.css              # Design system
│   │   │   ├── icon.svg                 # Favicon
│   │   │   ├── layout.tsx               # Root layout
│   │   │   └── page.tsx                 # Main page
│   │   ├── components/
│   │   │   ├── ApiOverview.tsx           # AI-generated API overview
│   │   │   ├── ApiSearch.tsx             # Public API search
│   │   │   ├── Dashboard.tsx            # Main dashboard
│   │   │   ├── EndpointDetail.tsx       # Endpoint view + AI Explain
│   │   │   ├── EndpointList.tsx         # Sidebar endpoint list
│   │   │   ├── ErrorGuidance.tsx        # Error help + AI Troubleshoot
│   │   │   ├── HomePage.tsx             # Landing page
│   │   │   ├── Icons.tsx                # SVG icon library
│   │   │   ├── LearningPathView.tsx     # Learning paths
│   │   │   ├── ParameterForm.tsx        # Dynamic form builder
│   │   │   ├── QuickstartViewer.tsx     # Quickstart tab
│   │   │   ├── ResponseViewer.tsx       # Response display
│   │   │   └── SnippetGenerator.tsx     # Code snippets
│   │   ├── context/
│   │   │   └── ApiContext.tsx           # Global state
│   │   └── lib/
│   │       ├── api-registry.ts          # APIs.guru catalog client
│   │       ├── gemini-client.ts         # Gemini AI client (legacy)
│   │       ├── groq-client.ts           # Groq AI client (primary)
│   │       ├── types.ts                 # TypeScript types
│   │       ├── learning-paths.ts        # Path generator
│   │       ├── parsers/
│   │       │   ├── openapi-parser.ts    # OpenAPI parser
│   │       │   └── text-parser.ts       # Text doc parser
│   │       └── generators/
│   │           ├── readme-generator.ts
│   │           ├── curl-generator.ts
│   │           ├── python-generator.ts
│   │           ├── typescript-generator.ts
│   │           └── error-guidance.ts
│   └── package.json
├── requirements.md
└── design.md
```

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/parse` | POST | Parse OpenAPI/Swagger/text specs |
| `/api/generate` | POST | Generate quickstart code artifacts |
| `/api/proxy` | POST | Secure API request proxying |
| `/api/ai` | POST | AI explain, troubleshoot, and overview (Groq) |
| `/api/search-apis` | GET | Search APIs.guru catalog |
| `/api/fetch-spec` | POST | Server-side spec URL fetching (CORS bypass) |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | Groq API key (free from console.groq.com/keys) |
| `GROQ_MODEL` | No | Model override (default: `llama-3.3-70b-versatile`) |
| `GEMINI_API_KEY` | No | Google Gemini API key (legacy fallback) |
| `AMPLIFY_MONOREPO_APP_ROOT` | Yes (deploy) | Set to `app` for AWS Amplify deployment |

## Security
- API keys and auth tokens are never stored — they stay in browser memory and are sent server-side only via the proxy
- Server-side proxy includes SSRF protection (blocks internal/private IP ranges)
- AI API keys are stored as server-side environment variables, never exposed to the client
- Spec fetcher validates URLs (HTTP/HTTPS only) and checks content before processing

## Performance
- TypeScript compilation: ~1.2s (Turbopack)
- API spec parsing: < 200ms
- Code generation: < 30ms
- API search: < 500ms (cached after first request)
- AI response (Groq): 2–5s (fast inference)
- Production build: < 5s, 0 errors

## Future Scope
- Postman/Insomnia collection import
- Additional languages: Go, Java, Ruby, PHP
- GraphQL schema support
- Unit test stub generation
- Docker packaging for self-hosted deployment
- Team collaboration with shared workspaces
- API versioning comparison (diff two specs)
- Rate limiting simulation and retry strategy testing

## Links
- **GitHub**: https://github.com/Ish2905/HelloAPI
- **Team Leader**: Karthik Prabhu
