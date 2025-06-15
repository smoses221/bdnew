import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Input, Typography, Space, Tag, Menu, Button } from 'antd';
import { 
  SearchOutlined, 
  UserOutlined, 
  HomeOutlined, 
  TeamOutlined, 
  InfoCircleOutlined,
  SettingOutlined,
  LogoutOutlined,
  BookOutlined 
} from '@ant-design/icons';
import axios from 'axios';
import './BDHomepageAntd.css';
import NavigationBar from './NavigationBar';

const { Title, Text } = Typography;

const BDHomepage = ({ onNavigate, currentUser, onLogout }) => {
  const [bds, setBds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [sortInfo, setSortInfo] = useState({});
  
  const pageSize = 100; // Number of items per page

  const API_BASE_URL = 'http://localhost:8000';

  // Column definitions with mobile-first responsive design
  const columns = useMemo(() => [
    {
      title: 'Cote',
      dataIndex: 'cote',
      key: 'cote',
      width: 80,
      sorter: true,
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
      width: 120,
      sorter: true,
      render: (text) => text || <Text type="secondary">-</Text>,
      ellipsis: true,
    },
    {
      title: 'Titre',
      dataIndex: 'titrealbum',
      key: 'titrealbum',
      width: 140,
      sorter: true,
      render: (text) => (
        <Text strong style={{ fontSize: '12px' }}>{text || 'Sans titre'}</Text>
      ),
      ellipsis: true,
    },
    {
      title: 'Tome',
      dataIndex: 'numtome',
      key: 'numtome',
      width: 40,
      sorter: true,
      align: 'center',
      render: (text) => text ? (
        <Tag color="red" style={{ fontSize: '9px' }}>{text}</Tag>
      ) : <Text type="secondary" style={{ fontSize: '10px' }}>-</Text>,
    },
    {
      title: 'Scénariste',
      dataIndex: 'scenariste',
      key: 'scenariste',
      width: 100,
      sorter: true,
      ellipsis: true,
      responsive: ['sm'],
    },
    {
      title: 'Dessinateur',
      dataIndex: 'dessinateur',
      key: 'dessinateur',
      width: 100,
      sorter: true,
      ellipsis: true,
      responsive: ['sm'],
    },
    {
      title: 'Éditeur',
      dataIndex: 'editeur',
      key: 'editeur',
      width: 90,
      sorter: true,
      render: (text) => text || <Text type="secondary">-</Text>,
      ellipsis: true,
      responsive: ['md'],
    },
    {
      title: 'Collection',
      dataIndex: 'collection',
      key: 'collection',
      width: 90,
      sorter: true,
      render: (text) => text || <Text type="secondary">-</Text>,
      ellipsis: true,
      responsive: ['lg'],
    },
    {
      title: 'Genre',
      dataIndex: 'genre',
      key: 'genre',
      width: 70,
      sorter: true,
      render: (text) => text ? (
        <Tag color="green" style={{ fontSize: '9px' }}>{text}</Tag>
      ) : <Text type="secondary" style={{ fontSize: '10px' }}>-</Text>,
      ellipsis: true,
      responsive: ['lg'],
    },
  ], []);

  // Fetch total count
  const fetchTotalCount = useCallback(async (search = '') => {
    try {
      const params = {};
      if (search && search.trim()) {
        params.search = search.trim();
      }
      
      const response = await axios.get(`${API_BASE_URL}/bds/count`, { params });
      return response.data.total || 0;
    } catch (error) {
      console.error('Error fetching total count:', error);
      return 0;
    }
  }, []);

  // Fetch BDs from API
  const fetchBDs = useCallback(async (params = {}) => {
    const {
      page = 0,
      search = searchTerm,
      sortField,
      sortOrder,
      append = false,
      isSearch = false
    } = params;

    if (append) {
      setLoadingMore(true);
    } else if (isSearch) {
      setSearching(true);
    } else {
      setLoading(true);
    }

    try {
      const requestParams = {
        skip: page * pageSize,
        limit: pageSize,
      };

      if (search && search.trim()) {
        requestParams.search = search.trim();
      }

      if (sortField) {
        requestParams.sort_field = sortField;
        requestParams.sort_order = sortOrder === 'ascend' ? 'asc' : 'desc';
      }

      // Fetch both data and total count
      const [dataResponse, totalCountResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/bds/`, { params: requestParams }),
        fetchTotalCount(search)
      ]);

      const data = dataResponse.data || [];
      const total = totalCountResponse;
      
      if (append) {
        setBds(prev => [...prev, ...data]);
      } else {
        setBds(data);
      }
      
      setTotalCount(total);
      setHasMore(data.length === pageSize && (page + 1) * pageSize < total);
      setCurrentPage(page);

    } catch (error) {
      console.error('Error fetching BDs:', error);
      if (!append) {
        setBds([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setSearching(false);
    }
  }, [searchTerm, fetchTotalCount, pageSize]);

  // Load more data when scrolling
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchBDs({
        page: currentPage + 1,
        search: searchTerm,
        ...sortInfo,
        append: true
      });
    }
  }, [loadingMore, hasMore, currentPage, searchTerm, sortInfo, fetchBDs]);

  // Scroll event handler for infinite loading
  const handleScroll = useCallback((e) => {
    // For Ant Design Table, the scroll target might be different
    const scrollContainer = e.target.closest('.ant-table-body') || e.target;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
    
    // Check if we're near the bottom (within 100px)
    if (scrollHeight - scrollTop - clientHeight < 100 && hasMore && !loadingMore) {
      loadMore();
    }
  }, [hasMore, loadingMore, loadMore]);

  // Initial load
  useEffect(() => {
    fetchBDs({ page: 0 });
    setIsInitialLoad(false);
  }, []);

  // Handle search with debounce
  useEffect(() => {
    // Skip search effect on initial load
    if (isInitialLoad) return;

    const timeoutId = setTimeout(() => {
      // Only search if the term has meaningful content or is empty (to reset)
      const trimmedSearch = searchTerm.trim();
      
      setCurrentPage(0);
      setHasMore(true);
      fetchBDs({ 
        page: 0,
        search: trimmedSearch,
        ...sortInfo,
        isSearch: true
      });
    }, 400); // Increased debounce to 500ms for smoother typing

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchBDs, sortInfo, isInitialLoad]);

  // Handle table changes (sorting)
  const handleTableChange = (paginationInfo, filters, sorter) => {
    const newSortInfo = {};
    if (sorter.field) {
      newSortInfo.sortField = sorter.field;
      newSortInfo.sortOrder = sorter.order;
    }
    
    setSortInfo(newSortInfo);
    setCurrentPage(0);
    setHasMore(true);
    
    fetchBDs({
      page: 0,
      search: searchTerm,
      ...newSortInfo
    });
  };

  return (
    <>
      <NavigationBar currentUser={currentUser} onNavigate={onNavigate} onLogout={onLogout} />
      <div className="bd-homepage-antd">
        <div className="bd-header-antd">
          <Title level={1} className="bd-main-title">
            Bibliothèque BD
          </Title>
          <Text className="bd-subtitle">
            Découvrez notre collection de bandes dessinées
            {totalCount > 0 && (
              <span style={{ marginLeft: '8px', color: '#1890ff', fontWeight: '500' }}>
                ({bds.length} / {totalCount})
              </span>
            )}
          </Text>
          
          <Space.Compact size="large" className="search-container">
            <Input
              placeholder={searching ? "Recherche en cours..." : "Rechercher..."}
              prefix={<SearchOutlined spin={searching} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
              size="middle"
              style={{ 
                width: '100%',
                opacity: searching ? 0.7 : 1
              }}
            />
          </Space.Compact>
        </div>

        <div className="bd-content-antd">
          <Table
            columns={columns}
            dataSource={bds}
            rowKey="bid"
            loading={loading}
            pagination={false}
            onChange={handleTableChange}
            scroll={{ 
              x: 800,
              y: 'calc(100vh - 160px)'
            }}
            size="small"
            bordered={false}
            className="bd-table-antd"
            onScroll={handleScroll}
          />
          {loadingMore && (
            <div style={{ 
              textAlign: 'center', 
              padding: '16px',
              background: '#fafafa',
              borderTop: '1px solid #e8e8e8'
            }}>
              <Text type="secondary">Chargement...</Text>
            </div>
          )}
          {!hasMore && bds.length > 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '16px',
              background: '#fafafa',
              borderTop: '1px solid #e8e8e8'
            }}>
              <Text type="secondary">Toutes les BD ont été affichées</Text>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BDHomepage;
