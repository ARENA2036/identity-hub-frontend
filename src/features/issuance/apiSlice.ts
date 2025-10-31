import { apiSlice } from '../../services/apiSlice';
const env = (window as any).ENV || {};
const BASE = env.PRESENTATION_BASE || `${env.ICHUB_BACKEND_URL}/presentation`;

export const issuanceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    issueCredential: builder.mutation<any, { body: any }>({
      query: ({ body }) => ({
        url: `${BASE}/issuance/issue`,
        method: 'POST',
        body,
      }),
    }),
    getIssuedCredentials: builder.query<any, void>({
      query: () => `${BASE}/issuance/issued`,
    }),
  }),
});

export const { useIssueCredentialMutation, useGetIssuedCredentialsQuery } = issuanceApi;
