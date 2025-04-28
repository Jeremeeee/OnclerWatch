import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface CountryData {
  location_id: number;
  country: string;
  views: number;
}

interface FavLocation {
  location_id: number;
  location_name: string;
  location_type: 'country' | 'subnational'; 
}

const Top10Countries: React.FC = () => {
  const [popularCountries, setPopularCountries] = useState<CountryData[]>([]);
  const [favorites, setFavorites] = useState<FavLocation[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch popular countries (most viewed)
  useEffect(() => {
    axios.get('http://127.0.0.1:8080/popular')
      .then(response => {
        setPopularCountries(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching popular countries:', error);
        setLoading(false);
      });
  }, []);

  // Fetch user's favorite locations
  useEffect(() => {
    axios.get('http://127.0.0.1:8080/favorites/user')
      .then(response => {
        setFavorites(response.data);
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching user favorites:', error);
        setLoading(false)
      });
  }, []);

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className="container">
      <h1>Explore Locations</h1>

      {/* Popular Countries Section */}
      <div className="section">
        <h2 className="sectionTitle">Top 10 Most Viewed Countries</h2>
        {loading ? (
          <p className="loading">Loading...</p>
        ) : popularCountries.length === 0 ? (
          <p className="noData">No popular countries available.</p>
        ) : (
          <div className="table">
            {popularCountries.map((country) => (
              <div key={country.location_id} className="tableRow">
                <p className="countryText"><strong>{country.country}</strong></p>
                <p className="viewsText">Views: {formatNumber(country.views)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User's Favorite Locations Section */}
      <div className="section">
        <h2 className="sectionTitle">Your Favorites!</h2>
        {loading ? (
          <p className="loading">Loading...</p>
        ) : favorites.length === 0 ? (
          <p className="noData">No Favorites Present</p>
        ) : (
          <div className="table">
            {favorites.map((fav) => (
              <div key={fav.location_id} className="tableRow">
                <p className="countryText">
                  <strong>{fav.location_name}</strong>
                  <br />
                  <span className="type">({fav.location_type})</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Top10Countries;