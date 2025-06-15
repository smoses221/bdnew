import React from 'react';
import { Menu } from 'antd';
import {
  HomeOutlined,
  TeamOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  LogoutOutlined,
  LoginOutlined,
} from '@ant-design/icons';
import './NavigationBar.css';

const NavigationBar = ({ currentUser, onNavigate, onLogout }) => {
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
    ...(currentUser ? [
      {
        key: 'admin',
        icon: <SettingOutlined />,
        label: 'Admin',
      },
    ] : []),
    {
      key: currentUser ? 'logout' : 'login',
      icon: currentUser ? <LogoutOutlined /> : <LoginOutlined />,
      label: currentUser ? `Logout (${currentUser?.username || 'Guest'})` : 'Login',
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      onLogout();
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
