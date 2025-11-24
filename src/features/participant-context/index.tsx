import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import ParticipantListPage from './components/ParticipantListPage'; 
import { FeatureConfig } from '../../types/routing';

export const participantFeature: FeatureConfig = {
  name: 'Participant Context',
  icon: <SwitchAccountIcon />,
  navigationPath: '/participant-context',
  disabled: false,
  routes: [
    {
      path: '/participant-context',
      element: <ParticipantListPage />,
    },
  ],
};
