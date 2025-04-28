import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface FavoriteLocation {
    location_id: string;
    location_name: string;
    country: string;
    subnational: string;
}

const FavoritesPage: React.FC = () => {
    const [favorites, setFavorites] = useState<FavoriteLocation[]>([]);
    const [searchQueryCountry, setSearchQueryCountry] = useState<string>('');
    const [searchQuerySubnational, setSearchQuerySubnational] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        axios
        .get('http://127.0.0.1:8080/favorites/user')
        .then((response) => {
            setFavorites(response.data);
            setLoading(false);
        })
        .catch((error) => {
            setError('Error fetching favorites.');
            setLoading(false);
        });
}, []);


if (loading) {
    return <div>Loading favorites...</div>;
}
    
if (error) {
    return <div>{error}</div>;
}

const filteredFavorites = favorites.filter((favorite) =>
    favorite.country.toLowerCase().includes(searchQueryCountry.toLowerCase()) &&
    favorite.subnational.toLowerCase().includes(searchQuerySubnational.toLowerCase())
);

return (
    <div style={{ padding: '2rem' }}>
    <h1>Your Favorite Locations!</h1>

    {/* Country search bar */}
    <div>
        <input
        type="text"
        placeholder="Search by Country"
        value={searchQueryCountry}
        onChange={(e) => setSearchQueryCountry(e.target.value)}
        style={{ padding: '0.5rem', width: '300px', marginBottom: '20px' }}
        />
    </div>

    {/* Subnational search bar */}
    <div>
        <input
        type="text"
        placeholder="Search by Subnational"
        value={searchQuerySubnational}
        onChange={(e) => setSearchQuerySubnational(e.target.value)}
        style={{ padding: '0.5rem', width: '300px', marginBottom: '20px' }}
        />
    </div>

    {/* Displays the list of favorite locations */}
    <h2>Locations:</h2>
    <ul>
        {filteredFavorites.map((favorite, index) => (
        <h4 key={index} style={{borderBottom: '1px solid grey' }}>
            <h3>{favorite.location_name}</h3>
            <p><strong>Country:</strong> {favorite.country}</p>
            <p><strong>Subnational:</strong> {favorite.subnational}</p>
        </h4>
        ))}
    </ul>
    </div>
    );
};

export default FavoritesPage;