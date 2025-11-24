import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const env = (window as any).ENV || {};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: env.ICHUB_BACKEND_URL || 'http://localhost:9000/v1',
    prepareHeaders: (headers) => {
    
      if (env.API_KEY) {
        headers.set('X-Api-Key', env.API_KEY);
      }
      return headers;
    },
  }),
  tagTypes: [
    'ParticipantContext',
    'DID',
    'Keypair',
    'Credential',
    'Issuer',
    'Issuance',
    'StatusList',
    'STS',
  ],
  endpoints: () => ({}),
});
