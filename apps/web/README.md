# Next.js + HeroUI SaaS Starter Template

Modern full-stack starter template built with **Next.js 15 (App Router)** + **HeroUI v2 (beta)**, TypeScript, Tailwind CSS 4, Zod schemas, UploadThing, and a clean **feature-based architecture**.

[Try it on CodeSandbox](https://githubbox.com/heroui-inc/heroui/next-app-template)  
[View the repository →](https://github.com/heroui-inc/next-app-template)

## Features

- **Next.js 15.5.9** (App Router + Turbopack support)
- **HeroUI v2 (beta)** – beautiful, accessible React components
- **Tailwind CSS 4** + Tailwind Variants
- **Feature-based architecture** (domain-driven structure)
- **Collections & File Management**:
  - Full CRUD for Collections (GraphQL)
  - File uploads via **UploadThing**
  - Validation with shared Zod schemas (`@cocostudio/shared`)
- **GraphQL Integration**:
  - Direct `graphql-request` client usage (all queries/mutations visible in DevTools)
  - Client-side GraphQL calls with cookie-based authentication
  - Type-safe mutations and queries with `gql` tagged templates
- Dark mode with `next-themes`
- Biome for linting & formatting (fast & opinionated)
- Framer Motion for animations

## Project Structure

We use a **feature-based architecture** to keep the codebase maintainable:

```text
apps/web/
├── app/                    # Next.js App Router
│   ├── app/                # Main application routes
│   │   ├── collections/    # Collections CRUD pages
│   │   └── ...
│   ├── api/                # Route Handlers (UploadThing, etc.)
│   └── ...
├── features/               # ← Business logic & domain features
│   ├── collections/        # Collections domain (actions, components, types)
│   ├── auth/
│   └── ...
├── packages/
│   └── shared/
│       ├── src/
│       │   └── schemas/    # ← Global Zod schemas
│       │       ├── collection.schema.ts
│       │       └── file.schema.ts
│       └── ...
├── components/             # global UI components (ui/, layout/, etc.)
├── lib/                    # utilities, api client, constants
└── config/                 # env, site config
```

## Tech Stack

- **Framework**: Next.js 15.5.9
- **UI Library**: @heroui/react & @heroui/styles (beta)
- **Styling**: Tailwind CSS 4 + Tailwind Variants
- **Validation**: Zod (schemas in `packages/shared/src/schemas/`)
- **File Uploads**: UploadThing
- **API**: GraphQL (via `graphql-request`)
- **Icons**: iconsax-reactjs
- **Lint & Format**: Biome
- **Package Manager**: pnpm

## Quick Start

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

   *Note: Ensure `.npmrc` has `public-hoist-pattern[]=*@heroui/*`*

2. **Run development server**:

   ```bash
   pnpm dev
   ```

3. **Collections API**:
   The app connects to a GraphQL server (default: `http://localhost:3001/graphql`).
   Override with `NEXT_PUBLIC_API_URL` env var.

## GraphQL Architecture

This app uses **client-side GraphQL** exclusively for all API communication:

### Why Client-Side GraphQL?

- ✅ **Full visibility** - All GraphQL queries/mutations appear in browser DevTools and GraphQL Network Inspector
- ✅ **Learning-friendly** - See exactly what's being sent to the API
- ✅ **Type-safe** - Full TypeScript support with `graphql-request`
- ✅ **Cookie authentication** - Automatic session cookie handling with `credentials: 'include'`

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

1. **Login/Signup** - GraphQL mutations set session cookies
2. **Authenticated requests** - `graphqlClient` sends cookies automatically (`credentials: 'include'`)
3. **Backend validation** - NestJS `AuthGuard` validates session from cookies

### File Structure

```text
lib/
├── graphql-client.ts       # Configured GraphQLClient instance
└── graphql/
    ├── auth.ts             # Auth mutations (signIn, signUp, signOut)
    ├── collections.ts      # Collection queries/mutations
    └── files.ts            # File queries/mutations
```

### DevTools Integration

Install [GraphQL Network Inspector](https://chrome.google.com/webstore/detail/graphql-network-inspector) to see all GraphQL traffic in real-time.

## License

MIT License – see LICENSE

Happy building! 🚀
Made with ♥ by pimbo

### GraphQL Architecture Rules

## 🚨 REGLA FUNDAMENTAL

**TODAS las peticiones GraphQL DEBEN ser client-side (desde el navegador) para que sean visibles en DevTools.**

### ✅ CORRECTO - Client-Side GraphQL

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
  
  // Visible en Network Tab > GraphQL ✅
}
```

### ❌ INCORRECTO - Server Actions

```tsx
// actions.ts
export async function getCollections() {
  const client = new GraphQLClient(endpoint);
  const data = await client.request(GET_COLLECTIONS);
  return data.collections;
}

// NO visible en DevTools ❌
```

## 📋 Checklist

### Login/Signup

- ✅ Usa `graphqlClient` directamente
- ✅ Mutations visibles en DevTools
- ✅ Archivo: `app/(marketing)/login/page.tsx`

### Collections

- ✅ Crear collection → client-side
- ✅ Editar collection → client-side  
- ✅ Borrar collection → client-side
- ✅ Listar collections → client-side
- ⚠️ **PENDIENTE**: Refactorizar `page.tsx` a client-side

### Files

- ✅ Upload → client-side (después de UploadThing)
- ✅ Delete → client-side

## 🎯 Implementación

### Para Page Components

Si necesitas SSR (Server-Side Rendering) inicial pero quieres GraphQL visible:

```tsx
'use client';

export default function Page() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await graphqlClient.request(GET_COLLECTIONS);
      setCollections(data.collections);
      setLoading(false);
    }
    load();
  }, []);

  // GraphQL visible en DevTools ✅
}
```

### No usar Server Actions para

- ❌ GraphQL queries
- ❌ GraphQL mutations
- ❌ Cualquier cosa que quieras debuggear en el navegador

### Sí usar Server Actions para

- ✅ Operaciones de servidor puro (file system, etc.)
- ✅ Cosas que NO sean GraphQL

## 📁 Estructura de Archivos

``` text
features/
├── collections/
│   ├── actions.ts          ❌ ELIMINAR (o dejar vacío)
│   ├── hooks/
│   │   └── useCollections.ts  ✅ Client-side fetching
│   └── components/
│       └── collection-list.tsx  ✅ 'use client'
```

## 🔧 Herramientas

- **GraphQL Client**: `graphqlClient` from `@/lib/graphql-client`
- **DevTools**: Chrome/Firefox Network tab → Filter "graphql"
- **Mutations**: Todos visibles como POST requests

---

**RESUMEN**: Si no lo ves en DevTools, está mal implementado.
