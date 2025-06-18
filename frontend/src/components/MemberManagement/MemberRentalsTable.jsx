import React from 'react';
import { Card, Table } from 'antd';
import { BookOutlined } from '@ant-design/icons';

const MemberRentalsTable = ({
  memberRentals,
  rentalColumns
}) => {
  return (
    <Card 
      title={
        <span>
          <BookOutlined style={{ marginRight: 8 }} />
          Livres actuellement loués
        </span>
      }
      style={{ marginBottom: 24 }}
    >
      <Table
        columns={rentalColumns}
        dataSource={memberRentals}
        rowKey="lid"
        pagination={false}
        locale={{
          emptyText: 'Aucun livre actuellement loué'
        }}
      />
    </Card>
  );
};

export default MemberRentalsTable;
