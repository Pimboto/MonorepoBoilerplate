export interface FileItem {
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

export interface Collection {
  id: string;
  name: string;
  description?: string | null;
  userId: string;
  files?: FileItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCollectionInput {
  name: string;
  description?: string;
}

export interface UpdateCollectionInput {
  name?: string;
  description?: string;
}

export interface CreateFileInput {
  name: string;
  url: string;
  key: string;
  size: number;
  type: string;
  collectionId: string;
}
