import React, { useEffect, useState } from 'react';
import { Users, Car, CheckCircle, Activity, DollarSign } from 'lucide-react';
import api from '../../api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        users: { total: 0 },
        drivers: { total: 0, pending: 0, online: 0 },
        bookings: { total: 0, active: 0, completed: 0 },
        revenue: { total: 0, this_month: 0 }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/api/admin/dashboard');
                if (response.data.success) {
                    setStats(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="text-white">Loading stats...</div>;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white mb-6">Dashboard Overview</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats.users.total}
                    icon={<Users className="text-blue-500" />}
                />
                <StatCard
                    title="Pending Drivers"
                    value={stats.drivers.pending}
                    icon={<Car className="text-orange-500" />}
                    className="border-orange-500/20 bg-orange-500/5"
                    trend={`${stats.drivers.total} Total Drivers`}
                />
                <StatCard
                    title="Active Rides"
                    value={stats.bookings.active}
                    icon={<Activity className="text-green-500" />}
                    className="border-green-500/20 bg-green-500/5"
                    trend={`${stats.drivers.online} Drivers Online`}
                />
                <StatCard
                    title="Total Revenue"
                    value={`Rs. ${stats.revenue.total}`}
                    icon={<DollarSign className="text-yellow-500" />}
                    className="border-yellow-500/20 bg-yellow-500/5"
                    trend={`Rs. ${stats.revenue.this_month} this month`}
                />
            </div>

            {/* Recent Activity Section */}
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
                    <h3 className="font-bold text-lg text-white mb-4">System Health</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/40 p-4 rounded-xl">
                            <p className="text-gray-400 text-sm">Total Bookings</p>
                            <p className="text-2xl font-bold text-white">{stats.bookings.total}</p>
                        </div>
                        <div className="bg-black/40 p-4 rounded-xl">
                            <p className="text-gray-400 text-sm">Completed Rides</p>
                            <p className="text-2xl font-bold text-white">{stats.bookings.completed}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
                    <h3 className="font-bold text-lg text-white mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                        <button onClick={() => window.location.href = '/admin/drivers'} className="w-full text-left p-3 hover:bg-white/5 rounded-lg text-primary transition-colors">
                            Review Pending Drivers ({stats.drivers.pending})
                        </button>
                        <button className="w-full text-left p-3 hover:bg-white/5 rounded-lg text-gray-300 transition-colors">
                            View All Bookings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, trend, className = '' }) => (
    <div className={`bg-zinc-900 border border-white/5 p-6 rounded-2xl ${className}`}>
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-gray-400 text-sm font-medium">{title}</p>
                <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
            </div>
            <div className="p-3 bg-white/5 rounded-xl">
                {icon}
            </div>
        </div>
        {trend && <p className="text-sm text-gray-500 font-medium">{trend}</p>}
    </div>
);

export default Dashboard;
