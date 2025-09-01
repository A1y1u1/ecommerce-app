import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProfileDetails = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '', // Add password field
    role: '',     // Add role field (read-only for users)
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Initialize form with all user data
    setForm({
      username: user.username || '',
      email: user.email || '',
      password: user.password || '', // Display stored password (not recommended in production)
      role: user.role || 'user',
    });
    setLoading(false);
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Reset error state
    try {
      // Prepare updated user data, preserving uneditable fields like id
      const updatedUser = {
        id: user.id, // Ensure ID is included
        username: form.username,
        email: form.email,
        password: form.password || user.password, // Use existing password if unchanged
        role: user.role, // Keep role unchanged (editable only by admin)
      };

      // Update backend
      const response = await axios.put(`http://localhost:5000/users/${user.id}`, updatedUser);
      
      // Update AuthContext and localStorage
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Update profile error:', err);
      setError('Failed to update profile. Please try again.');
    }
  };

  if (loading) return <div className="text-center p-4 text-gray-600">Loading...</div>;
  if (!user) return null; // Redirected already

  return (
    <div className="container mx-auto p-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Profile Details</h1>
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-md mx-auto">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Leave blank to keep current password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <input
              type="text"
              name="role"
              value={form.role}
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Role cannot be changed by users.</p>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
          >
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileDetails;