import React from 'react';
import { Card, Table, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Search } = Input;

const AvailableBDsTable = ({
  availableBDs,
  bdColumns,
  bdSearchTerm,
  setBdSearchTerm,
  bdPagination,
  onSearchBDs,
  onPaginationChange
}) => {
  return (
    <Card 
      title={
        <span>
          <SearchOutlined style={{ marginRight: 8 }} />
          Louer un nouveau livre
        </span>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <Search
          placeholder="Rechercher une BD..."
          value={bdSearchTerm}
          onChange={(e) => setBdSearchTerm(e.target.value)}
          onSearch={onSearchBDs}
          style={{ width: 400 }}
          allowClear
        />
      </div>

      <Table
        columns={bdColumns}
        dataSource={availableBDs}
        rowKey="bid"
        rowClassName={(record) => record.is_rented ? 'rented-row' : ''}
        pagination={{
          ...bdPagination,
          showSizeChanger: false,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} sur ${total} BDs`,
        }}
        onChange={onPaginationChange}
      />
    </Card>
  );
};

export default AvailableBDsTable;
