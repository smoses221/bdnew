import React, { useContext } from 'react';
import { Menu } from 'antd';
import {
  HomeOutlined,
  TeamOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  LogoutOutlined,
  LoginOutlined,
} from '@ant-design/icons';
import { UserContext } from '../context/UserContext';
import './NavigationBar.css';

const NavigationBar = ({ onNavigate }) => {
  const { currentUser, isAuthenticated, handleLogout } = useContext(UserContext);

  const menuItems = [
    {
      key: 'bdteque',
      icon: <HomeOutlined />,
      label: 'BDtèque',
    },
    {
      key: 'nos-actis',
      icon: <TeamOutlined />,
      label: 'Nos Actis',
    },
    {
      key: 'sur-nous',
      icon: <InfoCircleOutlined />,
      label: 'Sur Nous',
    },
    ...(isAuthenticated ? [
      {
        key: 'admin',
        icon: <SettingOutlined />,
        label: 'Admin',
      },
    ] : []),
    {
      key: isAuthenticated ? 'logout' : 'login',
      icon: isAuthenticated ? <LogoutOutlined /> : <HomeOutlined />,
      label: isAuthenticated ? `Logout (${currentUser?.username || 'Guest'})` : 'Login',
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      handleLogout();
    } else if (key === 'login') {
      onNavigate('login');
    } else {
      onNavigate(key);
    }
  };

  return (
    <div className="navigation-bar-right">
      <Menu
        mode="horizontal"
        onClick={handleMenuClick}
        items={menuItems}
      />
    </div>
  );
};

export default NavigationBar;
