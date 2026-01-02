import React, { useEffect, useState } from 'react';
import { Search, UserX, UserCheck, Trash2 } from 'lucide-react';
import { Input, Button } from '../../components/common/UI';
import api from '../../api';

const UsersList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');

    useEffect(() => {
        fetchUsers();
    }, [search, selectedRole]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/api/admin/users?role=${selectedRole}&search=${search}&limit=50`);
            if (response.data.success) {
                setUsers(response.data.data.users);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) return;
        try {
            await api.put(`/api/admin/users/${id}/toggle-status`, { is_active: !currentStatus });
            fetchUsers(); // Refresh
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const tabs = [
        { id: 'all', label: 'All Users' },
        { id: 'user', label: 'Riders' },
        { id: 'driver', label: 'Drivers' },
        { id: 'admin', label: 'Admins' },
    ];

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-white">Users Management</h1>
                <div className="w-full md:w-72">
                    <Input
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="!bg-zinc-800"
                    />
                </div>
            </div>

            {/* Role Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-white/10 pb-1">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setSelectedRole(tab.id)}
                        className={`px-6 py-3 font-medium text-sm transition-all relative
                            ${selectedRole === tab.id
                                ? 'text-primary'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        {tab.label}
                        {selectedRole === tab.id && (
                            <span className="absolute bottom-[-5px] left-0 w-full h-1 bg-primary rounded-t-full"></span>
                        )}
                    </button>
                ))}
            </div>

            <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-black/50 border-b border-white/10">
                        <tr>
                            <th className="p-4 text-gray-400 font-medium">Name</th>
                            <th className="p-4 text-gray-400 font-medium">Email</th>
                            <th className="p-4 text-gray-400 font-medium">Phone</th>
                            <th className="p-4 text-gray-400 font-medium">Role</th>
                            <th className="p-4 text-gray-400 font-medium">Status</th>
                            <th className="p-4 text-gray-400 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {loading ? (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading users...</td></tr>
                        ) : users.map(user => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 text-white font-medium">{user.full_name}</td>
                                <td className="p-4 text-gray-400">{user.email}</td>
                                <td className="p-4 text-gray-400">{user.phone}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                                        ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                                            user.role === 'driver' ? 'bg-orange-500/20 text-orange-400' :
                                                'bg-blue-500/20 text-blue-400'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {user.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <button
                                        onClick={() => toggleStatus(user.id, user.is_active)}
                                        className={`p-2 rounded hover:bg-white/10 ${user.is_active ? 'text-red-400' : 'text-green-400'}`}
                                        title={user.is_active ? "Deactivate" : "Activate"}
                                    >
                                        {user.is_active ? <UserX size={18} /> : <UserCheck size={18} />}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && users.length === 0 && (
                    <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                        <UserX className="w-12 h-12 mb-4 opacity-20" />
                        <p>No users found matching filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UsersList;
