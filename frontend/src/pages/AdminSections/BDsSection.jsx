import React, { useState, useEffect } from 'react';
import { Typography, Card, Button, Space, Input, Popconfirm, Tag } from 'antd';
import { BookOutlined, PlusOutlined, ScanOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import BDsTable from '../../components/BDManagement/BDsTable';
import BDFormModal from '../../components/BDManagement/BDFormModal';
import { useBDManagement } from '../../hooks/useBDManagement';

const { Title, Text } = Typography;
const { Search } = Input;

const BDsSection = () => {
  const [bds, setBDs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 50,
    total: 0,
  });
  const [sortInfo, setSortInfo] = useState({
    field: 'cote',
    order: 'asc'
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBD, setEditingBD] = useState(null);

  const {
    loading,
    fetchBDs: fetchBDsAPI,
    createBD,
    updateBD,
    deleteBD,
  } = useBDManagement();

  // Fetch BDs wrapper
  const fetchBDs = async (page = 1, search = '', sortField = sortInfo.field, sortOrder = sortInfo.order) => {
    const result = await fetchBDsAPI(page, pagination.pageSize, search, sortField, sortOrder);
    if (result) {
      setBDs(result.bds);
      setPagination(prev => ({
        ...prev,
        current: page,
        total: result.total,
      }));
    }
  };

  // Load BDs on component mount
  useEffect(() => {
    fetchBDs();
  }, []);

  // Handle search
  const handleSearch = (searchTerm) => {
    setSearchTerm(searchTerm);
    fetchBDs(1, searchTerm, sortInfo.field, sortInfo.order);
  };

  // Handle table changes (pagination and sorting)
  const handleTableChange = (paginationInfo, filters, sorter) => {
    let sortField = sortInfo.field;
    let sortOrder = sortInfo.order;
    
    // Handle sorting
    if (sorter && sorter.field) {
      sortField = sorter.field;
      sortOrder = sorter.order === 'ascend' ? 'asc' : 'desc';
      setSortInfo({ field: sortField, order: sortOrder });
    }
    
    // Fetch with new parameters
    fetchBDs(paginationInfo.current, searchTerm, sortField, sortOrder);
  };

  // Handle create BD
  const handleCreateBD = async (bdData) => {
    const newBD = await createBD(bdData);
    if (newBD) {
      setIsModalVisible(false);
      await fetchBDs(pagination.current, searchTerm, sortInfo.field, sortInfo.order);
      return true;
    }
    return false;
  };

  // Handle edit BD
  const handleEditBD = (bd) => {
    setEditingBD(bd);
    setIsModalVisible(true);
  };

  // Handle update BD
  const handleUpdateBD = async (bdData) => {
    const updatedBD = await updateBD(editingBD.bid, bdData);
    if (updatedBD) {
      setIsModalVisible(false);
      setEditingBD(null);
      await fetchBDs(pagination.current, searchTerm, sortInfo.field, sortInfo.order);
      return true;
    }
    return false;
  };

  // Handle delete BD
  const handleDeleteBD = async (bdId) => {
    const success = await deleteBD(bdId);
    if (success) {
      await fetchBDs(pagination.current, searchTerm, sortInfo.field, sortInfo.order);
    }
  };

  // Handle modal cancel
  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingBD(null);
  };

  // Handle scan BDs (placeholder for future implementation)
  const handleScanBDs = () => {
    // Placeholder for scan functionality
    console.log('Scan BDs functionality to be implemented later');
  };

  // Define BD columns
  const bdColumns = [
    {
      title: 'Cote',
      dataIndex: 'cote',
      key: 'cote',
      width: 100,
      sorter: true,
      sortOrder: sortInfo.field === 'cote' ? (sortInfo.order === 'asc' ? 'ascend' : 'descend') : null,
      render: (text) => (
        <Tag color="blue" style={{ fontFamily: 'monospace', fontSize: '10px' }}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Série',
      dataIndex: 'titreserie',
      key: 'titreserie',
      width: 150,
      sorter: true,
      sortOrder: sortInfo.field === 'titreserie' ? (sortInfo.order === 'asc' ? 'ascend' : 'descend') : null,
      ellipsis: true,
    },
    {
      title: 'Album',
      dataIndex: 'titrealbum',
      key: 'titrealbum',
      width: 150,
      sorter: true,
      sortOrder: sortInfo.field === 'titrealbum' ? (sortInfo.order === 'asc' ? 'ascend' : 'descend') : null,
      ellipsis: true,
    },
    {
      title: 'Tome',
      dataIndex: 'numtome',
      key: 'numtome',
      width: 60,
      sorter: true,
      sortOrder: sortInfo.field === 'numtome' ? (sortInfo.order === 'asc' ? 'ascend' : 'descend') : null,
      align: 'center',
      render: (text) => text ? (
        <Tag color="red" style={{ fontSize: '9px' }}>{text}</Tag>
      ) : <Text type="secondary" style={{ fontSize: '10px' }}>-</Text>,
    },
    {
      title: 'Scénariste',
      dataIndex: 'scenariste',
      key: 'scenariste',
      width: 120,
      sorter: true,
      sortOrder: sortInfo.field === 'scenariste' ? (sortInfo.order === 'asc' ? 'ascend' : 'descend') : null,
      ellipsis: true,
    },
    {
      title: 'Dessinateur',
      dataIndex: 'dessinateur',
      key: 'dessinateur',
      width: 120,
      sorter: true,
      sortOrder: sortInfo.field === 'dessinateur' ? (sortInfo.order === 'asc' ? 'ascend' : 'descend') : null,
      ellipsis: true,
    },
    {
      title: 'Éditeur',
      dataIndex: 'editeur',
      key: 'editeur',
      width: 100,
      sorter: true,
      sortOrder: sortInfo.field === 'editeur' ? (sortInfo.order === 'asc' ? 'ascend' : 'descend') : null,
      ellipsis: true,
    },
    {
      title: 'Collection',
      dataIndex: 'collection',
      key: 'collection',
      width: 100,
      sorter: true,
      sortOrder: sortInfo.field === 'collection' ? (sortInfo.order === 'asc' ? 'ascend' : 'descend') : null,
      ellipsis: true,
    },
    {
      title: 'Genre',
      dataIndex: 'genre',
      key: 'genre',
      width: 100,
      sorter: true,
      sortOrder: sortInfo.field === 'genre' ? (sortInfo.order === 'asc' ? 'ascend' : 'descend') : null,
      ellipsis: true,
      render: (text) => text ? (
        <Tag color="green" style={{ fontSize: '9px' }}>{text}</Tag>
      ) : <Text type="secondary" style={{ fontSize: '10px' }}>-</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditBD(record)}
          >
            Modifier
          </Button>
          <Popconfirm
            title="Supprimer cette BD"
            description="Êtes-vous sûr de vouloir supprimer cette BD ?"
            onConfirm={() => handleDeleteBD(record.bid)}
            okText="Oui"
            cancelText="Non"
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              Supprimer
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 16 }}>
        <Title level={3}>
          <BookOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          Gestion des BDs
        </Title>
        <Text type="secondary">
          Gérez votre collection de bandes dessinées
        </Text>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Search
          placeholder="Rechercher une BD..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onSearch={handleSearch}
          style={{ width: 400 }}
          allowClear
        />
        <Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            Ajouter une BD
          </Button>
          <Button 
            icon={<ScanOutlined />}
            onClick={handleScanBDs}
          >
            Scanner nouvelles BDs
          </Button>
        </Space>
      </div>

      <BDsTable
        bds={bds}
        loading={loading}
        pagination={pagination}
        onEdit={handleEditBD}
        onDelete={handleDeleteBD}
        onTableChange={handleTableChange}
        bdColumns={bdColumns}
      />

      <BDFormModal
        visible={isModalVisible}
        onOk={editingBD ? handleUpdateBD : handleCreateBD}
        onCancel={handleModalCancel}
        loading={loading}
        editingBD={editingBD}
        title={editingBD ? 'Modifier la BD' : 'Ajouter une BD'}
      />
    </Card>
  );
};

export default BDsSection;