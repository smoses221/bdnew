import React from 'react';
import { Typography, Card } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const AbonnementsSection = () => (
  <Card>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <UserOutlined style={{ fontSize: '64px', color: '#52c41a', marginBottom: '16px' }} />
          <Title level={3}>Gestion des Abonnements</Title>
          <Text type="secondary">
            Cette section permettra de gérer les membres :<br/>
            ajouter des membres, gérer les abonnements, les cautions, etc.
          </Text>
        </div>
      </Card>
);

export default AbonnementsSection;