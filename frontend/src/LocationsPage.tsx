import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Proper interfaces based on your database schema
interface CountryData {
  location_id: number;
  views: number;
  country: string;
  umd_tree_cover_extent_2000__ha: number;
  gfw_aboveground_carbon_stocks_2000__Mg_C: number;
  avg_gfw_aboveground_carbon_stocks_2000__Mg_C_ha: number;
  gfw_forest_carbon_gross_emissions__Mg_CO2e_yr: number;
  gfw_forest_carbon_gross_removals__Mg_CO2_yr: number;
  gfw_forest_carbon_net_flux__Mg_CO2e_yr: number;
  gfw_forest_carbon_gross_emissions_2023__Mg_CO2e: number;
  area_ha: number;
  tc_loss_ha_2023: number;
  primary_loss_ha_2023: number;
}

interface SubnationData extends CountryData {
  subnational1: string;
}

const LocationsPage: React.FC = () => {
  const [countrySearch, setCountrySearch] = useState<string>('');
  const [subnationSearch, setSubnationSearch] = useState<string>('');
  const [popularCountries, setPopularCountries] = useState<{ country: string }[]>([]);
  const [favorites, setFavorites] = useState<CountryData[]>([]);
  const [selectedFavorite, setSelectedFavorite] = useState<CountryData | null>(null);
  const [countryResult, setCountryResult] = useState<CountryData | null>(null);
  const [subnationResult, setSubnationResult] = useState<SubnationData | null>(null);

  useEffect(() => {
    axios.get('http://127.0.0.1:8080/popular')
      .then(response => {
        setPopularCountries(response.data);
      })
      .catch(error => {
        console.error('Error fetching popular countries:', error);
      });
  }, []);

  const handleCountrySearch = () => {
    if (!countrySearch) return;
    axios.post(`http://127.0.0.1:8080/country`, { username: countrySearch })
      .then(response => {
        setCountryResult(response.data);
      })
      .catch(error => {
        console.error('Error fetching country:', error);
        setCountryResult(null);
      });
  };

  const handleSubnationSearch = () => {
    if (!subnationSearch) return;
    axios.post(`http://127.0.0.1:8080/subnation`, { username: subnationSearch })
      .then(response => {
        setSubnationResult(response.data);
      })
      .catch(error => {
        console.error('Error fetching subnation:', error);
        setSubnationResult(null);
      });
  };

  const handleAddFavorite = (country: CountryData) => {
    if (!favorites.find(fav => fav.location_id === country.location_id)) {
      setFavorites([...favorites, country]);
    }
  };

  const handleSelectFavorite = (country: CountryData) => {
    setSelectedFavorite(country);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Explore Locations</h1>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Search for a Country</h2>
        <input
          type="text"
          placeholder="Enter country name..."
          value={countrySearch}
          onChange={(e) => setCountrySearch(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        />
        <button onClick={handleCountrySearch} style={{ padding: '0.5rem 1rem' }}>Search</button>

        {countryResult && (
          <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ccc' }}>
            <h3>{countryResult.country}</h3>
            <p>Tree Cover Extent (2000): {formatNumber(countryResult.umd_tree_cover_extent_2000__ha)} ha</p>
            <p>Carbon Stocks (2000): {formatNumber(countryResult.gfw_aboveground_carbon_stocks_2000__Mg_C)} Mg C</p>
            <p>Forest Carbon Net Flux: {formatNumber(countryResult.gfw_forest_carbon_net_flux__Mg_CO2e_yr)} Mg CO2e/yr</p>
            <p>Tree Cover Loss (2023): {formatNumber(countryResult.tc_loss_ha_2023)} ha</p>
            <button
              onClick={() => handleAddFavorite(countryResult)}
              style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
            >
              Add to Favorites
            </button>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Search for a Subnation</h2>
        <input
          type="text"
          placeholder="Enter subnation name..."
          value={subnationSearch}
          onChange={(e) => setSubnationSearch(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        />
        <button onClick={handleSubnationSearch} style={{ padding: '0.5rem 1rem' }}>Search</button>

        {subnationResult && (
          <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ccc' }}>
            <h3>{subnationResult.subnational1} ({subnationResult.country})</h3>
            <p>Tree Cover Extent (2000): {formatNumber(subnationResult.umd_tree_cover_extent_2000__ha)} ha</p>
            <p>Carbon Stocks (2000): {formatNumber(subnationResult.gfw_aboveground_carbon_stocks_2000__Mg_C)} Mg C</p>
            <p>Forest Carbon Net Flux: {formatNumber(subnationResult.gfw_forest_carbon_net_flux__Mg_CO2e_yr)} Mg CO2e/yr</p>
            <p>Tree Cover Loss (2023): {formatNumber(subnationResult.tc_loss_ha_2023)} ha</p>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Favorite Locations</h2>
        {favorites.length === 0 && <p>No favorite countries added yet.</p>}
        {favorites.map((fav) => (
          <div
            key={fav.location_id}
            style={{ marginTop: '0.5rem', cursor: 'pointer', color: 'blue' }}
            onClick={() => handleSelectFavorite(fav)}
          >
            {fav.country}
          </div>
        ))}
      </div>

      {selectedFavorite && (
        <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc' }}>
          <h2>Selected Favorite: {selectedFavorite.country}</h2>
          <p>Tree Cover Extent (2000): {formatNumber(selectedFavorite.umd_tree_cover_extent_2000__ha)} ha</p>
          <p>Carbon Stocks (2000): {formatNumber(selectedFavorite.gfw_aboveground_carbon_stocks_2000__Mg_C)} Mg C</p>
          <p>Forest Carbon Net Flux: {formatNumber(selectedFavorite.gfw_forest_carbon_net_flux__Mg_CO2e_yr)} Mg CO2e/yr</p>
          <p>Tree Cover Loss (2023): {formatNumber(selectedFavorite.tc_loss_ha_2023)} ha</p>
        </div>
      )}
    </div>
  );
};

export default LocationsPage;