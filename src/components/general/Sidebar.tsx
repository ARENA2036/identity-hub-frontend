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

import { useState, JSX } from "react";
import { Box } from "@mui/material";
import { NavLink } from 'react-router-dom';
import { Search } from "@mui/icons-material";

type SidebarItem = {
  icon: JSX.Element;
  path: string;
  disabled: boolean;
};

const Sidebar = ({ items }: { items: SidebarItem[] }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Replace only the second item’s icon with Search
  const updatedItems = items.map((item, index) => {
    if (index === 1) {
      return { ...item, icon: <Search /> };
    }
    return item;
  });

  return (
    <Box className="sidebarContainer">
      {updatedItems.map((item, index) => (
        <NavLink
          to={item.path}
          key={index}
          className={`iconButton ${index === activeIndex ? "active" : ""} ${
            item.disabled ? "disabled" : ""
          }`}
          onClick={() => setActiveIndex(index)}
        >
          {item.icon}
        </NavLink>
      ))}
    </Box>
  );
};

export default Sidebar;