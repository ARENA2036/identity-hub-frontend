import { apiSlice } from '../../services/apiSlice';
const env = (window as any).ENV || {};
const BASE = env.IDENTITY_BASE || `${env.ICHUB_BACKEND_URL}/identity`;

export const credentialsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listCredentials: builder.query<any[], string>({
      query: (participantId) => `${BASE}/participants/${participantId}/credentials`,
    }),
    getCredentialById: builder.query<any, { participantId: string; credentialId: string }>({
      query: ({ participantId, credentialId }) =>
        `${BASE}/participants/${participantId}/credentials/${credentialId}`,
    }),
    createCredential: builder.mutation<any, { participantId: string; body: any }>({
      query: ({ participantId, body }) => ({
        url: `${BASE}/participants/${participantId}/credentials`,
        method: 'POST',
        body,
      }),
    }),
    verifyCredential: builder.mutation<any, { participantId: string; credentialId: string }>({
      query: ({ participantId, credentialId }) => ({
        url: `${BASE}/participants/${participantId}/credentials/${credentialId}/verify`,
        method: 'POST',
      }),
    }),
    revokeCredential: builder.mutation<any, { participantId: string; credentialId: string }>({
      query: ({ participantId, credentialId }) => ({
        url: `${BASE}/participants/${participantId}/credentials/${credentialId}/revoke`,
        method: 'POST',
      }),
    }),
    rotateKey: builder.mutation<any, { participantContextId: string; credentialId: string }>({
      query: ({ participantContextId, credentialId }) => ({
        url: `/v1/participants/${encodeURIComponent(participantContextId)}/credentials/${encodeURIComponent(credentialId)}/rotate`,
        method: 'POST',
      }),
    }),
  })

});

export const {
  useListCredentialsQuery,
  useGetCredentialByIdQuery,
  useCreateCredentialMutation,
  useVerifyCredentialMutation,
  useRevokeCredentialMutation,
  useRotateKeyMutation,
} = credentialsApi;
