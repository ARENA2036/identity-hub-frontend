/********************************************************************************
 * Eclipse Tractus-X - Identity Hub Frontend
 *
 * Copyright (c) 2025 Contributors to the Eclipse Foundation
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Apache License, Version 2.0 which is available at
 * https://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the
 * License for the specific language govern in permissions and limitations
 * under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
********************************************************************************/

import { Assignment, DeviceHub, Search, AccountCircle, PeopleAlt, SwitchAccount, SyncLock } from '@mui/icons-material';

import { FeatureConfig, NavigationItem } from '../types/routing';

import CredentialPage from '../features/credentials/CredentialPage';
import ParticipantContextPage from '../features/participant-context/ParticipantContextPage';
import SearchPage from '../features/search/SearchPage';
import { KeypairSidebarIcon } from '../features/keypairs/KeypairSidebar';
import IdentityGrid from "./identity/Identity";
import DidPage from '../features/did/DidPage';
import KeypairPage from './keypairs/KeypairPage';

export const allFeatures: FeatureConfig[] = [


  {
    name: 'Participant Context',
    icon: <SwitchAccount />,
    navigationPath: '/participant-context',
    disabled: false,
    routes: [{ path: '/participant-context', element: <ParticipantContextPage /> }],
  },
  {
    name: 'Search',
    icon: <Search />,
    navigationPath: '/search',
    disabled: false,
    routes: [{ path: '/search', index: true, element: <SearchPage /> }]
  },

  {
    name: 'Identity',
    icon: <PeopleAlt />,
    navigationPath: '/identity',
    disabled: false,
    routes: [{ path: '/identity', element: <IdentityGrid /> }],
  },
  {
    name: 'KeyPairs',
    icon: <KeypairSidebarIcon />,
    navigationPath: '/keypairs',
    disabled: false,
    routes: [{ path: '/keypairs', element: <KeypairPage /> }],
  },
  {
    name: 'DID',
    icon: <DeviceHub />,
    navigationPath: '/did',
    disabled: false,
    routes: [
      { path: '/did', element: <DidPage /> },
    ],
  },
  {
    name: 'Credentials',
    icon: <SyncLock />,
    navigationPath: '/credentials',
    disabled: false,
    routes: [
      { path: '/credentials', element: <CredentialPage /> }
    ],
  }

];

export const features: NavigationItem[] = allFeatures.map((feature) => ({
  icon: feature.navigationPath === '/identity' ? <PeopleAlt /> : feature.icon,
  path: feature.navigationPath,
  disabled: feature.disabled,
}));

export const getAllRoutes = () => {
  return allFeatures.flatMap((feature) => feature.routes);
};
