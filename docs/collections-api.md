# Collections & Files API Reference

## Shared Zod Schemas (`@cocostudio/shared`)

```ts
// collection.schema.ts
createCollectionSchema = { name: string (1-255), description?: string (max 1000) }
updateCollectionSchema = { name?: string (1-255), description?: string | null (max 1000) }

// file.schema.ts
createFileSchema = { name: string (1-255), url: string (url), key: string, size: number (int, positive), type: string, collectionId: string }
```

---

## GraphQL Operations

All operations require authentication (cookie-based session). Use `credentials: 'include'`.

### Collections

**Query: `collections`** — Get all user's collections
```graphql
query {
  collections {
    id
    name
    description
    userId
    files { id name url key size type }
    createdAt
    updatedAt
  }
}
```

**Query: `collection(id: ID!)`** — Get single collection
```graphql
query GetCollection($id: ID!) {
  collection(id: $id) {
    id
    name
    description
    userId
    files { id name url key size type createdAt }
    createdAt
    updatedAt
  }
}
```

**Mutation: `createCollection(input: CreateCollectionInput!)`**
```graphql
mutation CreateCollection($input: CreateCollectionInput!) {
  createCollection(input: $input) {
    id name description userId createdAt updatedAt
    files { id }
  }
}
# input: { name: "My Collection", description: "optional" }
```

**Mutation: `updateCollection(id: ID!, input: UpdateCollectionInput!)`**
```graphql
mutation UpdateCollection($id: ID!, $input: UpdateCollectionInput!) {
  updateCollection(id: $id, input: $input) {
    id name description userId createdAt updatedAt
  }
}
# input: { name?: "New Name", description?: "New desc" }
```

**Mutation: `deleteCollection(id: ID!)`** — Returns `Boolean`
```graphql
mutation DeleteCollection($id: ID!) {
  deleteCollection(id: $id)
}
```

### Files

**Query: `filesByCollection(collectionId: ID!)`** — Get all files in a collection
```graphql
query GetFilesByCollection($collectionId: ID!) {
  filesByCollection(collectionId: $collectionId) {
    id name url key size type collectionId userId createdAt updatedAt
  }
}
```

**Mutation: `createFile(input: CreateFileInput!)`** — Save file metadata after UploadThing upload
```graphql
mutation CreateFile($input: CreateFileInput!) {
  createFile(input: $input) {
    id name url key size type collectionId userId createdAt updatedAt
  }
}
# input: { name: "photo.jpg", url: "https://utfs.io/...", key: "abc123", size: 102400, type: "image/jpeg", collectionId: "clx..." }
```

**Mutation: `deleteFile(id: ID!)`** — Returns `Boolean`
```graphql
mutation DeleteFile($id: ID!) {
  deleteFile(id: $id)
}
```

---

## Upload Flow

1. Client uploads file via **UploadThing** (`POST /api/uploadthing`) → gets `{ url, key, name, size, type }`
2. Client calls **GraphQL** `createFile` mutation with metadata + `collectionId`
3. Backend verifies collection ownership, saves metadata to DB

## GraphQL Endpoint

```
POST http://localhost:3001/graphql
Content-Type: application/json
Cookie: (session cookie from signIn)
```

## TypeScript Types (Frontend)

```ts
interface Collection {
  id: string;
  name: string;
  description?: string | null;
  userId: string;
  files?: FileItem[];
  createdAt: string;
  updatedAt: string;
}

interface FileItem {
  id: string;
  name: string;
  url: string;
  key: string;
  size: number;
  type: string;
  collectionId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
```
