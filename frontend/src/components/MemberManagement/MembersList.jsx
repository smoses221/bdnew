import React from 'react';
import { Typography, Card, Table, Button, Input, Space } from 'antd';
import { UserOutlined, SearchOutlined, PlusOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Search } = Input;

const MembersList = ({
  members,
  loading,
  memberSearchTerm,
  setMemberSearchTerm,
  pagination,
  onMemberSelect,
  onSearchMembers,
  onPaginationChange,
  onTableChange,
  onNewMemberClick,
  memberColumns
}) => {
  return (
    <Card>
      <div style={{ marginBottom: 16 }}>
        <Title level={3}>
          <UserOutlined style={{ marginRight: 8, color: '#52c41a' }} />
          Gestion des Abonnements
        </Title>
        <Text type="secondary">
          Cliquez sur un membre pour voir ses détails et gérer ses locations
        </Text>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Search
          placeholder="Rechercher un membre..."
          value={memberSearchTerm}
          onChange={(e) => setMemberSearchTerm(e.target.value)}
          onSearch={onSearchMembers}
          style={{ width: 300 }}
          allowClear
        />
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={onNewMemberClick}
        >
          Nouveau Membre
        </Button>
      </div>

      <Table
        columns={memberColumns}
        dataSource={members}
        rowKey="mid"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: false,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} sur ${total} membres`,
        }}
        onRow={(record) => ({
          onClick: () => onMemberSelect(record),
          style: { cursor: 'pointer' },
        })}
        onChange={onTableChange || onPaginationChange}
      />
    </Card>
  );
};

export default MembersList;
