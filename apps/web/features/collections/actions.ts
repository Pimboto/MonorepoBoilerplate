'use server';

import { GraphQLClient } from 'graphql-request';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import {
  CREATE_COLLECTION,
  DELETE_COLLECTION,
  GET_COLLECTION,
  GET_COLLECTIONS,
} from '@/lib/graphql/collections';
import { CREATE_FILE, DELETE_FILE } from '@/lib/graphql/files';
import type { Collection, CreateCollectionInput, CreateFileInput } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const endpoint = `${API_URL}/graphql`;

const getClient = async () => {
  const cookieStore = await cookies();

  const cookieHeader = cookieStore
    .getAll()
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join('; ');

  return new GraphQLClient(endpoint, {
    headers: {
      Cookie: cookieHeader,
    },
    credentials: 'include',
  });
};

export async function getCollections(): Promise<Collection[]> {
  const client = await getClient();
  try {
    const data = await client.request<{ collections: Collection[] }>(GET_COLLECTIONS);
    return data.collections;
  } catch {
    return [];
  }
}

export async function getCollection(id: string): Promise<Collection | null> {
  const client = await getClient();
  try {
    const data = await client.request<{ collection: Collection }>(GET_COLLECTION, { id });
    return data.collection;
  } catch {
    return null;
  }
}

export async function createCollection(input: CreateCollectionInput) {
  const client = await getClient();
  try {
    await client.request(CREATE_COLLECTION, { input });
    revalidatePath('/app/collections');
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function deleteCollection(id: string) {
  const client = await getClient();
  try {
    await client.request(DELETE_COLLECTION, { id });
    revalidatePath('/app/collections');
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function saveFile(input: CreateFileInput) {
  const client = await getClient();
  try {
    await client.request(CREATE_FILE, { input });
    revalidatePath(`/app/collections/${input.collectionId}`);
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function deleteFile(id: string, collectionId: string) {
  const client = await getClient();
  try {
    await client.request(DELETE_FILE, { id });
    revalidatePath(`/app/collections/${collectionId}`);
    return { success: true };
  } catch {
    return { success: false };
  }
}
