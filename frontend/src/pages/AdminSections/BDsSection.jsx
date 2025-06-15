import React from 'react';
import { Typography, Card } from 'antd';
import { BookOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const BDsSection = () => (
  <Card>
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <BookOutlined style={{ fontSize: '64px', color: '#1890ff', marginBottom: '16px' }} />
      <Title level={3}>Gestion des BDs</Title>
      <Text type="secondary">
        Cette section permettra de gérer la collection de bandes dessinées :<br/>
        ajouter, modifier, supprimer des BD, gérer les cotes, etc.
      </Text>
    </div>
  </Card>
);

export default BDsSection;