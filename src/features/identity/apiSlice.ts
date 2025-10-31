import { apiSlice } from '../../services/apiSlice';
const env = (window as any).ENV || {};
const BASE = env.IDENTITY_BASE || `${env.ICHUB_BACKEND_URL}/identity`;

export const identityApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDids: builder.query<any, string>({
      query: (participantId) => `${BASE}/participants/${participantId}/dids`,
    }),
    createDid: builder.mutation<any, { participantId: string; body: any }>({
      query: ({ participantId, body }) => ({
        url: `${BASE}/participants/${participantId}/dids`,
        method: 'POST',
        body,
      }),
    }),
    getKeypairs: builder.query<any, string>({
      query: (participantId) => `${BASE}/participants/${participantId}/keypairs`,
    }),
    createKeypair: builder.mutation<any, { participantId: string; body: any }>({
      query: ({ participantId, body }) => ({
        url: `${BASE}/participants/${participantId}/keypairs`,
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetDidsQuery,
  useCreateDidMutation,
  useGetKeypairsQuery,
  useCreateKeypairMutation,
} = identityApi;
