
import { apiSlice } from '../../services/apiSlice';
const env = (window as any).ENV || {};
const BASE = env.IDENTITY_BASE || `${env.ICHUB_BACKEND_URL}/identity/v1alpha`;

export const keypairApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    
    getKeypair: builder.query<any, { participantContextId: string; keypairId: string }>({
      query: ({ participantContextId, keypairId }) => ({
        url: `${BASE}/participants/${participantContextId}/keypairs/${keypairId}`,
        method: 'GET',
      }),
      providesTags: (result, error, { keypairId }) => [{ type: 'Keypair' as const, id: keypairId }],
    }),

    
    listKeypairsForParticipant: builder.query<any, { participantContextId: string }>({
      query: ({ participantContextId }) => ({
        url: `${BASE}/participants/${participantContextId}/keypairs`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((kp: any) => ({ type: 'Keypair' as const, id: kp.id })),
              { type: 'Keypair' as const, id: 'LIST' },
            ]
          : [{ type: 'Keypair' as const, id: 'LIST' }],
    }),

    
    listAllKeypairs: builder.query<any, { offset?: number; limit?: number } | void>({
      query: (params) => {
        const offset = params?.offset ?? 0;
        const limit = params?.limit ?? 50;
        return {
          url: `${BASE}/keypairs`,
          method: 'GET',
          params: { offset, limit },
        };
      },
      providesTags: (result) =>
        Array.isArray(result)
          ? [
              ...result.map((kp: any) => ({ type: 'Keypair' as const, id: kp.id })),
              { type: 'Keypair' as const, id: 'LIST' },
            ]
          : [{ type: 'Keypair' as const, id: 'LIST' }],
    }),

    // revoke
    revokeKeypair: builder.mutation<any, { participantContextId: string; keypairId: string; body?: any }>({
      query: ({ participantContextId, keypairId, body }) => ({
        url: `${BASE}/participants/${participantContextId}/keypairs/${keypairId}/revoke`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Keypair' as const, id: 'LIST' }],
    }),

    // rotate
    rotateKeypair: builder.mutation<any, { participantContextId: string; keypairId: string; duration?: number; body?: any }>({
      query: ({ participantContextId, keypairId, duration, body }) => ({
        url: `${BASE}/participants/${participantContextId}/keypairs/${keypairId}/rotate`,
        method: 'POST',
        params: duration ? { duration } : undefined,
        body,
      }),
      invalidatesTags: [{ type: 'Keypair' as const, id: 'LIST' }],
    }),

    // activate
    activateKeypair: builder.mutation<any, { participantContextId: string; keypairId: string }>({
      query: ({ participantContextId, keypairId }) => ({
        url: `${BASE}/participants/${participantContextId}/keypairs/${keypairId}/activate`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Keypair' as const, id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetKeypairQuery,
  useListKeypairsForParticipantQuery,
  useListAllKeypairsQuery,
  useRevokeKeypairMutation,
  useRotateKeypairMutation,
  useActivateKeypairMutation,
} = keypairApi;
