import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Define the structure of the data
interface CarbonStatus {
  country: string;
  total_emissions: number;
  total_removals: number;
  status: string;
}

interface LossRatio {
  country: string;
  net_loss: number;
  rank_position: number;
}

interface BelowAverageData {
  subnational1: string;
  total_carbon_stocks: number;
}

interface AboveAverageData {
  country: string;
  subnational1: string;
  subnational_primary_loss: number;
}

const HomePage: React.FC = () => {
  const [carbonStatus, setCarbonStatus] = useState<CarbonStatus[]>([]);
  const [lossRatio, setLossRatio] = useState<LossRatio[]>([]);
  const [belowAvgData, setBelowAvgData] = useState<BelowAverageData[]>([]);
  const [aboveAvgData, setAboveAvgData] = useState<AboveAverageData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    axios.get('http://127.0.0.1:8080/statistics')
      .then((response) => {
        const [carbonStatusData, lossRatioData, belowAverageData, aboveAverageData] = response.data;

        // Set the data
        setCarbonStatus(carbonStatusData);
        setLossRatio(lossRatioData);
        setBelowAvgData(belowAverageData);
        setAboveAvgData(aboveAverageData);

        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching statistics:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading statistics...</div>;
  }

  // Filter data for specific categories
  const netEmitters = carbonStatus.filter((entry) => entry.total_emissions > entry.total_removals);
  const netAbsorbers = carbonStatus.filter((entry) => entry.total_removals > entry.total_emissions);

  // Loss Ratio chart data
  const lossRatioData = lossRatio.filter((entry) => entry.net_loss !== undefined);

  // Below Average chart data
  const belowAverageData = belowAvgData.filter((entry) => entry.total_carbon_stocks !== undefined);

  // Above Average chart data
  const aboveAverageData = aboveAvgData.filter((entry) => entry.subnational_primary_loss !== undefined);

  // Filtered loss ratio based on user search
   // Filter Loss Ratio data based on the search query
   const filteredLossRatioData = lossRatio.filter(entry =>
    entry.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Deforestation Statistics</h1>

      {/* Net Emitters Bar Chart */}
      <h2>Net Emitters (Countries emitting more carbon than they remove)</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={netEmitters}>
          <XAxis dataKey="country" />
          <Tooltip />
          <Legend />
          <Bar dataKey="total_emissions" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>

      {/* Net Absorbers Bar Chart */}
      <h2>Net Absorbers (Countries absorbing more carbon than they emit)</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={netAbsorbers}>
          <XAxis dataKey="country" />
          <Tooltip />
          <Legend />
          <Bar dataKey="total_removals" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>

      {/* Search bar for Loss Ratio Table */}
      <h2>Loss Ratio Table</h2>
      <input
        type="text"
        placeholder="Search by Country"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ padding: '0.5rem', width: '300px', marginBottom: '20px' }}
      />

      {/* Display the filtered Loss Ratio data in a table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Country</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Net Loss</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Rank Position</th>
          </tr>
        </thead>
        <tbody>
          {filteredLossRatioData.map((entry, index) => (
            <tr key={index}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{entry.country}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{entry.net_loss}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{entry.rank_position}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Below Average Carbon Stocks Bar Chart */}
      <h2>Below Average Carbon Stocks by Subnational Entity</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={belowAverageData}>
          <XAxis dataKey="subnational1" />
          <Tooltip />
          <Legend />
          <Bar dataKey="total_carbon_stocks" fill="#7d2ae8" />
        </BarChart>
      </ResponsiveContainer>

      {/* Above Average Primary Loss - Cards */}
      <h2>Above Average Primary Loss by Subnational Entity</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {aboveAverageData.map((entry) => (
          <div
            key={entry.subnational1}
            style={{
              border: '1px solid #ddd',
              padding: '1rem',
              width: '200px',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h3>{entry.subnational1 + ": " + entry.country}</h3>
            <p><strong>Primary Loss:</strong> {entry.subnational_primary_loss}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;