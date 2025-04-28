import React, { useState } from 'react';
import LoginPage from './LoginPage';
import HomePage from './HomePage';
import LocationsPage from './LocationsPage';
import FavoritesPage from './Top10Countries'; // << NEW import

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState<'home' | 'locations' | 'favorites'>('home'); // << now includes 'favorites'

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
            marginRight: '10px',
            backgroundColor: activePage === 'locations' ? '#007BFF' : '#ccc',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Locations
        </button>
        <button
          onClick={() => setActivePage('favorites')}
          style={{
            padding: '10px 20px',
            backgroundColor: activePage === 'favorites' ? '#007BFF' : '#ccc',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Favorites
        </button>
      </div>

      {/* Show HomePage, LocationsPage, or FavoritesPage */}
      {activePage === 'home' && <HomePage />}
      {activePage === 'locations' && <LocationsPage />}
      {activePage === 'favorites' && <FavoritesPage />}
    </div>
  );
};

export default App;