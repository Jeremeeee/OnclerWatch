import React, { useState } from 'react';
import LoginPage from './LoginPage';
import HomePage from './HomePage';
import LocationsPage from './LocationsPage'; // << NEW import

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState<'home' | 'locations'>('home'); // << control which page to show

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div>
      {/* Navigation Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <button
          onClick={() => setActivePage('home')}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: activePage === 'home' ? '#007BFF' : '#ccc',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Home
        </button>
        <button
          onClick={() => setActivePage('locations')}
          style={{
            padding: '10px 20px',
            backgroundColor: activePage === 'locations' ? '#007BFF' : '#ccc',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Locations
        </button>
      </div>

      {/* Show HomePage or LocationsPage */}
      {activePage === 'home' ? <HomePage /> : <LocationsPage />}
    </div>
  );
};

export default App;