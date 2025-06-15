import React, { useContext } from 'react';
import { Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  TeamOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  LogoutOutlined,
  LoginOutlined,
} from '@ant-design/icons';
import { UserContext } from '../context/UserContext';
import '../styles/components/NavigationBar.css';

const NavigationBar = () => {
  const { currentUser, isAuthenticated, handleLogout } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Get current path to highlight active menu item
  const currentPath = location.pathname.substring(1) || 'bdteque';

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
      icon: isAuthenticated ? <LogoutOutlined /> : <LoginOutlined />,
      label: isAuthenticated ? `Logout (${currentUser?.username || 'Guest'})` : 'Login',
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      handleLogout();
      navigate('/bdteque');
    } else if (key === 'login') {
      navigate('/login');
    } else {
      navigate(`/${key}`);
    }
  };

  return (
    <div className="navigation-bar-right">
      <Menu
        mode="horizontal"
        selectedKeys={[currentPath]}
        onClick={handleMenuClick}
        items={menuItems}
      />
    </div>
  );
};

export default NavigationBar;
