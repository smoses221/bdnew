import React, { useState, useContext, useEffect } from 'react';
import { Modal, Tag, Form, Popconfirm, Button } from 'antd';
import { UserContext } from '../../context/UserContext';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

// Components
import MembersList from '../../components/MemberManagement/MembersList';
import NewMemberModal from '../../components/MemberManagement/NewMemberModal';
import MemberDetails from '../../components/MemberManagement/MemberDetails';
import MemberRentalHistoryTable from '../../components/MemberManagement/MemberRentalHistoryTable';

// Custom hook
import { useMemberManagement } from '../../hooks/useMemberManagement';

const AbonnementsSection = () => {
  const { currentUser } = useContext(UserContext);
  
  // Local state management
  const [selectedMember, setSelectedMember] = useState(null);
  const [isNewMemberModalVisible, setIsNewMemberModalVisible] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [members, setMembers] = useState([]);
  const [memberDetails, setMemberDetails] = useState(null);
  const [memberRentals, setMemberRentals] = useState([]);
  const [memberRentalHistory, setMemberRentalHistory] = useState([]);
  const [availableBDs, setAvailableBDs] = useState([]);
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [bdSearchTerm, setBdSearchTerm] = useState('');
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
  const [historyPagination, setHistoryPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [editForm] = Form.useForm();
  
  // Use the custom hook for API functions
  const {
    loading,
    fetchMembers: fetchMembersAPI,
    fetchMemberDetails: fetchMemberDetailsAPI,
    fetchMemberRentals: fetchMemberRentalsAPI,
    fetchMemberRentalHistory: fetchMemberRentalHistoryAPI,
    fetchAvailableBDs: fetchAvailableBDsAPI,
    createMember,
    updateMember,
    returnBook: returnBookAPI,
    rentBook: rentBookAPI,
  } = useMemberManagement();

  // Fetch members wrapper
  const fetchMembers = async (page = 1, search = '') => {
    const result = await fetchMembersAPI(page, pagination.pageSize, search);
    if (result) {
      setMembers(result.members);
      setPagination(prev => ({
        ...prev,
        current: page,
        total: result.total,
      }));
    }
  };

  // Fetch member details wrapper
  const fetchMemberDetails = async (memberId) => {
    const result = await fetchMemberDetailsAPI(memberId);
    if (result) {
      setMemberDetails(result);
      return result;
    }
    return null;
  };

  // Fetch member rentals wrapper
  const fetchMemberRentals = async (memberId) => {
    const result = await fetchMemberRentalsAPI(memberId);
    setMemberRentals(result);
    return result;
  };

  // Fetch member rental history wrapper
  const fetchMemberRentalHistory = async (memberId, page = 1) => {
    const result = await fetchMemberRentalHistoryAPI(memberId, page, historyPagination.pageSize);
    if (result) {
      setMemberRentalHistory(result.rentals || []);
      setHistoryPagination(prev => ({
        ...prev,
        current: page,
        total: result.total || 0,
      }));
    }
    return result;
  };

  // Fetch available BDs wrapper
  const fetchAvailableBDs = async (page = 1, search = '') => {
    const result = await fetchAvailableBDsAPI(page, bdPagination.pageSize, search);
    if (result) {
      setAvailableBDs(result.bds);
      setBdPagination(prev => ({
        ...prev,
        current: page,
        total: result.total,
      }));
    }
  };

  // Load members on component mount
  useEffect(() => {
    fetchMembers();
  }, []);

  // Update edit form when member details change
  useEffect(() => {
    if (memberDetails) {
      editForm.setFieldsValue(memberDetails);
    }
  }, [memberDetails, editForm]);

  // Inject CSS for rented rows
  useEffect(() => {
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

  // Handle member selection
  const handleMemberSelect = (record) => {
    const confirmNavigation = async () => {
      setSelectedMember(record.mid);
      await fetchMemberDetails(record.mid);
      await fetchMemberRentals(record.mid);
      await fetchMemberRentalHistory(record.mid);
      await fetchAvailableBDs(1, bdSearchTerm);
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

  // Handle member search
  const handleMemberSearch = (searchTerm) => {
    setMemberSearchTerm(searchTerm);
    fetchMembers(1, searchTerm);
  };

  // Handle new member creation
  const handleCreateMember = async (values) => {
    const newMember = await createMember(values);
    if (newMember) {
      setIsNewMemberModalVisible(false);
      // Refresh members list
      await fetchMembers(1, memberSearchTerm);
      // Auto-select the new member
      handleMemberSelect(newMember);
      return true;
    }
    return false;
  };

  // Handle member save
  const handleSaveMember = async () => {
    try {
      const values = await editForm.validateFields();
      const updatedMember = await updateMember(memberDetails.mid, values);
      if (updatedMember) {
        setMemberDetails(updatedMember);
        setIsEditing(false);
        setHasUnsavedChanges(false);
        // Refresh members list
        await fetchMembers(pagination.current, memberSearchTerm);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Form validation failed:', error);
      return false;
    }
  };

  // Handle return book
  const handleReturnBook = async (rentalId) => {
    const success = await returnBookAPI(rentalId);
    if (success) {
      // Refresh data
      await fetchMemberRentals(selectedMember);
      await fetchMemberRentalHistory(selectedMember, historyPagination.current);
      await fetchMembers(pagination.current, memberSearchTerm);
      await fetchAvailableBDs(bdPagination.current, bdSearchTerm);
    }
  };

  // Handle rent book
  const handleRentBook = async (bdId) => {
    const success = await rentBookAPI(selectedMember, bdId);
    if (success) {
      // Refresh data
      await fetchMemberRentals(selectedMember);
      await fetchMemberRentalHistory(selectedMember, historyPagination.current);
      await fetchMembers(pagination.current, memberSearchTerm);
      await fetchAvailableBDs(bdPagination.current, bdSearchTerm);
    }
  };

  // Handle edit cancel
  const handleCancelEdit = () => {
    setIsEditing(false);
    setHasUnsavedChanges(false);
    if (memberDetails) {
      editForm.setFieldsValue(memberDetails);
    }
  };

  // Handle form changes
  const handleFormChange = () => {
    setHasUnsavedChanges(true);
  };

  // Handle pagination change for members
  const handleMemberPaginationChange = (paginationInfo) => {
    fetchMembers(paginationInfo.current, memberSearchTerm);
  };

  // Handle pagination change for BDs
  const handleBDPaginationChange = (paginationInfo) => {
    fetchAvailableBDs(paginationInfo.current, bdSearchTerm);
  };

  // Handle pagination change for rental history
  const handleHistoryPaginationChange = (paginationInfo) => {
    fetchMemberRentalHistory(selectedMember, paginationInfo.current);
  };

  // Handle BD search
  const handleBDSearch = (searchTerm) => {
    setBdSearchTerm(searchTerm);
    fetchAvailableBDs(1, searchTerm);
  };

  // Define member columns for the table
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

  // Define rental columns
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
          onConfirm={() => handleReturnBook(record.lid)}
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

  // Define BD columns
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
            onConfirm={() => handleRentBook(record.bid)}
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

  // Define rental history columns
  const historyColumns = [
    {
      title: 'Cote',
      dataIndex: ['bd_info', 'cote'],
      key: 'cote',
      width: 100,
    },
    {
      title: 'Série',
      dataIndex: ['bd_info', 'titreserie'],
      key: 'titreserie',
      ellipsis: true,
    },
    {
      title: 'Album',
      dataIndex: ['bd_info', 'titrealbum'],
      key: 'titrealbum',
      ellipsis: true,
    },
    {
      title: 'Tome',
      dataIndex: ['bd_info', 'numtome'],
      key: 'numtome',
      width: 60,
      align: 'center',
    },
    {
      title: 'Date de location',
      dataIndex: 'date_location',
      key: 'date_location',
      width: 120,
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
    },
    {
      title: 'Date de retour',
      dataIndex: 'date_retour',
      key: 'date_retour',
      width: 120,
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
    },
    {
      title: 'Statut',
      key: 'status',
      width: 80,
      render: (_, record) => (
        <Tag color={record.date_retour ? 'green' : 'orange'}>
          {record.date_retour ? 'Retourné' : 'En cours'}
        </Tag>
      ),
    },
  ];

  if (!selectedMember) {
    // Show members list
    return (
      <>
        <MembersList
          members={members}
          loading={loading}
          memberSearchTerm={memberSearchTerm}
          setMemberSearchTerm={setMemberSearchTerm}
          pagination={pagination}
          onMemberSelect={handleMemberSelect}
          onSearchMembers={handleMemberSearch}
          onPaginationChange={handleMemberPaginationChange}
          onNewMemberClick={() => setIsNewMemberModalVisible(true)}
          memberColumns={memberColumns}
        />

        <NewMemberModal
          visible={isNewMemberModalVisible}
          onOk={handleCreateMember}
          onCancel={() => setIsNewMemberModalVisible(false)}
          loading={loading}
        />
      </>
    );
  }

  // Show member details
  return (
    <MemberDetails
      memberDetails={memberDetails}
      isEditing={isEditing}
      setIsEditing={setIsEditing}
      editForm={editForm}
      hasUnsavedChanges={hasUnsavedChanges}
      setHasUnsavedChanges={setHasUnsavedChanges}
      memberRentals={memberRentals}
      memberRentalHistory={memberRentalHistory}
      availableBDs={availableBDs}
      bdSearchTerm={bdSearchTerm}
      setBdSearchTerm={setBdSearchTerm}
      bdPagination={bdPagination}
      historyPagination={historyPagination}
      rentalColumns={rentalColumns}
      historyColumns={historyColumns}
      bdColumns={bdColumns}
      onBackToList={handleBackToList}
      onSaveMember={handleSaveMember}
      onCancelEdit={handleCancelEdit}
      onFormChange={handleFormChange}
      onSearchBDs={handleBDSearch}
      onBDPaginationChange={handleBDPaginationChange}
      onHistoryPaginationChange={handleHistoryPaginationChange}
    />
  );
};

export default AbonnementsSection;