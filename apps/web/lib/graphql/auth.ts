import { gql } from 'graphql-request';

export const SIGN_IN = gql`
  mutation SignIn($input: SignInInput!) {
    signIn(input: $input) {
      user {
        id
        email
        name
      }
      message
    }
  }
`;

export const SIGN_UP = gql`
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) {
      user {
        id
        email
        name
      }
      message
    }
  }
`;

export const SIGN_OUT = gql`
  mutation SignOut {
    signOut
  }
`;

export const ME = gql`
  query Me {
    me {
      id
      name
      email
      emailVerified
      image
      createdAt
      updatedAt
    }
  }
`;
