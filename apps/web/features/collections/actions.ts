'use server';

import { GraphQLClient } from 'graphql-request';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import {
  CREATE_COLLECTION,
  CREATE_FILE,
  DELETE_COLLECTION,
  DELETE_FILE,
  GET_COLLECTION,
  GET_COLLECTIONS,
} from './api/graphql';
import { CreateCollectionInput, CreateFileInput } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const endpoint = `${API_URL}/graphql`;

const getClient = async () => {
  const cookieStore = await cookies();

  // Properly format cookies for the Cookie header
  const cookieHeader = cookieStore
    .getAll()
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join('; ');

  return new GraphQLClient(endpoint, {
    headers: {
      Cookie: cookieHeader,
    },
    credentials: 'include', // Important for cookie-based auth
  });
};

export async function getCollections() {
  const client = await getClient();
  try {
    const data: any = await client.request(GET_COLLECTIONS);
    return data.collections;
  } catch (error) {
    console.error('Failed to fetch collections', error);
    return [];
  }
}

export async function getCollection(id: string) {
  const client = await getClient();
  try {
    const data: any = await client.request(GET_COLLECTION, { id });
    return data.collection;
  } catch (error) {
    console.error(`Failed to fetch collection ${id}`, error);
    return null;
  }
}

export async function createCollection(input: CreateCollectionInput) {
  const client = await getClient();
  try {
    await client.request(CREATE_COLLECTION, { input });
    revalidatePath('/app/collections');
    return { success: true };
  } catch (error) {
    console.error('Failed to create collection', error);
    return { success: false, error };
  }
}

export async function deleteCollection(id: string) {
  const client = await getClient();
  try {
    await client.request(DELETE_COLLECTION, { id });
    revalidatePath('/app/collections');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete collection', error);
    return { success: false, error };
  }
}

export async function saveFile(input: CreateFileInput) {
  const client = await getClient();
  try {
    await client.request(CREATE_FILE, { input });
    revalidatePath(`/app/collections/${input.collectionId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to save file', error);
    return { success: false, error };
  }
}

export async function deleteFile(id: string, collectionId: string) {
  const client = await getClient();
  try {
    await client.request(DELETE_FILE, { id });
    revalidatePath(`/app/collections/${collectionId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete file', error);
    return { success: false, error };
  }
}
