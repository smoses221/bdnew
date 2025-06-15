import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Card, Button, Space } from 'antd';
import { ArrowLeftOutlined, TeamOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const NosActisPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      padding: '40px 20px', 
      maxWidth: '800px', 
      margin: '0 auto',
      background: '#ffffff'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <Button 
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/bdteque')}
          style={{ marginBottom: '20px' }}
        >
          Retour à la BDtèque
        </Button>
      </div>
      
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <Title level={1} style={{ color: '#1890ff', marginBottom: '8px' }}>
              <TeamOutlined /> Nos Actis
            </Title>
            <Paragraph style={{ fontSize: '16px', lineHeight: '1.8' }}>
              Cette section sera bientôt disponible ! Ici vous pourrez découvrir toutes les activités 
              du KotBD et participer à nos événements.
            </Paragraph>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default NosActisPage;
