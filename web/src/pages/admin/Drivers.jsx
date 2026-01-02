import React, { useEffect, useState } from 'react';
import { Check, X, FileText } from 'lucide-react';
import api from '../../api';

const PendingDrivers = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        try {
            const response = await api.get('/api/admin/drivers/pending');
            if (response.data.success) {
                setDrivers(response.data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, approved) => {
        if (!window.confirm(`Are you sure you want to ${approved ? 'APPROVE' : 'REJECT'} this driver?`)) return;
        try {
            await api.put(`/api/admin/drivers/${id}/approve`, {
                is_approved: approved,
                rejection_reason: approved ? '' : 'Documents invalid'
            });
            fetchDrivers();
        } catch (error) {
            alert('Failed to update driver status');
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Pending Driver Approvals</h1>

            <div className="grid gap-6">
                {loading ? (
                    <div className="text-white">Loading...</div>
                ) : drivers.map(driver => (
                    <div key={driver.driver_id} className="bg-zinc-900 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                                <h3 className="text-xl font-bold text-white">{driver.full_name}</h3>
                                <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-xs font-bold">Pending Review</span>
                            </div>

                            <div className="grid md:grid-cols-2 gap-y-2 gap-x-8 text-sm">
                                <p className="text-gray-400">Email: <span className="text-white">{driver.email}</span></p>
                                <p className="text-gray-400">Phone: <span className="text-white">{driver.phone}</span></p>
                                <p className="text-gray-400">Vehicle: <span className="text-white">{driver.vehicle_color} {driver.vehicle_model} ({driver.vehicle_year})</span></p>
                                <p className="text-gray-400">Plate No: <span className="text-white font-mono bg-white/10 px-2 rounded">{driver.vehicle_number}</span></p>
                                <p className="text-gray-400">License No: <span className="text-white">{driver.license_number}</span></p>
                                <p className="text-gray-400">Citizenship: <span className="text-white">{driver.citizenship_number}</span></p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 justify-center min-w-[150px]">
                            <button
                                onClick={() => handleAction(driver.driver_id, true)}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                            >
                                <Check size={18} /> Approve
                            </button>
                            <button
                                onClick={() => handleAction(driver.driver_id, false)}
                                className="bg-red-600/20 hover:bg-red-600/30 text-red-500 border border-red-600/50 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                            >
                                <X size={18} /> Reject
                            </button>
                        </div>
                    </div>
                ))}

                {!loading && drivers.length === 0 && (
                    <div className="text-center p-12 bg-zinc-900 rounded-2xl border border-white/5">
                        <p className="text-gray-500">No pending driver applications at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PendingDrivers;
