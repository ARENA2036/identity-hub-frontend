import { apiSlice } from '../../services/apiSlice';
const env = (window as any).ENV || {};
const BASE = env.IDENTITY_BASE || `${env.ICHUB_BACKEND_URL}/identity`;

function encodeToBase64(input: string | undefined) {
  if (!input) return input;
  try {
    // produce UTF-8 binary then btoa (standard base64 with = padding)
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

export const didApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    
    // Get all DID documents across all participant contexts (admin)
    getAllDids: builder.query<any[], void>({
      query: () => `${BASE}/v1alpha/dids`,
      providesTags: ['DID'],
    }),

    // Get DID documents for particular participant
    getDidsForParticipant: builder.query<any, { participantContextId: string } | string>({
      query: (arg) => {
        const participantContextId = typeof arg === 'string' ? arg : arg.participantContextId;
        const pid = ensureBase64(participantContextId);
        return `${BASE}/v1alpha/participants/${pid}/dids`;
      },
      providesTags: (_r, _e, arg) => [{ type: 'DID' as const, id: typeof arg === 'string' ? arg : arg.participantContextId }],
    }),

    // Publish DID (body { did: "did:web:..." })
    publishDid: builder.mutation<any, { participantContextId: string; did: string }>(
      {
        query: ({ participantContextId, did }) => {
          const pid = ensureBase64(participantContextId);
          return {
            url: `${BASE}/v1alpha/participants/${pid}/dids/publish`,
            method: 'POST',
            body: { did },
          };
        },
        invalidatesTags: ['DID'],
      }
    ),

    // Unpublish
    unpublishDid: builder.mutation<any, { participantContextId: string; did: string }>(
      {
        query: ({ participantContextId, did }) => {
          const pid = ensureBase64(participantContextId);
          return {
            url: `${BASE}/v1alpha/participants/${pid}/dids/unpublish`,
            method: 'POST',
            body: { did },
          };
        },
        invalidatesTags: ['DID'],
      }
    ),

    // State of DID (body { did: "did:web:..." })
    getDidState: builder.mutation<any, { participantContextId: string; did: string }>(
      {
        query: ({ participantContextId, did }) => {
          const pid = ensureBase64(participantContextId);
          return {
            url: `${BASE}/v1alpha/participants/${pid}/dids/state`,
            method: 'POST',
            body: { did },
          };
        },
      }
    ),

    // Query DID documents for participant (POST /participants/{pid}/dids/query)
    queryDids: builder.mutation<any, { participantContextId: string; body: any }>(
      {
        query: ({ participantContextId, body }) => {
          const pid = ensureBase64(participantContextId);
          return {
            url: `${BASE}/v1alpha/participants/${pid}/dids/query`,
            method: 'POST',
            body,
          };
        },
      }
    ),

    // Add service endpoint to a particular DID:
    addServiceEndpoint: builder.mutation<
      any,
      { participantContextId: string; did: string; serviceBody: { id: string; serviceEndpoint: string; type: string; autoPublish?: boolean } }
    >({
      query: ({ participantContextId, did, serviceBody }) => {
        const pid = ensureBase64(participantContextId);
        const encodedDid = ensureBase64(did);
        const qp = serviceBody.autoPublish ? '?autoPublish=true' : '';
        return {
          url: `${BASE}/v1alpha/participants/${pid}/dids/${encodedDid}/endpoints${qp}`,
          method: 'POST',
          body: { id: serviceBody.id, serviceEndpoint: serviceBody.serviceEndpoint, type: serviceBody.type },
        };
      },
      invalidatesTags: ['DID'],
    }),

    // Replace service endpoint (PATCH)
    replaceServiceEndpoint: builder.mutation<
      any,
      { participantContextId: string; did: string; serviceBody: { id: string; serviceEndpoint: string; type: string; autoPublish?: boolean } }
    >({
      query: ({ participantContextId, did, serviceBody }) => {
        const pid = ensureBase64(participantContextId);
        const encodedDid = ensureBase64(did);
        const qp = serviceBody.autoPublish ? '?autoPublish=true' : '';
        return {
          url: `${BASE}/v1alpha/participants/${pid}/dids/${encodedDid}/endpoints${qp}`,
          method: 'PATCH',
          body: { id: serviceBody.id, serviceEndpoint: serviceBody.serviceEndpoint, type: serviceBody.type },
        };
      },
      invalidatesTags: ['DID'],
    }),

    // Remove service endpoint (DELETE) with serviceId and autoPublish optionally
    removeServiceEndpoint: builder.mutation<
      any,
      { participantContextId: string; did: string; serviceId: string; autoPublish?: boolean }
    >({
      query: ({ participantContextId, did, serviceId, autoPublish }) => {
        const pid = ensureBase64(participantContextId);
        const encodedDid = ensureBase64(did);
        const qp = `?serviceId=${encodeURIComponent(serviceId)}${autoPublish ? '&autoPublish=true' : ''}`;
        return {
          url: `${BASE}/v1alpha/participants/${pid}/dids/${encodedDid}/endpoints${qp}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['DID'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllDidsQuery,
  useGetDidsForParticipantQuery,
  usePublishDidMutation,
  useUnpublishDidMutation,
  useGetDidStateMutation,
  useQueryDidsMutation,
  useAddServiceEndpointMutation,
  useReplaceServiceEndpointMutation,
  useRemoveServiceEndpointMutation,
} = didApi;
