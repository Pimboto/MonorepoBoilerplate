# CocoStudio Web -- Next.js 15 + HeroUI v3

Frontend application for CocoStudio, built with **Next.js 15 (App Router)** + **HeroUI v3**, TypeScript, Tailwind CSS 4, and a clean **feature-based architecture**.

## Features

- **Next.js 15.5.9** (App Router + Turbopack)
- **HeroUI v3** -- accessible React components (React Aria + Tailwind CSS v4)
- **Tailwind CSS 4** + Tailwind Variants
- **Feature-based architecture** (domain-driven structure)
- **Collections & File Management**:
  - Full CRUD for Collections (GraphQL)
  - File uploads via **UploadThing**
  - Validation with shared Zod schemas (`@cocostudio/shared`)
- **Workflow Canvas**:
  - Node-based visual editor with @xyflow/react
  - Custom AI nodes (SkyImageEdits, SkyPlayground, SkyVideo)
  - Drag-and-drop node palette
  - CRUD operations via GraphQL
- **GraphQL Integration**:
  - Client-side GraphQL with `graphql-request`
  - All queries/mutations visible in browser DevTools
  - Cookie-based authentication
- **Premium Design System**: Custom UI components in `components/ui/premium/`
- Dark mode with `next-themes`
- Biome for linting & formatting
- Framer Motion for animations

## Project Structure

```text
apps/web/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Auth route group
│   │   ├── login/              # Sign in page
│   │   ├── signup/             # Sign up page
│   │   ├── verify-email/       # Email verification (OTP)
│   │   └── forgot-password/    # Password reset
│   ├── (marketing)/            # Landing page
│   └── app/                    # Main application (authenticated)
│       ├── collections/        # Collections CRUD + detail pages
│       ├── workflows/          # Workflow list + editor
│       │   └── editor/         # @xyflow/react canvas
│       └── settings/           # User settings
├── features/                   # Business logic & domain features
│   ├── collections/            # Components, hooks, actions, types
│   ├── files/                  # File upload components, hooks
│   └── workflows/              # Canvas, node palette, custom nodes
│       ├── components/         # WorkflowCanvas, NodePalette
│       └── nodes/              # SkyImageEditsNode, SkyPlaygroundNode, SkyVideoNode
├── components/                 # Global UI components
│   ├── auth/                   # Auth-related components
│   ├── ui/                     # Shared UI (CustomButton, premium/)
│   ├── Sidebar.tsx
│   └── navbar.tsx
├── lib/                        # Utilities and API client
│   ├── graphql-client.ts       # Configured GraphQLClient instance
│   └── graphql/                # GraphQL queries & mutations
│       ├── auth.ts
│       ├── collections.ts
│       ├── files.ts
│       ├── otp.ts
│       ├── profile.ts
│       └── workflows.ts
└── config/                     # Environment, site config
```

## Tech Stack

- **Framework**: Next.js 15.5.9
- **UI Library**: @heroui/react v3 + @heroui/styles v3
- **Styling**: Tailwind CSS 4.1.11 + Tailwind Variants
- **Validation**: Zod (schemas from `@cocostudio/shared`)
- **File Uploads**: UploadThing
- **API**: GraphQL (via `graphql-request`)
- **Workflow Editor**: @xyflow/react
- **Icons**: iconsax-reactjs
- **Lint & Format**: Biome
- **Package Manager**: pnpm

## Quick Start

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Run development server**:

   ```bash
   pnpm dev
   ```

3. **API connection**:
   The app connects to a GraphQL server at `http://localhost:3001/graphql` by default.
   Override with the `NEXT_PUBLIC_API_URL` env var.

## GraphQL Architecture

This app uses **client-side GraphQL** exclusively for all API communication.

### Why Client-Side GraphQL?

- **Full visibility** -- All GraphQL queries/mutations appear in browser DevTools and GraphQL Network Inspector
- **Learning-friendly** -- See exactly what data is being sent to and from the API
- **Type-safe** -- Full TypeScript support with `graphql-request`
- **Cookie authentication** -- Automatic session cookie handling with `credentials: 'include'`

### Implementation Pattern

```tsx
// 1. Define GraphQL mutation/query
import { gql } from 'graphql-request';

const CREATE_COLLECTION = gql`
  mutation CreateCollection($input: CreateCollectionInput!) {
    createCollection(input: $input) {
      id
      name
    }
  }
`;

// 2. Use graphqlClient directly from client components
import { graphqlClient } from '@/lib/graphql-client';

const data = await graphqlClient.request(CREATE_COLLECTION, { input });
```

### Authentication Flow

1. **Login/Signup** -- GraphQL mutations set session cookies
2. **Authenticated requests** -- `graphqlClient` sends cookies automatically (`credentials: 'include'`)
3. **Backend validation** -- NestJS `AuthGuard` validates session from cookies

### DevTools Integration

Install [GraphQL Network Inspector](https://chrome.google.com/webstore/detail/graphql-network-inspector) to see all GraphQL traffic in real-time.

## GraphQL Architecture Rules

**All GraphQL requests MUST be client-side (from the browser) so they are visible in DevTools.**

### CORRECT -- Client-Side GraphQL

```tsx
'use client';

import { graphqlClient } from "@/lib/graphql-client";
import { GET_COLLECTIONS } from "@/lib/graphql/collections";

export function MyComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    async function fetchData() {
      const result = await graphqlClient.request(GET_COLLECTIONS);
      setData(result.collections);
    }
    fetchData();
  }, []);
  
  // Visible in Network Tab > GraphQL
}
```

### INCORRECT -- Server Actions for GraphQL

```tsx
// actions.ts
export async function getCollections() {
  const client = new GraphQLClient(endpoint);
  const data = await client.request(GET_COLLECTIONS);
  return data.collections;
}

// NOT visible in DevTools -- don't do this for GraphQL calls
```

### When to Use Server Actions

- Operations that are purely server-side (file system, etc.)
- Anything that is NOT a GraphQL call

### When to Use Client-Side GraphQL

- All GraphQL queries and mutations
- Any data fetching you want to debug in the browser

### Checklist

**Auth**: Login, signup, verify-email, forgot-password -- all client-side GraphQL mutations

**Collections**: Create, edit, delete, list -- all client-side

**Files**: Upload (via UploadThing + GraphQL metadata), delete -- all client-side

**Workflows**: Create, edit, delete, list, editor canvas -- all client-side

**Summary**: If you cannot see the request in browser DevTools, it is implemented incorrectly.

## License

MIT License
