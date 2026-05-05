# LayerOn Development Guidelines

LayerOn is a full-stack platform where domain experts create AI modules powered by custom instructions and knowledge. This guide helps maintain consistency and productivity.

## Architecture

### Stack Overview
- **Frontend**: React 19 + TypeScript + Vite (port 5173)
- **Backend**: FastAPI (Python) on port 8000 (API server + static file serving in production)
- **Database**: PostgreSQL (primary) with SQLAlchemy ORM, SQLite fallback
- **Auth**: Clerk OAuth with JWT verification (RS256 signatures via JWKS)
- **UI**: Shadcn/ui components with Radix UI primitives + Tailwind CSS v4
- **AI**: LangChain + OpenAI/Anthropic/Gemini for multi-model chat with RAG

### Project Structure
```
client/src/          # React frontend
  pages/             # Page components (routed via wouter)
  components/ui/     # Shadcn components
  lib/               # API client, utils, query setup
  hooks/             # Custom React hooks
main.py              # FastAPI backend (all API logic + static serving)
shared/schema.ts     # Drizzle schema (TypeScript types + validation)
```

**Critical Note**: Database schema exists in TWO places:
- `shared/schema.ts` — Drizzle ORM schema with Zod validators (TypeScript)
- `main.py` — SQLAlchemy ORM models (Python, source of truth)

Always sync changes across both files.

## Build and Test

### Development Commands
```bash
# Windows PowerShell
.\start_dev.ps1              # Start both Vite + FastAPI (recommended)

# Or run separately:
npm run dev:client           # Vite dev server on port 5173
npm run dev:backend          # FastAPI on port 8000

# Linux/Mac
./start_dev.sh               # Start both servers

# TypeScript type checking
npm run check

# Database migrations
npm run db:push
```

### Production Build
```bash
npm run build                # Vite build → dist/public
npm start                    # Run FastAPI (serves API + static files)
```

