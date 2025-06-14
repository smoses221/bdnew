import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './BDHomepage.css';

const BDHomepage = () => {
  const [bds, setBds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const API_BASE_URL = 'http://localhost:8000';
  const ITEMS_PER_PAGE = 20;

  // Fetch BDs from the API
  const fetchBDs = useCallback(async (pageNum = 1, isNewSearch = false) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/bds/`, {
        params: {
          skip: (pageNum - 1) * ITEMS_PER_PAGE,
          limit: ITEMS_PER_PAGE,
          search: searchTerm || undefined
        }
      });

      const newBDs = response.data;
      
      if (isNewSearch) {
        setBds(newBDs);
      } else {
        setBds(prev => [...prev, ...newBDs]);
      }
      
      setHasMore(newBDs.length === ITEMS_PER_PAGE);
      setPage(pageNum + 1);
    } catch (err) {
      console.error('Error fetching BDs:', err);
      setError('Erreur lors du chargement des BD. Vérifiez que le serveur backend est démarré.');
    } finally {
      setLoading(false);
    }
  }, [loading, searchTerm]);

  // Initial load
  useEffect(() => {
    fetchBDs(1, true);
  }, []);

  // Handle search
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    setPage(1);
    setBds([]);
    setHasMore(true);
    setTimeout(() => fetchBDs(1, true), 100);
  }, [fetchBDs]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop 
        >= document.documentElement.offsetHeight - 1000 &&
        hasMore &&
        !loading
      ) {
        fetchBDs(page);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchBDs, hasMore, loading, page]);

  // Search input handler
  const handleSearchInput = (e) => {
    const value = e.target.value;
    handleSearch(value);
  };

  return (
    <div className="bd-homepage">
      <header className="bd-header">
        <h1 className="bd-main-title">Bibliothèque BD</h1>
        <p className="bd-subtitle">Découvrez notre collection de bandes dessinées</p>
        
        <div className="search-container">
          <input
            type="text"
            placeholder="Rechercher par titre, auteur, série..."
            value={searchTerm}
            onChange={handleSearchInput}
            className="search-input"
          />
          <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </header>

      <main className="bd-content">
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-button">
              Réessayer
            </button>
          </div>
        )}

        {bds.length === 0 && !loading && !error && (
          <div className="no-results">
            <p>Aucune BD trouvée.</p>
          </div>
        )}

        <div className="bd-table-container">
          <table className="bd-table">
            <thead>
              <tr>
                <th>Cote</th>
                <th>Série</th>
                <th>Titre Album</th>
                <th>Tome</th>
                <th>Scénariste</th>
                <th>Dessinateur</th>
                <th>Éditeur</th>
                <th>Collection</th>
                <th>Genre</th>
              </tr>
            </thead>
            <tbody>
              {bds.map((bd, index) => (
                <tr key={`${bd.bid}-${index}`} className="bd-row">
                  <td className="bd-cote">{bd.cote}</td>
                  <td className="bd-series">{bd.titreserie || '-'}</td>
                  <td className="bd-title">{bd.titrealbum || 'Album sans titre'}</td>
                  <td className="bd-tome">{bd.numtome || '-'}</td>
                  <td className="bd-author">{bd.scenariste}</td>
                  <td className="bd-artist">{bd.dessinateur}</td>
                  <td className="bd-publisher">{bd.editeur || '-'}</td>
                  <td className="bd-collection">{bd.collection || '-'}</td>
                  <td className="bd-genre">{bd.genre || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Chargement...</p>
          </div>
        )}

        {!hasMore && bds.length > 0 && (
          <div className="end-message">
            <p>Vous avez vu toutes les BD disponibles !</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default BDHomepage;
