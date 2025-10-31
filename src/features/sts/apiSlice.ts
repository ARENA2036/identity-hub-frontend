import { apiSlice } from '../../services/apiSlice';
const env = (window as any).ENV || {};
const BASE = env.STS_BASE || `${env.ICHUB_BACKEND_URL}/sts`;

export const stsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getToken: builder.mutation<any, { body: any }>({
      query: ({ body }) => ({
        url: `${BASE}/token`,
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useGetTokenMutation } = stsApi;
