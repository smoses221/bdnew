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
  const fetchBDs = useCallback(async (pageNum = 1, isNewSearch = false, search = searchTerm) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        skip: ((pageNum - 1) * ITEMS_PER_PAGE).toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });
      if (search && search.trim() !== '') {
        params.append('search', search);
      }
      const res = await fetch(`${API_BASE_URL}/bds/?${params.toString()}`);
      if (!res.ok) throw new Error('Erreur lors du chargement des BD');
      const data = await res.json();
      
      if (isNewSearch) {
        setBds(data);
      } else {
        setBds(prev => [...prev, ...data]);
      }
      
      setHasMore(data.length === ITEMS_PER_PAGE);
    } catch (err) {
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [loading, API_BASE_URL, ITEMS_PER_PAGE]);

  // Initial load and when searchTerm changes
  useEffect(() => {
    setPage(1);
    fetchBDs(1, true, searchTerm);
    // eslint-disable-next-line
  }, [searchTerm]);

  // Infinite scroll handler
  useEffect(() => {
    if (page === 1) return; // Already loaded by searchTerm effect
    fetchBDs(page, false, searchTerm);
    // eslint-disable-next-line
  }, [page]);

  // Search input handler
  const handleSearchInput = (e) => {
    setSearchTerm(e.target.value);
  };

  // Infinite scroll event
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 200 &&
        hasMore &&
        !loading
      ) {
        setPage(prev => prev + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading]);

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
