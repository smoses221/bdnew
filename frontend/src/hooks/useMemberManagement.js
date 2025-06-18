import { useState } from 'react';
import { message } from 'antd';

const API_BASE_URL = 'http://localhost:8000';

export const useMemberManagement = () => {
  const [loading, setLoading] = useState(false);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'application/json',
  });

  // Fetch members with rental count
  const fetchMembers = async (page = 1, pageSize = 50, search = '') => {
    setLoading(true);
    try {
      const skip = (page - 1) * pageSize;
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      
      const [membersResponse, countResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/membres/?skip=${skip}&limit=${pageSize}${searchParam}`, {
          headers: getAuthHeaders(),
        }),
        fetch(`${API_BASE_URL}/admin/membres/count?${searchParam.substring(1)}`, {
          headers: getAuthHeaders(),
        })
      ]);

      if (membersResponse.ok && countResponse.ok) {
        const membersData = await membersResponse.json();
        const countData = await countResponse.json();
        return {
          members: membersData,
          total: countData.total
        };
      } else {
        message.error('Erreur lors du chargement des membres');
        return null;
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      message.error('Erreur de connexion');
      return null;
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
        return memberData;
      } else {
        message.error('Erreur lors du chargement des détails du membre');
        return null;
      }
    } catch (error) {
      console.error('Error fetching member details:', error);
      message.error('Erreur de connexion');
      return null;
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
        return rentalsData;
      } else {
        message.error('Erreur lors du chargement des locations');
        return [];
      }
    } catch (error) {
      console.error('Error fetching member rentals:', error);
      message.error('Erreur de connexion');
      return [];
    }
  };

  // Fetch member rental history
  const fetchMemberRentalHistory = async (memberId, page = 1, pageSize = 10) => {
    try {
      const skip = (page - 1) * pageSize;
      const response = await fetch(`${API_BASE_URL}/admin/membres/${memberId}/rental-history?skip=${skip}&limit=${pageSize}`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const historyData = await response.json();
        return historyData;
      } else {
        message.error('Erreur lors du chargement de l\'historique des locations');
        return { rentals: [], total: 0 };
      }
    } catch (error) {
      console.error('Error fetching member rental history:', error);
      message.error('Erreur de connexion');
      return { rentals: [], total: 0 };
    }
  };

  // Fetch available BDs
  const fetchAvailableBDs = async (page = 1, pageSize = 25, search = '') => {
    try {
      const skip = (page - 1) * pageSize;
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      
      const [bdsResponse, countResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/bds/?skip=${skip}&limit=${pageSize}${searchParam}`, {
          headers: getAuthHeaders(),
        }),
        fetch(`${API_BASE_URL}/bds/count?${searchParam.substring(1)}`, {
          headers: getAuthHeaders(),
        })
      ]);

      if (bdsResponse.ok && countResponse.ok) {
        const bdsData = await bdsResponse.json();
        const countData = await countResponse.json();
        return {
          bds: bdsData,
          total: countData.total
        };
      } else {
        message.error('Erreur lors du chargement des BDs');
        return null;
      }
    } catch (error) {
      console.error('Error fetching BDs:', error);
      message.error('Erreur de connexion');
      return null;
    }
  };

  // Create new member
  const createMember = async (memberData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/membres/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(memberData),
      });

      if (response.ok) {
        const newMember = await response.json();
        message.success('Membre créé avec succès!');
        return newMember;
      } else {
        const errorData = await response.json();
        message.error(errorData.detail || 'Erreur lors de la création du membre');
        return null;
      }
    } catch (error) {
      console.error('Error creating member:', error);
      message.error('Erreur de connexion');
      return null;
    }
  };

  // Save member changes
  const updateMember = async (memberId, memberData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/membres/${memberId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(memberData),
      });

      if (response.ok) {
        const updatedMember = await response.json();
        message.success('Membre mis à jour avec succès');
        return updatedMember;
      } else {
        const errorData = await response.json();
        message.error(errorData.detail || 'Erreur lors de la mise à jour');
        return null;
      }
    } catch (error) {
      console.error('Error updating member:', error);
      message.error('Erreur de connexion');
      return null;
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
        return true;
      } else {
        message.error('Erreur lors du retour du livre');
        return false;
      }
    } catch (error) {
      console.error('Error returning book:', error);
      message.error('Erreur de connexion');
      return false;
    }
  };

  // Rent book to member
  const rentBook = async (memberId, bdId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/membres/${memberId}/rent/${bdId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        message.success('Livre loué avec succès');
        return true;
      } else {
        const error = await response.json();
        message.error(error.detail || 'Erreur lors de la location du livre');
        return false;
      }
    } catch (error) {
      console.error('Error renting book:', error);
      message.error('Erreur de connexion');
      return false;
    }
  };

  return {
    loading,
    fetchMembers,
    fetchMemberDetails,
    fetchMemberRentals,
    fetchMemberRentalHistory,
    fetchAvailableBDs,
    createMember,
    updateMember,
    returnBook,
    rentBook,
  };
};
