import { apiSlice } from '../../services/apiSlice';
const env = (window as any).ENV || {};
const BASE = env.IDENTITY_BASE || `${env.ICHUB_BACKEND_URL}/identity`;

export const issuerAdminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listIssuers: builder.query<any, void>({
      query: () => `${BASE}/issueradmin/issuers`,
    }),
    getIssuer: builder.query<any, string>({
      query: (id) => `${BASE}/issueradmin/issuers/${id}`,
    }),
    createIssuer: builder.mutation<any, any>({
      query: (body) => ({
        url: `${BASE}/issueradmin/issuers`,
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useListIssuersQuery, useGetIssuerQuery, useCreateIssuerMutation } =
  issuerAdminApi;
