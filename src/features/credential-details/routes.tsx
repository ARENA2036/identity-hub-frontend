import { VpnKey } from '@mui/icons-material'
import CredentialDetailsPage from './pages/CredentialDetailsPage'
import { FeatureConfig } from '../../types/routing'

export const credentialDetailsFeature: FeatureConfig = {
    name: 'Credential Details',
    icon: <VpnKey />,
    navigationPath: '/credential-details',
    routes: [
        {
            path: '/credential-details',
            element: <CredentialDetailsPage />,
        },
    ],
    disabled: false
}
