import { apiSlice } from '../../services/apiSlice';
const env = (window as any).ENV || {};
const BASE = env.IDENTITY_BASE || `${env.ICHUB_BACKEND_URL}/identity/v1alpha`;

export const participantApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listParticipants: builder.query<any, { offset?: number; limit?: number } | void>({
      query: (params) => {
        const offset = params && params.offset !== undefined ? params.offset : 0;
        const limit = params && params.limit !== undefined ? params.limit : 50;
        return {
          url: `${BASE}/participants`,
          method: 'GET',
          params: { offset, limit },
        };
      },
      // Provide tags using the existing "ParticipantContext" tag declared in apiSlice
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((p: any) => ({ type: 'ParticipantContext' as const, id: p.participantId })),
              { type: 'ParticipantContext' as const, id: 'LIST' },
            ]
          : [{ type: 'ParticipantContext' as const, id: 'LIST' }],
    }),

    createParticipant: builder.mutation<any, any>({
      query: (body) => ({
        url: `${BASE}/participants`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'ParticipantContext' as const, id: 'LIST' }],
    }),

    getParticipant: builder.query<any, string>({
      query: (participantId) => ({
        url: `${BASE}/participants/${participantId}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'ParticipantContext' as const, id }],
    }),

    deleteParticipant: builder.mutation<any, string>({
      query: (participantId) => ({
        url: `${BASE}/participants/${participantId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'ParticipantContext' as const, id: 'LIST' }],
    }),

    regenerateToken: builder.mutation<any, string>({
      query: (participantId) => ({
        url: `${BASE}/participants/${participantId}/token`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'ParticipantContext' as const, id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListParticipantsQuery,
  useCreateParticipantMutation,
  useGetParticipantQuery,
  useDeleteParticipantMutation,
  useRegenerateTokenMutation,
} = participantApi;
