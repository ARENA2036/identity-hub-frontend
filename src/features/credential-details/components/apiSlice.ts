import { apiSlice } from  "../../../services/apiSlice";

export type VerifiableCredential = {
  id?: string;
  participantContextId?: string;
  verifiableCredentialContainer?: {
    credential?: {
      '@context'?: string[];
      type?: string[];
      issuer?: string;
      issuanceDate?: string;
      expirationDate?: string;
      credentialSubject?: Array<Record<string, unknown>>;
      // proof?: Record<string, unknown>;
    };
  };
};

export type WalletListItem = {
  id: string;
  issuer?: string;
  issuanceDate?: string;
  label?: string;
  walletAddress?: string;
  subjectId?: string;
  raw: VerifiableCredential;
};

const mapToWalletItem = (vc: VerifiableCredential): WalletListItem => {
  const cred = vc?.verifiableCredentialContainer?.credential || {};
  const cs = Array.isArray(cred.credentialSubject) ? cred.credentialSubject[0] as Record<string, unknown> : {};
  return {
    id: (vc as any).id ?? '',
    issuer: cred.issuer,
    issuanceDate: cred.issuanceDate,
    label: (cs?.label as string) || undefined,
    walletAddress: (cs?.walletAddress as string) || undefined,
    subjectId: (cs?.id as string) || undefined,
    raw: vc,
  };
};

export const credentialDetailsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /** GET /v1/participants/{ctx}/credentials — list credentials for a participant */
    listCredentials: builder.query<WalletListItem[], { participantContextId: string; filterType?: string }>({
      query: ({ participantContextId }) => ({
        url: `/v1/participants/${encodeURIComponent(participantContextId)}/credentials`,
        method: 'GET',
      }),
      transformResponse: (response: VerifiableCredential[], _meta, arg) => {
        const rows = (response ?? []).map(mapToWalletItem);
        // if filterType is provided (e.g. 'WalletCredential') filter client-side
        return arg.filterType
          ? rows.filter((r) =>
              (r.raw.verifiableCredentialContainer?.credential?.type ?? []).includes(arg.filterType!)
            )
          : rows;
      },
      providesTags: (_result, _err, arg) => [{ type: 'Credentials' as const, id: arg.participantContextId }],
    }),

    /** GET /v1/participants/{ctx}/credentials/{id} — get one credential */
    getCredentialById: builder.query<VerifiableCredential, { participantContextId: string; credentialId: string }>({
      query: ({ participantContextId, credentialId }) => ({
        url: `/v1/participants/${encodeURIComponent(participantContextId)}/credentials/${encodeURIComponent(credentialId)}`,
        method: 'GET',
      }),
      providesTags: (_res, _err, arg) => [{ type: 'Credential' as const, id: `${arg.participantContextId}:${arg.credentialId}` }],
    }),

    /** POST /v1/participants/{ctx}/credentials — create/store a credential (Add Wallet) */
    createCredential: builder.mutation<
      void,
      {
        participantContextId: string;
        body: VerifiableCredential; // should contain verifiableCredentialContainer.credential
      }
    >({
      query: ({ participantContextId, body }) => ({
        url: `/v1/participants/${encodeURIComponent(participantContextId)}/credentials`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'Credentials' as const, id: arg.participantContextId }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListCredentialsQuery,
  useGetCredentialByIdQuery,
  useLazyGetCredentialByIdQuery,
  useCreateCredentialMutation,
} = credentialDetailsApi;