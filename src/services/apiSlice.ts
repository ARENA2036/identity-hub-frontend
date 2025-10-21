import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
 // adjust if token helper differs

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api', // or your backend root URL
    // prepareHeaders: (headers) => {
    //   const token = getAccessToken?.();
    //   if (token) headers.set('Authorization', `Bearer ${token}`);
    //   return headers;
    // },
  }),
  tagTypes: ['Credentials', 'Credential'],
  endpoints: () => ({}),
});
