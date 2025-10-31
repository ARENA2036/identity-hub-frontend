import { apiSlice } from '../../services/apiSlice';
const env = (window as any).ENV || {};
const BASE = env.STATUSLIST_BASE || `${env.ICHUB_BACKEND_URL}/statuslist`;

export const statusListApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStatusByCredentialId: builder.query<any, string>({
      query: (credentialId) => `${BASE}/status-list/${credentialId}`,
    }),
  }),
});

export const { useGetStatusByCredentialIdQuery } = statusListApi;
