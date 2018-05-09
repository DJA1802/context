import React from 'react';
import { Menu } from 'semantic-ui-react';
import { NavbarSideItems } from '.';

const NavbarSideDesktop = () => {
  return (
    <Menu vertical id="nav-sidebar">
      <NavbarSideItems />
    </Menu>
  );
};

export default NavbarSideDesktop;
