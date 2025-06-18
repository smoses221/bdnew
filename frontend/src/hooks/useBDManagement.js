import { useState } from 'react';
import { message } from 'antd';

const API_BASE_URL = 'http://localhost:8000';

export const useBDManagement = () => {
  const [loading, setLoading] = useState(false);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'application/json',
  });

  // Fetch BDs with pagination, search, and sorting
  const fetchBDs = async (page = 1, pageSize = 50, search = '', sortField = 'cote', sortOrder = 'asc') => {
    setLoading(true);
    try {
      const skip = (page - 1) * pageSize;
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      const sortParam = `&sort_field=${sortField}&sort_order=${sortOrder}`;
      
      const [bdsResponse, countResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/bds/?skip=${skip}&limit=${pageSize}${searchParam}${sortParam}`, {
          headers: getAuthHeaders(),
        }),
        fetch(`${API_BASE_URL}/admin/bds/count?${searchParam.substring(1)}`, {
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
    } finally {
      setLoading(false);
    }
  };

  // Fetch BD details
  const fetchBDDetails = async (bdId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/bds/${bdId}`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const bdData = await response.json();
        return bdData;
      } else {
        message.error('Erreur lors du chargement des détails de la BD');
        return null;
      }
    } catch (error) {
      console.error('Error fetching BD details:', error);
      message.error('Erreur de connexion');
      return null;
    }
  };

  // Create new BD
  const createBD = async (bdData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/bds/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(bdData),
      });

      if (response.ok) {
        const newBD = await response.json();
        message.success('BD créée avec succès!');
        return newBD;
      } else {
        const errorData = await response.json();
        message.error(errorData.detail || 'Erreur lors de la création de la BD');
        return null;
      }
    } catch (error) {
      console.error('Error creating BD:', error);
      message.error('Erreur de connexion');
      return null;
    }
  };

  // Update BD
  const updateBD = async (bdId, bdData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/bds/${bdId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(bdData),
      });

      if (response.ok) {
        const updatedBD = await response.json();
        message.success('BD mise à jour avec succès');
        return updatedBD;
      } else {
        const errorData = await response.json();
        message.error(errorData.detail || 'Erreur lors de la mise à jour');
        return null;
      }
    } catch (error) {
      console.error('Error updating BD:', error);
      message.error('Erreur de connexion');
      return null;
    }
  };

  // Delete BD
  const deleteBD = async (bdId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/bds/${bdId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        message.success('BD supprimée avec succès');
        return true;
      } else {
        const errorData = await response.json();
        message.error(errorData.detail || 'Erreur lors de la suppression');
        return false;
      }
    } catch (error) {
      console.error('Error deleting BD:', error);
      message.error('Erreur de connexion');
      return false;
    }
  };

  return {
    loading,
    fetchBDs,
    fetchBDDetails,
    createBD,
    updateBD,
    deleteBD,
  };
};
