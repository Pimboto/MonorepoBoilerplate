import { gql } from 'graphql-request';

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
