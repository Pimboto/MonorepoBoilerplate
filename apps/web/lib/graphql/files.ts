import { gql } from 'graphql-request';

// Query to get files by collection
export const GET_FILES_BY_COLLECTION = gql`
  query GetFilesByCollection($collectionId: ID!) {
    filesByCollection(collectionId: $collectionId) {
      id
      name
      url
      key
      size
      type
      collectionId
      userId
      createdAt
      updatedAt
    }
  }
`;

// Mutation to create a file
export const CREATE_FILE = gql`
  mutation CreateFile($input: CreateFileInput!) {
    createFile(input: $input) {
      id
      name
      url
      key
      size
      type
      collectionId
      userId
      createdAt
      updatedAt
    }
  }
`;

// Mutation to delete a file
export const DELETE_FILE = gql`
  mutation DeleteFile($id: ID!) {
    deleteFile(id: $id)
  }
`;
