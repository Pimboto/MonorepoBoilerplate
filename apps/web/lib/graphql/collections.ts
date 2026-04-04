import { gql } from 'graphql-request';

// Query to get all collections
export const GET_COLLECTIONS = gql`
  query GetCollections {
    collections {
      id
      name
      description
      createdAt
      updatedAt
      userId
      files {
        id
        url
        type
      }
    }
  }
`;

// Query to get a single collection
export const GET_COLLECTION = gql`
  query GetCollection($id: ID!) {
    collection(id: $id) {
      id
      name
      description
      createdAt
      updatedAt
      userId
      files {
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
  }
`;

// Mutation to create a collection
export const CREATE_COLLECTION = gql`
  mutation CreateCollection($input: CreateCollectionInput!) {
    createCollection(input: $input) {
      id
      name
      description
      createdAt
      updatedAt
      userId
    }
  }
`;

// Mutation to update a collection
export const UPDATE_COLLECTION = gql`
  mutation UpdateCollection($id: ID!, $input: UpdateCollectionInput!) {
    updateCollection(id: $id, input: $input) {
      id
      name
      description
      updatedAt
    }
  }
`;

// Mutation to delete a collection
export const DELETE_COLLECTION = gql`
  mutation DeleteCollection($id: ID!) {
    deleteCollection(id: $id)
  }
`;
