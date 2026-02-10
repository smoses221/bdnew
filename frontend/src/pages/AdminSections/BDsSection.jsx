import React from 'react';
import { Typography, Card } from 'antd';
import { BookOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
// This section is for managing the collection of comic books (BDs).
// It allows adding, modifying, deleting BDs.
const BDsSection = () => (
  <Card>
      <div style={{ marginBottom: 16 }}>
        <Title level={3}>
          <BookOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          Gestion des BDs
        </Title>
        <Text type="secondary">
          Cette section permettra de gérer la collection de bandes dessinées :<br/>
          ajouter, modifier, supprimer des BD, gérer les cotes, etc.
        </Text>
      </div>
  </Card>
);

export default BDsSection;