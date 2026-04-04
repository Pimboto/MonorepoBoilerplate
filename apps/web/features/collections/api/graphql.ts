import { gql } from 'graphql-request';

export const GET_COLLECTIONS = gql`
  query GetCollections {
    collections {
      id
      name
      description
      userId
      files {
        id
        name
        type
        size
        url
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_COLLECTION = gql`
  query GetCollection($id: ID!) {
    collection(id: $id) {
      id
      name
      description
      userId
      files {
        id
        name
        url
        key
        size
        type
        createdAt
      }
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_COLLECTION = gql`
  mutation CreateCollection($input: CreateCollectionInput!) {
    createCollection(input: $input) {
      id
      name
      description
      createdAt
    }
  }
`;

export const DELETE_COLLECTION = gql`
  mutation DeleteCollection($id: ID!) {
    deleteCollection(id: $id)
  }
`;

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
    }
  }
`;

export const DELETE_FILE = gql`
  mutation DeleteFile($id: ID!) {
    deleteFile(id: $id)
  }
`;
