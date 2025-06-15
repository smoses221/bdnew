import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layout, 
  Typography, 
  Button, 
  Card, 
  Space,
  Divider,
  Alert,
  Tag,
  Breadcrumb
} from 'antd';
import { 
  HomeOutlined,
  TeamOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  LogoutOutlined,
  BookOutlined,
  UserOutlined,
  CalendarOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { UserContext } from '../context/UserContext';
import '../styles/pages/AdminPage.css';
import BDsSection from './AdminSections/BDsSection';
import AbonnementsSection from './AdminSections/AbonnementsSection';
import LocationsSection from './AdminSections/LocationsSection';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const AdminPage = () => {
  const { currentUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('bds');

  // Control panel section buttons
  const sectionButtons = [
    {
      key: 'bds',
      icon: <BookOutlined />,
      label: 'BDs',
      description: 'Gérer la collection de bandes dessinées',
      color: '#1890ff'
    },
    {
      key: 'abonnements',
      icon: <UserOutlined />,
      label: 'Abonnements',
      description: 'Gérer les membres et abonnements',
      color: '#52c41a'
    },
    {
      key: 'locations',
      icon: <CalendarOutlined />,
      label: 'Locations',
      description: 'Gérer les prêts et retours',
      color: '#fa8c16'
    }
  ];

  const handleSectionChange = (sectionKey) => {
    setActiveSection(sectionKey);
  };
  
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'bds':
        return <BDsSection />;
      case 'abonnements':
        return <AbonnementsSection />;
      case 'locations':
        return <LocationsSection />;
      default:
        return null;
    }
  };
  // const renderSectionContent = () => {
  //   switch (activeSection) {
  //     case 'bds':
  //       return (
  //         <Card>
  //           <div style={{ textAlign: 'center', padding: '60px 20px' }}>
  //             <BookOutlined style={{ fontSize: '64px', color: '#1890ff', marginBottom: '16px' }} />
  //             <Title level={3}>Gestion des BDs</Title>
  //             <Text type="secondary">
  //               Cette section permettra de gérer la collection de bandes dessinées :<br/>
  //               ajouter, modifier, supprimer des BD, gérer les cotes, etc.
  //             </Text>
  //           </div>
  //         </Card>
  //       );
  //     case 'abonnements':
  //       return (
  //         <Card>
  //           <div style={{ textAlign: 'center', padding: '60px 20px' }}>
  //             <UserOutlined style={{ fontSize: '64px', color: '#52c41a', marginBottom: '16px' }} />
  //             <Title level={3}>Gestion des Abonnements</Title>
  //             <Text type="secondary">
  //               Cette section permettra de gérer les membres :<br/>
  //               ajouter des membres, gérer les abonnements, les cautions, etc.
  //             </Text>
  //           </div>
  //         </Card>
  //       );
  //     case 'locations':
  //       return (
  //         <Card>
  //           <div style={{ textAlign: 'center', padding: '60px 20px' }}>
  //             <CalendarOutlined style={{ fontSize: '64px', color: '#fa8c16', marginBottom: '16px' }} />
  //             <Title level={3}>Gestion des Locations</Title>
  //             <Text type="secondary">
  //               Cette section permettra de gérer les prêts :<br/>
  //               enregistrer les prêts, gérer les retours, suivre les retards, etc.
  //             </Text>
  //           </div>
  //         </Card>
  //       );
  //     default:
  //       return null;
  //   }
  // };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px', background: '#f5f5f5' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Breadcrumb */}
          <Breadcrumb style={{ marginBottom: '24px' }}>
            <Breadcrumb.Item>
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <SettingOutlined />
              <span>Administration</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {sectionButtons.find(btn => btn.key === activeSection)?.label}
            </Breadcrumb.Item>
          </Breadcrumb>

          {/* Admin Panel Header */}
          <Card style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Title level={2} style={{ margin: '0 0 8px 0', color: '#1890ff' }}>
                  <SettingOutlined /> Panneau d'Administration
                </Title>
                <Text type="secondary">
                  Bienvenue, {currentUser?.username}. Gérez votre BDthèque depuis ce panneau de contrôle.
                </Text>
              </div>
              <Button 
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/bdteque')}
                size="large"
              >
                Retour à la BDtèque
              </Button>
            </div>
          </Card>

          {/* User Info Alert */}
          <Alert
            message="Accès Administrateur"
            description={`Connecté en tant que ${currentUser?.username} (${currentUser?.email}) - Droits administrateur activés`}
            type="success"
            showIcon
            closable
            style={{ marginBottom: '24px' }}
          />

          {/* Section Selection Buttons */}
          <Card title="Sections de Gestion" style={{ marginBottom: '24px' }}>
            <Space size="large" wrap>
              {sectionButtons.map((section) => (
                <Card
                  key={section.key}
                  hoverable
                  style={{ 
                    width: 280,
                    cursor: 'pointer',
                    border: activeSection === section.key ? `2px solid ${section.color}` : '1px solid #d9d9d9',
                    backgroundColor: activeSection === section.key ? `${section.color}10` : '#ffffff'
                  }}
                  onClick={() => handleSectionChange(section.key)}
                  bodyStyle={{ textAlign: 'center', padding: '24px' }}
                >
                  <div style={{ marginBottom: '12px' }}>
                    {React.cloneElement(section.icon, { 
                      style: { 
                        fontSize: '32px', 
                        color: section.color 
                      } 
                    })}
                  </div>
                  <Title level={4} style={{ margin: '0 0 8px 0' }}>
                    {section.label}
                    {activeSection === section.key && (
                      <Tag color={section.color} style={{ marginLeft: '8px' }}>
                        Actif
                      </Tag>
                    )}
                  </Title>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {section.description}
                  </Text>
                </Card>
              ))}
            </Space>
          </Card>

          {/* Section Content */}
          <div style={{ minHeight: '400px' }}>
            {renderSectionContent()}
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default AdminPage;