### Environment Variables Required
- `DATABASE_URL` or (`PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`)
- `VITE_CLERK_PUBLISHABLE_KEY` (frontend + backend for JWKS)
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`
- `STRIPE_API_KEY`

## Code Style

### TypeScript/React Frontend
- **Components**: Functional components with TypeScript types
- **Hooks**: Use React Query for server state, `useState` for local UI state
- **Routing**: Wouter with `useLocation()`, `useRoute()` hooks
- **Protected routes**: Wrap with `<ProtectedRoute>` for auth-required pages
- **API calls**: Use centralized `ApiClient` from `client/src/lib/api.ts`
- **Styling**: Tailwind utility classes + inline styles for dynamic theme colors

**API Client Pattern**:
```typescript
// Client always sends Clerk token in Authorization header
const response = await apiClient.request<ResponseType>('/api/endpoint', {
  method: 'POST',
  body: { key: 'value' }
});
```

### Python Backend (FastAPI)
- **Models**: SQLAlchemy declarative models in `main.py` with UUID primary keys
- **Endpoints**: Standard REST patterns with Pydantic request/response models
- **Auth**: Inject `current_user: DBUser = Depends(get_current_user)` for protected routes
- **Case conversion**: API responses use `camelCase` (marshal via `*_to_dict()` functions), DB columns use `snake_case`
- **Error handling**: Raise `HTTPException(status_code=4xx, detail="message")`

**Endpoint Pattern**:
```python
@app.post("/api/resource")
async def create_resource(
    request: ResourceCreateRequest,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    # Business logic here
    return resource_to_dict(resource)
```

## Conventions

### Authentication Flow
1. Frontend: Clerk SDK manages auth state, provides token via `useAuth()`
2. Client: Inject token with `apiClient.setClerkTokenGetter(getToken)`
3. Backend: Extract token from `Authorization: Bearer <token>` header
4. Verify signature against Clerk JWKS endpoint (domain derived from publishable key)
5. Extract `sub` claim → lookup/create user in DB by `clerk_id`

### Database Patterns
- **UUIDs**: All entity IDs generated as `str(uuid.uuid4())`
- **Timestamps**: `created_at` stored as ISO 8601 strings
- **Relations**: Foreign keys with cascade deletes where appropriate
- **Fallback**: Auto-switches to SQLite if PostgreSQL unavailable

### UI Component Patterns
- **Shadcn structure**: Import from `@/components/ui/[component]`
- **Variants**: Use CVA (class-variance-authority) for button/card variants
- **Theme**: Dark-first design with CSS variables (`--primary`, `--accent-blue`, etc.)
- **Inline colors**: Dynamic theme colors via `style={{ backgroundColor: "var(--accent-blue)" }}`
- **Forms**: React Hook Form + Zod validation with `<Form>` wrapper

### Document Processing (RAG)
When users upload documents to modules:
1. Extract text based on MIME type (pypdf, python-docx, or plain text)
2. Chunk text: 2000 characters per chunk, 200-char overlap
3. Store chunks in `document_chunks` table with `module_id` reference
4. Inject relevant chunks into system prompt context during chat

### File Naming
- **React components**: PascalCase (e.g., `ModuleCard.tsx`)
- **Hooks**: kebab-case with `use-` prefix (e.g., `use-clerk-auth.ts`)
- **Utils**: kebab-case (e.g., `query-client.ts`)
- **Python files**: snake_case (standard Python convention)

## Common Pitfalls

### Backend
- **Schema drift**: Two schemas (Drizzle + SQLAlchemy) can diverge—always update both
- **JWKS caching**: Single global client; malformed `VITE_CLERK_PUBLISHABLE_KEY` causes silent auth failures
- **No structured logging**: Only `print()` statements; add explicit error context when debugging
- **CORS wildcard**: `allow_origins=["*"]` in dev; restrict to client domain in production

### Frontend
- **Token injection**: Must call `apiClient.setClerkTokenGetter()` before authenticated requests
- **Protected routes**: Components inside `<ProtectedRoute>` render nothing during auth check—no loading state
- **wouter limitations**: No nested route configs; handle query params manually
- **Optimistic updates**: Chat UI renders messages before API confirmation—handle rollback on error

### Database
- **Connection string format**: If using `DATABASE_URL`, ensure `sslmode=require` for PostgreSQL
- **Migration sync**: `npm run db:push` only syncs Drizzle schema—manually run Python ORM changes

## Domain-Specific Context

### Module System
- **Modules** = AI agents configured by creators with custom instructions, knowledge (RAG docs), and conversation starters
- **Providers**: OpenAI, Anthropic (Claude), Google (Gemini)—selected per module
- **Credits**: Tracked per user; deducted per conversation (not per message)
- **Public/Private**: Modules have `is_public` flag for explore page visibility

### Creator Profiles
- Users have `role` field: `"creator"` or `"user"`
- Creators can publish modules, have public profile pages with Medium-style layouts
- Profile fields: `bio`, `headline`, `expertise` (JSON array), social links (website, Twitter, LinkedIn)

### Billing (Stripe)
- Credit packages: Starter (50/$4.99), Pro (200/$14.99), Power (500/$29.99)
- Checkout flow: Backend creates Stripe Checkout Session → redirect → webhook/verify on return
- Stripe customer ID stored in `users.strps1` (Windows) or `./start_dev.sh` (Linux/Mac)
2. **Type safety**: Run `npm run check` before commits
3. **Schema changes**: Update both `shared/schema.ts` AND `main.py` models
4. **New endpoints**: Add FastAPI route → update `ApiClient` in `client/src/lib/api.ts`
5. **Protected pages**: Wrap route in `<ProtectedRoute>` + add auth dependency to backend
6. **UI components**: Use existing Shadcn components from `client/src/components/ui/` before creating custom ones
7. **Error handling**: Always show user-friendly toast notifications for API errors
8. **RAG updates**: When modifying document processing, update chunking logic in both upload and retrieval paths
9. **Static files**: In production, FastAPI serves built frontend from `dist/public`
5. **Protected pages**: Wrap route in `<ProtectedRoute>` + add auth dependency to backend
6. **UI components**: Use existing Shadcn components from `client/src/components/ui/` before creating custom ones
7. **Error handling**: Always show user-friendly toast notifications for API errors
8. **RAG updates**: When modifying document processing, update chunking logic in both upload and retrieval paths
