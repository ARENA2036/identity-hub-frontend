import { PeopleAlt } from '@mui/icons-material';
import IdentityGrid from "./Identity";
import { FeatureConfig } from '../../types/routing';

export const identityFeature: FeatureConfig = {
  name: 'Identity',
  icon: <PeopleAlt />,
  navigationPath: '/identity',
  routes: [
    {
      path: '/identity',
      element: <IdentityGrid />,
    },
  ],
  disabled: false,
};
