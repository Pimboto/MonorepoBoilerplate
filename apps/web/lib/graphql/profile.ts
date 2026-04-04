import { gql } from 'graphql-request';

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      name
      email
      image
      updatedAt
    }
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input)
  }
`;

export const MY_SESSIONS = gql`
  query MySessions {
    mySessions {
      sessions {
        id
        token
        expiresAt
        createdAt
        ipAddress
        userAgent
        userId
      }
      currentSessionToken
    }
  }
`;

export const REVOKE_SESSION = gql`
  mutation RevokeSession($sessionToken: String!) {
    revokeSession(sessionToken: $sessionToken)
  }
`;
