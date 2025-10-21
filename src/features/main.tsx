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

import { Assignment, Search } from '@mui/icons-material';


import { FeatureConfig, NavigationItem } from '../types/routing';
import { credentialDetailsFeature } from './credential-details/routes';
import SearchPage from '../features/search/SearchPage';

export const allFeatures: FeatureConfig[] = [
  

  credentialDetailsFeature,
  {
     name: "Search",
  icon: <Search />,
  navigationPath: "/search",
  disabled: false,
  routes: [
    {
      path: "/search",
      index: true,
      element: <SearchPage />,
    },
  ]
  }
];


export const features: NavigationItem[] = allFeatures.map(feature => ({
  icon: feature.icon,
  path: feature.navigationPath,
  disabled: feature.disabled
}));

// Get all routes from all features
export const getAllRoutes = () => {
  return allFeatures.flatMap(feature => feature.routes);
};