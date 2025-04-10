import { useState, useEffect } from 'react';
import axios from 'axios';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/users');
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load users.');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const updateUser = async (userId) => {
    try {
      const userToUpdate = users.find((user) => user.id === userId);
      const updatedUser = { ...userToUpdate, ...editUser };

      await axios.put(`http://localhost:5000/users/${userId}`, updatedUser);
      setUsers(users.map((user) => (user.id === userId ? updatedUser : user)));
      setEditUser(null);
      alert('User updated successfully!');
    } catch (err) {
      alert('Failed to update user.');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(`http://localhost:5000/users/${userId}`);
      setUsers(users.filter((user) => user.id !== userId));
      alert('User deleted!');
    } catch (err) {
      alert('Failed to delete user.');
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = search.toLowerCase();
    return (
      (user.username?.toLowerCase() || '').includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      (user.phoneNumber?.toLowerCase() || '').includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower) ||
      user.id.toString().includes(searchLower)
    );
  });

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditUser((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
    </div>
  );
  if (error) return (
    <div className="text-center p-4 text-red-500 text-lg animate-pulse">{error}</div>
  );

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-8 text-center animate-fadeIn">
        Manage Users
      </h1>

      {/* Search Bar */}
      <div className="mb-8 max-w-lg mx-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by username, email, phone, role, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-4 pl-12 border-2 border-gray-200 rounded-full shadow-md focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-300"
          />
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center p-8 animate-fadeInUp">
          <p className="text-gray-600 text-lg">No users found.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {filteredUsers.map((user, index) => (
            <div
              key={user.id}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeInUp"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {editUser && editUser.id === user.id ? (
                // Edit Form
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit User #{user.id}</h2>
                  <div className="space-y-4">
                    <input
                      type="text"
                      name="username"
                      placeholder="Username"
                      value={editUser.username || ''}
                      onChange={handleEditChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={editUser.email}
                      onChange={handleEditChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                      required
                    />
                    <input
                      type="tel"
                      name="phoneNumber"
                      placeholder="Phone Number"
                      value={editUser.phoneNumber || ''}
                      onChange={handleEditChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                      pattern="[0-9]{10}"
                      title="Please enter a 10-digit phone number"
                    />
                    <input
                      type="text" // Changed from 'password' to 'text' to show the password
                      name="password"
                      placeholder="Password"
                      value={editUser.password}
                      onChange={handleEditChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                      required
                    />
                    <select
                      name="role"
                      value={editUser.role}
                      onChange={handleEditChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                    >
                      <option value="client">Client</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex space-x-4 mt-6">
                    <button
                      onClick={() => updateUser(user.id)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-md"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditUser(null)}
                      className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 shadow-md"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // User Card
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {user.username || `User #${user.id}`}
                    </h2>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </div>
                  <div className="space-y-2 text-gray-600">
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Phone:</strong> {user.phoneNumber || 'N/A'}</p>
                    <p><strong>Password:</strong> <span className="text-gray-400">••••••••</span></p>
                  </div>
                  <div className="flex space-x-4 mt-6">
                    <button
                      onClick={() => setEditUser(user)}
                      className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-all duration-300 transform hover:scale-105 shadow-md"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-all duration-300 transform hover:scale-105 shadow-md"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Add these custom animations to your CSS (e.g., in index.css)
const customStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .animate-fadeIn {
    animation: fadeIn 1s ease-in-out;
  }

  .animate-fadeInUp {
    animation: fadeInUp 0.8s ease-out;
  }
`;

export default ManageUsers;