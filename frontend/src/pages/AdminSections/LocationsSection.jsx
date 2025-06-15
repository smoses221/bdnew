import React from 'react';
import { Typography, Card } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const LocationsSection = () => (
  <Card>
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <CalendarOutlined style={{ fontSize: '64px', color: '#fa8c16', marginBottom: '16px' }} />
      <Title level={3}>Gestion des Locations</Title>
      <Text type="secondary">
        Cette section permettra de gérer les prêts :<br/>
        enregistrer les prêts, gérer les retours, suivre les retards, etc.
      </Text>
    </div>
  </Card>
);

export default LocationsSection;