import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  username: string;
  email: string;
}

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get('http://127.0.0.1:8000/api/users')
      .then((response) => {
        setUsers(response.data);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setError("There was an error fetching user data." + err);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">User List</h1>

      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <table className="border-collapse border border-gray-400 bg-white shadow-lg w-full max-w-xl">
          <thead>
            <tr className="bg-indigo-200">
              <th className="border border-gray-300 px-4 py-2 text-left">Username</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user, index) => (
                <tr key={index} className="hover:bg-indigo-50">
                  <td className="border border-gray-300 px-4 py-2">{user.username}</td>
                  <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="text-center py-4 text-gray-500">
                  Loading...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default App;