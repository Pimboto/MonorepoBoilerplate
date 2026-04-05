import { gql } from 'graphql-request';

export const GET_WORKFLOWS = gql`
  query GetWorkflows {
    workflows {
      id
      name
      description
      nodes
      edges
      createdAt
      updatedAt
    }
  }
`;

export const GET_WORKFLOW = gql`
  query GetWorkflow($id: ID!) {
    workflow(id: $id) {
      id
      name
      description
      nodes
      edges
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_WORKFLOW = gql`
  mutation CreateWorkflow($input: CreateWorkflowInput!) {
    createWorkflow(input: $input) {
      id
      name
      description
      nodes
      edges
    }
  }
`;

export const UPDATE_WORKFLOW = gql`
  mutation UpdateWorkflow($id: ID!, $input: UpdateWorkflowInput!) {
    updateWorkflow(id: $id, input: $input) {
      id
      name
      description
      nodes
      edges
      updatedAt
    }
  }
`;

export const DELETE_WORKFLOW = gql`
  mutation DeleteWorkflow($id: ID!) {
    deleteWorkflow(id: $id)
  }
`;
