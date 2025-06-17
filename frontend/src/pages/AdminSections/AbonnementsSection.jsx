import React, { useState, useEffect, useContext } from 'react';
import { 
  Typography, 
  Card, 
  Table, 
  Button, 
  Input, 
  Form, 
  Space, 
  Popconfirm, 
  Modal, 
  message, 
  Spin, 
  Row, 
  Col, 
  Divider,
  Tag
} from 'antd';
import { 
  UserOutlined, 
  EditOutlined, 
  SaveOutlined, 
  UndoOutlined, 
  BookOutlined, 
  SearchOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { UserContext } from '../../context/UserContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Search } = Input;

const AbonnementsSection = () => {
  const { currentUser } = useContext(UserContext);
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [memberDetails, setMemberDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editForm] = Form.useForm();
  const [memberRentals, setMemberRentals] = useState([]);
  const [availableBDs, setAvailableBDs] = useState([]);
  const [bdSearchTerm, setBdSearchTerm] = useState('');
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 50,
    total: 0,
  });
  const [bdPagination, setBdPagination] = useState({
    current: 1,
    pageSize: 25,
    total: 0,
  });

  const API_BASE_URL = 'http://localhost:8000';

  // Inject CSS for rented rows
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .rented-row {
        background-color: #f5f5f5 !important;
        opacity: 0.6;
      }
      .rented-row:hover {
        background-color: #f0f0f0 !important;
      }
      .rented-row td {
        color: #999 !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'application/json',
  });

  // Fetch members with rental count
  const fetchMembers = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const skip = (page - 1) * pagination.pageSize;
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      
      const [membersResponse, countResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/membres/?skip=${skip}&limit=${pagination.pageSize}${searchParam}`, {
          headers: getAuthHeaders(),
        }),
        fetch(`${API_BASE_URL}/admin/membres/count?${searchParam.substring(1)}`, {
          headers: getAuthHeaders(),
        })
      ]);

      if (membersResponse.ok && countResponse.ok) {
        const membersData = await membersResponse.json();
        const countData = await countResponse.json();
        
        setMembers(membersData);
        setPagination(prev => ({
          ...prev,
          current: page,
          total: countData.total,
        }));
      } else {
        message.error('Erreur lors du chargement des membres');
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      message.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // Fetch member details
  const fetchMemberDetails = async (memberId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/membres/${memberId}`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const memberData = await response.json();
        setMemberDetails(memberData);
        editForm.setFieldsValue({
          ...memberData,
        });
      } else {
        message.error('Erreur lors du chargement des détails du membre');
      }
    } catch (error) {
      console.error('Error fetching member details:', error);
      message.error('Erreur de connexion');
    }
  };

  // Fetch member rentals
  const fetchMemberRentals = async (memberId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/membres/${memberId}/rentals`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const rentalsData = await response.json();
        setMemberRentals(rentalsData);
      } else {
        message.error('Erreur lors du chargement des locations');
      }
    } catch (error) {
      console.error('Error fetching member rentals:', error);
      message.error('Erreur de connexion');
    }
  };

  // Fetch available BDs
  const fetchAvailableBDs = async (page = 1, search = '') => {
    try {
      const skip = (page - 1) * bdPagination.pageSize;
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      
      const [bdsResponse, countResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/bds/?skip=${skip}&limit=${bdPagination.pageSize}${searchParam}`, {
          headers: getAuthHeaders(),
        }),
        fetch(`${API_BASE_URL}/bds/count?${searchParam.substring(1)}`, {
          headers: getAuthHeaders(),
        })
      ]);

      if (bdsResponse.ok && countResponse.ok) {
        const bdsData = await bdsResponse.json();
        const countData = await countResponse.json();
        
        setAvailableBDs(bdsData);
        setBdPagination(prev => ({
          ...prev,
          current: page,
          total: countData.total,
        }));
      } else {
        message.error('Erreur lors du chargement des BDs');
      }
    } catch (error) {
      console.error('Error fetching BDs:', error);
      message.error('Erreur de connexion');
    }
  };

  // Save member changes
  const saveMemberChanges = async () => {
    try {
      const values = await editForm.validateFields();

      const response = await fetch(`${API_BASE_URL}/admin/membres/${memberDetails.mid}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const updatedMember = await response.json();
        setMemberDetails(updatedMember);
        setIsEditing(false);
        setHasUnsavedChanges(false);
        message.success('Membre mis à jour avec succès');
        
        // Refresh members list
        fetchMembers(pagination.current, memberSearchTerm);
      } else {
        message.error('Erreur lors de la mise à jour du membre');
      }
    } catch (error) {
      console.error('Error saving member:', error);
      message.error('Erreur de validation ou de connexion');
    }
  };

  // Return book
  const returnBook = async (rentalId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/rentals/${rentalId}/return`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        message.success('Livre retourné avec succès');
        fetchMemberRentals(selectedMember);
        fetchMembers(pagination.current, memberSearchTerm);
      } else {
        message.error('Erreur lors du retour du livre');
      }
    } catch (error) {
      console.error('Error returning book:', error);
      message.error('Erreur de connexion');
    }
  };

  // Rent book to member
  const rentBookToMember = async (bdId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/membres/${selectedMember}/rent/${bdId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        message.success('Livre loué avec succès');
        fetchMemberRentals(selectedMember);
        fetchMembers(pagination.current, memberSearchTerm);
      } else {
        const error = await response.json();
        message.error(error.detail || 'Erreur lors de la location du livre');
      }
    } catch (error) {
      console.error('Error renting book:', error);
      message.error('Erreur de connexion');
    }
  };

  // Handle member selection
  const handleMemberSelect = (record) => {
    const confirmNavigation = () => {
      setSelectedMember(record.mid);
      fetchMemberDetails(record.mid);
      fetchMemberRentals(record.mid);
      fetchAvailableBDs(1, bdSearchTerm);
      setIsEditing(false);
      setHasUnsavedChanges(false);
    };

    if (hasUnsavedChanges) {
      Modal.confirm({
        title: 'Modifications non sauvegardées',
        content: 'Vous avez des modifications non sauvegardées. Voulez-vous continuer?',
        onOk: confirmNavigation,
      });
    } else {
      confirmNavigation();
    }
  };

  // Handle back to list
  const handleBackToList = () => {
    const confirmNavigation = () => {
      setSelectedMember(null);
      setMemberDetails(null);
      setMemberRentals([]);
      setAvailableBDs([]);
      setIsEditing(false);
      setHasUnsavedChanges(false);
    };

    if (hasUnsavedChanges) {
      Modal.confirm({
        title: 'Modifications non sauvegardées',
        content: 'Vous avez des modifications non sauvegardées. Voulez-vous continuer?',
        onOk: confirmNavigation,
      });
    } else {
      confirmNavigation();
    }
  };

  // Handle form changes
  const handleFormChange = () => {
    setHasUnsavedChanges(true);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Members table columns
  const memberColumns = [
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      render: (text, record) => `${record.nom} ${record.prenom}`,
    },
    {
      title: 'Groupe',
      dataIndex: 'groupe',
      key: 'groupe',
      render: (groupe) => groupe ? <Tag color="blue">{groupe}</Tag> : '-',
    },
    {
      title: 'BDs louées',
      dataIndex: 'active_rentals',
      key: 'active_rentals',
      render: (count) => (
        <Tag color={count > 0 ? 'orange' : 'green'}>
          {count} BD{count > 1 ? 's' : ''}
        </Tag>
      ),
    },
  ];

  // Rental columns
  const rentalColumns = [
    {
      title: 'Cote',
      dataIndex: ['bd_info', 'cote'],
      key: 'cote',
    },
    {
      title: 'Série',
      dataIndex: ['bd_info', 'titreserie'],
      key: 'titreserie',
    },
    {
      title: 'Album',
      dataIndex: ['bd_info', 'titrealbum'],
      key: 'titrealbum',
    },
    {
      title: 'Tome',
      dataIndex: ['bd_info', 'numtome'],
      key: 'numtome',
    },
    {
      title: 'Date de location',
      dataIndex: 'date',
      key: 'date',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="Confirmer le retour"
          description="Êtes-vous sûr de vouloir marquer ce livre comme retourné?"
          onConfirm={() => returnBook(record.lid)}
          okText="Oui"
          cancelText="Non"
        >
          <Button type="primary" size="small">
            Retourner
          </Button>
        </Popconfirm>
      ),
    },
  ];

  // Available BDs columns
  const bdColumns = [
    {
      title: 'Cote',
      dataIndex: 'cote',
      key: 'cote',
    },
    {
      title: 'Série',
      dataIndex: 'titreserie',
      key: 'titreserie',
    },
    {
      title: 'Album',
      dataIndex: 'titrealbum',
      key: 'titrealbum',
    },
    {
      title: 'Tome',
      dataIndex: 'numtome',
      key: 'numtome',
    },
    {
      title: 'Scénariste',
      dataIndex: 'scenariste',
      key: 'scenariste',
    },
    {
      title: 'Dessinateur',
      dataIndex: 'dessinateur',
      key: 'dessinateur',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => {
        if (record.is_rented) {
          return (
            <span style={{ color: '#999', fontStyle: 'italic' }}>
              Déjà loué {record.rented_by ? `par ${record.rented_by}` : ''}
            </span>
          );
        }
        
        return (
          <Popconfirm
            title="Louer ce livre"
            description={`Louer "${record.titreserie}" à ${memberDetails?.nom} ${memberDetails?.prenom}?`}
            onConfirm={() => rentBookToMember(record.bid)}
            okText="Oui"
            cancelText="Non"
          >
            <Button type="primary" size="small" icon={<PlusOutlined />}>
              Louer
            </Button>
          </Popconfirm>
        );
      },
    },
  ];

  if (!selectedMember) {
    // Show members list
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

        <div style={{ marginBottom: 16 }}>
          <Search
            placeholder="Rechercher un membre..."
            value={memberSearchTerm}
            onChange={(e) => setMemberSearchTerm(e.target.value)}
            onSearch={(value) => fetchMembers(1, value)}
            style={{ width: 300 }}
            allowClear
          />
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
            onClick: () => handleMemberSelect(record),
            style: { cursor: 'pointer' },
          })}
          onChange={(paginationInfo) => {
            fetchMembers(paginationInfo.current, memberSearchTerm);
          }}
        />
      </Card>
    );
  }

  // Show member details
  return (
    <div>
      <Button 
        onClick={handleBackToList}
        style={{ marginBottom: 16 }}
        icon={<UndoOutlined />}
      >
        Retour à la liste
      </Button>

      {/* Member Information Card */}
      <Card 
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Informations du membre</span>
            <Space>
              {!isEditing && (
                <Button 
                  type="primary" 
                  icon={<EditOutlined />}
                  onClick={() => setIsEditing(true)}
                >
                  Modifier
                </Button>
              )}
              {isEditing && (
                <>
                  <Button 
                    type="primary" 
                    icon={<SaveOutlined />}
                    onClick={saveMemberChanges}
                  >
                    Sauvegarder
                  </Button>
                  <Button 
                    onClick={() => {
                      setIsEditing(false);
                      setHasUnsavedChanges(false);
                      editForm.setFieldsValue({
                        ...memberDetails,
                      });
                    }}
                  >
                    Annuler
                  </Button>
                </>
              )}
            </Space>
          </div>
        }
        style={{ marginBottom: 24 }}
      >
        {memberDetails && (
          <Form
            form={editForm}
            layout="vertical"
            disabled={!isEditing}
            onValuesChange={handleFormChange}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Nom" name="nom" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Prénom" name="prenom" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Groupe" name="groupe">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="GSM" name="gsm" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Email" name="mail">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Rue" name="rue" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="Numéro" name="numero" rules={[{ required: true }]}>
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="Boîte" name="boite">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="Code postal" name="codepostal" rules={[{ required: true }]}>
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="Ville" name="ville" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Caution" name="caution" rules={[{ required: true }]}>
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Remarques" name="remarque">
                  <Input.TextArea rows={3} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </Card>

      {/* Current Rentals */}
      <Card 
        title={
          <span>
            <BookOutlined style={{ marginRight: 8 }} />
            Livres actuellement loués ({memberRentals.length})
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

      {/* Available BDs for Rental */}
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
            onSearch={(value) => fetchAvailableBDs(1, value)}
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
          onChange={(paginationInfo) => {
            fetchAvailableBDs(paginationInfo.current, bdSearchTerm);
          }}
        />
      </Card>
    </div>
  );
};

export default AbonnementsSection;