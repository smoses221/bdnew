import React from 'react';
import { Card, Table } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';

const MemberRentalHistoryTable = ({
  rentalHistory,
  historyColumns,
  historyPagination,
  onHistoryPaginationChange,
  loading
}) => {
  return (
    <Card 
      title={
        <span>
          <HistoryOutlined style={{ marginRight: 8 }} />
          Historique des locations
        </span>
      }
      style={{ marginBottom: 24 }}
    >
      <Table
        columns={historyColumns}
        dataSource={rentalHistory}
        rowKey="lid"
        loading={loading}
        pagination={{
          ...historyPagination,
          showSizeChanger: false,
          showQuickJumper: false,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} sur ${total} locations`,
          size: 'small'
        }}
        onChange={onHistoryPaginationChange}
        size="small"
        locale={{
          emptyText: 'Aucun historique de location'
        }}
      />
    </Card>
  );
};

export default MemberRentalHistoryTable;
