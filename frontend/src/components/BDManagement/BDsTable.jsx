import React from 'react';
import { Table, Button, Space, Popconfirm, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const BDsTable = ({
  bds,
  loading,
  pagination,
  onEdit,
  onDelete,
  onTableChange,
  bdColumns
}) => {
  return (
    <Table
      columns={bdColumns}
      dataSource={bds}
      rowKey="bid"
      loading={loading}
      pagination={{
        ...pagination,
        showSizeChanger: false,
        showQuickJumper: true,
        showTotal: (total, range) => 
          `${range[0]}-${range[1]} sur ${total} BDs`,
      }}
      onChange={onTableChange}
      scroll={{ x: 1200 }}
      size="small"
      tableLayout="auto"
    />
  );
};

export default BDsTable;
