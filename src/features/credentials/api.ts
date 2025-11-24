import { apiSlice } from '../../services/apiSlice';
const env = (window as any).ENV || {};
const BASE = env.IDENTITY_BASE || `${env.ICHUB_BACKEND_URL}/identity`;


function encodeToBase64(input: string | undefined) {
  if (!input) return input;
  try {
    const utf8 = encodeURIComponent(input).replace(/%([0-9A-F]{2})/g, (_m, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    );
    return btoa(utf8);
  } catch {
    try {
      return btoa(String(input));
    } catch {
      return String(input);
    }
  }
}
function looksLikeBase64(s?: string) {
  if (!s || typeof s !== 'string') return false;
  return /^[A-Za-z0-9+/=_-]+$/.test(s) && s.length >= 4 && s.length % 4 === 0;
}
function ensureBase64(id?: string) {
  if (!id) return id;
  return looksLikeBase64(id) ? id : encodeToBase64(id);
}


export const credentialsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // Get all credentials across participants (admin)
    listAllCredentials: builder.query<any, void>({
      query: () => `${BASE}/v1alpha/credentials`,
      providesTags: ['Credential'],
    }),

    // List credentials for a participant (participantContextId must be base64)
    listCredentialsForParticipant: builder.query<any, { participantContextId: string } | string>({
      query: (arg) => {
        const pid = typeof arg === 'string' ? arg : arg.participantContextId;
        const encoded = ensureBase64(pid);
        return `${BASE}/v1alpha/participants/${encoded}/credentials`;
      },
      providesTags: (_res, _err, arg) => [{ type: 'Credential' as const, id: typeof arg === 'string' ? arg : arg.participantContextId }],
    }),

    // Find credential by id for a participant
    getCredential: builder.query<any, { participantContextId: string; credentialId: string }>({
      query: ({ participantContextId, credentialId }) => {
        const pid = ensureBase64(participantContextId);
        const cred = looksLikeBase64(credentialId) ? credentialId : encodeToBase64(credentialId);
        return `${BASE}/v1alpha/participants/${pid}/credentials/${cred}`;
      },
      providesTags: (_r, _e, arg) => [{ type: 'Credential' as const, id: arg.credentialId }],
    }),

    // Create credential (POST participant credentials)
    createCredential: builder.mutation<any, { participantContextId: string; body: any }>({
      query: ({ participantContextId, body }) => {
        const pid = ensureBase64(participantContextId);
        return {
          url: `${BASE}/v1alpha/participants/${pid}/credentials`,
          method: 'POST',
          body,
        };
      },
      invalidatesTags: [{ type: 'Credential' as const, id: 'LIST' }],
    }),

    // Update credential (PUT participant credentials)
    updateCredential: builder.mutation<any, { participantContextId: string; body: any }>({
      query: ({ participantContextId, body }) => {
        const pid = ensureBase64(participantContextId);
        return {
          url: `${BASE}/v1alpha/participants/${pid}/credentials`,
          method: 'PUT',
          body,
        };
      },
      invalidatesTags: [{ type: 'Credential' as const, id: 'LIST' }],
    }),

    // Delete credential
    deleteCredential: builder.mutation<any, { participantContextId: string; credentialId: string }>({
      query: ({ participantContextId, credentialId }) => {
        const pid = ensureBase64(participantContextId);
        const cred = looksLikeBase64(credentialId) ? credentialId : encodeToBase64(credentialId);
        return {
          url: `${BASE}/v1alpha/participants/${pid}/credentials/${cred}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: [{ type: 'Credential' as const, id: 'LIST' }],
    }),

    // Find credential request by holder id
    findCredentialRequest: builder.query<any, { participantContextId: string; holderPid: string }>({
      query: ({ participantContextId, holderPid }) => {
        const pid = ensureBase64(participantContextId);
        const holder = ensureBase64(holderPid);
        return `${BASE}/v1alpha/participants/${pid}/credentials/request/${holder}`;
      },
    }),

    // Trigger credential request (POST /participants/{pid}/credentials/request)
    triggerCredentialRequest: builder.mutation<any, { participantContextId: string; body: any }>({
      query: ({ participantContextId, body }) => {
        const pid = ensureBase64(participantContextId);
        return {
          url: `${BASE}/v1alpha/participants/${pid}/credentials/request`,
          method: 'POST',
          body,
        };
      },
      invalidatesTags: [{ type: 'Credential' as const, id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListAllCredentialsQuery,
  useListCredentialsForParticipantQuery,
  useGetCredentialQuery,
  useCreateCredentialMutation,
  useUpdateCredentialMutation,
  useDeleteCredentialMutation,
  useFindCredentialRequestQuery,
  useLazyFindCredentialRequestQuery,
  useTriggerCredentialRequestMutation,
} = credentialsApi;

