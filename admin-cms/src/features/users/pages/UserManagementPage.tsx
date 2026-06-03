import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '@/services';
import type { User } from '@/types';
import { Eye, Shield, User as UserIcon, Plus, Edit2, Trash2 } from 'lucide-react';

export default function UserManagementPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form input states
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'passenger' | 'admin'>('passenger');

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }

  const openCreate = () => {
    setEmail('');
    setFullName('');
    setPhone('');
    setPassword('');
    setRole('passenger');
    setFormError('');
    setIsCreateOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setEmail(user.email);
    setFullName(user.fullName);
    setPhone(user.phone || '');
    setPassword(''); // Empty = don't update password
    setRole(user.role as 'passenger' | 'admin');
    setFormError('');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      await userService.create({
        email,
        fullName,
        phone,
        role,
        password: password || undefined,
      });
      setIsCreateOpen(false);
      loadUsers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Failed to create user account');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setFormError('');
    setFormLoading(true);
    try {
      await userService.update(editingUser.id, {
        email,
        fullName,
        phone,
        role,
        password: password || undefined,
      });
      setEditingUser(null);
      loadUsers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Failed to update user account');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this user account from Firebase Auth and the system database?')) return;
    try {
      await userService.delete(id);
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to delete user account');
    }
  };

  const filteredUsers = users.filter((u) => {
    if (filterRole === 'all') return true;
    return u.role === filterRole;
  });

  if (loading) return <div className="text-center py-10 text-slate-600">Loading user catalog...</div>;
  if (error) return <div className="text-red-500 bg-red-50 border border-red-200 p-4 rounded-md">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-sm text-slate-500">
          Showing {filteredUsers.length} of {users.length} registered users
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {['all', 'passenger', 'admin'].map((roleKey) => (
              <button
                key={roleKey}
                onClick={() => setFilterRole(roleKey)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md border capitalize transition-colors ${
                  filterRole === roleKey
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {roleKey}
              </button>
            ))}
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Acc
          </button>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white shadow-sm rounded-lg border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                        {user.avatar ? (
                          <img src={user.avatar} alt="avatar" className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <UserIcon className="h-4 w-4" />
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-semibold text-slate-955">{user.fullName}</div>
                        <div className="text-xs text-slate-400">UID: {user.firebaseUid ? `${user.firebaseUid.substring(0, 8)}...` : 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{user.phone || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                      user.role === 'admin'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="inline-flex items-center px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => openEdit(user)}
                      className="inline-flex items-center px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors"
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="inline-flex items-center px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600 text-xs transition-colors"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!filteredUsers.length && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected User Modal / Panel */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-md font-bold text-slate-900 flex items-center">
                <Shield className="h-4 w-4 mr-2 text-teal-600" />
                User Profile Details
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                  {selectedUser.avatar ? (
                    <img src={selectedUser.avatar} alt="avatar" className="h-16 w-16 rounded-full object-cover" />
                  ) : (
                    <UserIcon className="h-8 w-8" />
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-950">{selectedUser.fullName}</h4>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold uppercase bg-slate-100 text-slate-800">
                    {selectedUser.role}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Database ID:</span>
                  <span className="text-slate-800 font-semibold">{selectedUser.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Firebase UID:</span>
                  <span className="text-slate-800 font-mono text-xs">{selectedUser.firebaseUid || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Email Address:</span>
                  <span className="text-slate-800 font-semibold">{selectedUser.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Phone Number:</span>
                  <span className="text-slate-800 font-semibold">{selectedUser.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Registered Date:</span>
                  <span className="text-slate-800 font-semibold">
                    {new Date(selectedUser.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">FCM Notification Token:</span>
                  <span className="text-slate-800 font-mono text-xs truncate max-w-[200px]" title={selectedUser.fcmToken || 'None'}>
                    {selectedUser.fcmToken || 'None'}
                  </span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between">
              <button
                onClick={() => {
                  setSelectedUser(null);
                  navigate(`/bookings?userId=${selectedUser.id}`);
                }}
                className="px-4 py-2 text-xs font-semibold rounded bg-teal-600 hover:bg-teal-700 text-white transition-colors"
              >
                View Bookings
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 text-xs font-semibold rounded bg-slate-900 hover:bg-slate-800 text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Form Modal */}
      {(isCreateOpen || editingUser) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-md font-bold text-slate-900">
                {isCreateOpen ? 'Create User Account' : `Edit User Account #${editingUser?.id}`}
              </h3>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingUser(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>
            <form onSubmit={isCreateOpen ? handleCreate : handleUpdate}>
              <div className="p-6 space-y-4">
                {formError && (
                  <div className="text-red-600 bg-red-50 border border-red-200 text-sm text-center py-2 px-3 rounded-md">
                    {formError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-slate-950 placeholder-slate-400 focus:border-slate-500 focus:outline-none sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. user@mma.com"
                    className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-slate-950 placeholder-slate-400 focus:border-slate-500 focus:outline-none sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +84912345678"
                    className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-slate-950 placeholder-slate-400 focus:border-slate-500 focus:outline-none sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700">
                    Password {editingUser && '(leave blank to keep current)'}
                  </label>
                  <input
                    type="password"
                    required={isCreateOpen}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isCreateOpen ? 'Min 6 characters' : '••••••••'}
                    className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-slate-950 placeholder-slate-400 focus:border-slate-500 focus:outline-none sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-slate-950 focus:border-slate-500 focus:outline-none sm:text-sm bg-white"
                  >
                    <option value="passenger">Passenger</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 border border-slate-200 text-xs font-semibold rounded bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 text-xs font-semibold rounded bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-50 transition-colors"
                >
                  {formLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
