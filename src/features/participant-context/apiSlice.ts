import { apiSlice } from '../../services/apiSlice';
const env = (window as any).ENV || {};
const BASE = env.IDENTITY_BASE || `${env.ICHUB_BACKEND_URL}/identity`;

export const participantApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listParticipants: builder.query<any, void>({
      query: () => `${BASE}/participants`,
    }),
    createParticipant: builder.mutation<any, any>({
      query: (body) => ({
        url: `${BASE}/participants`,
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useListParticipantsQuery, useCreateParticipantMutation } = participantApi;
