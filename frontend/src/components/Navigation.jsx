import React, { useMemo } from 'react';
import { Menu, Typography, Button, Space } from 'antd';
import { 
  HomeOutlined, 
  TeamOutlined, 
  InfoCircleOutlined, 
  UserOutlined,
  BookOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons';

const { Title } = Typography;

const Navigation = ({ 
  currentPage, 
  onNavigate, 
  isAuthenticated, 
  currentUser, 
  onLogout 
}) => {
  // Memoize menu items to re-calculate when authentication state changes
  const menuItems = useMemo(() => {
    const items = [
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
      }
    ];

    // Add admin menu item only if authenticated and user is admin
    if (isAuthenticated && currentUser?.is_admin) {
      items.push({
        key: 'admin',
        icon: <SettingOutlined />,
        label: 'Admin',
      });
    }

    return items;
  }, [isAuthenticated, currentUser?.is_admin]);

  const handleMenuClick = ({ key }) => {
    // Handle special cases
    if (key === 'nos-actis') {
      window.open('https://www.facebook.com/Kot.BD', '_blank');
      return;
    }
    
    onNavigate(key);
  };

  return (
    <nav style={{
      background: '#ffffff',
      borderBottom: '1px solid #e8e8e8',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '0 16px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '64px',
        gap: '16px'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <Title level={3} style={{ margin: 0, color: '#1890ff', fontSize: '18px' }}>
            <BookOutlined /> KotBD
          </Title>
        </div>
        
        {/* Navigation Menu */}
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
          <Menu
            mode="horizontal"
            selectedKeys={[currentPage]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ 
              border: 'none', 
              background: 'transparent',
              flex: 'none'
            }}
            overflowedIndicator={null}
          />
        </div>
        
        {/* Auth Section */}
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <Space size="small">
            {isAuthenticated && currentUser ? (
              <>
                <span style={{ color: '#666', fontSize: '12px', whiteSpace: 'nowrap' }}>
                  {currentUser.username}
                </span>
                <Button
                  type="default"
                  icon={<LogoutOutlined />}
                  onClick={onLogout}
                  size="small"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                type="primary"
                icon={<UserOutlined />}
                onClick={() => onNavigate('login')}
                size="small"
              >
                Login
              </Button>
            )}
          </Space>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
