import React, { useState } from 'react';
import BDHomepageAntd from './BDHomepageAntd';
import About from './About';
import Login from './Login';

const App = () => {
  const [currentPage, setCurrentPage] = useState('bdteque');

  const renderPage = () => {
    switch (currentPage) {
      case 'bdteque':
        return <BDHomepageAntd onNavigate={setCurrentPage} />;
      case 'sur-nous':
        return <About onNavigate={setCurrentPage} />;
      case 'login':
        return <Login onNavigate={setCurrentPage} />;
      default:
        return <BDHomepageAntd onNavigate={setCurrentPage} />;
    }
  };

  return renderPage();
};

export default App;
