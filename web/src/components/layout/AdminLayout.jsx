import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';
import { Car, LogOut, LayoutDashboard, Users, UserCog, Settings, Shield } from 'lucide-react';

const AdminLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-black overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-zinc-900 border-r border-white/10 flex flex-col">
                <div className="h-20 flex items-center px-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-lg text-white">Admin Panel</span>
                    </div>
                </div>

                <nav className="flex-1 py-6 px-4 space-y-1">
                    <NavItem to="/admin/dashboard" icon={<LayoutDashboard />} label="Dashboard" />
                    <NavItem to="/admin/users" icon={<Users />} label="Users" />
                    <NavItem to="/admin/drivers" icon={<UserCog />} label="Drivers" />
                    <NavItem to="/admin/settings" icon={<Settings />} label="Settings" />
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-white rounded-xl transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-black">
                <header className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-black/50 backdrop-blur-md sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-white">Overview</h2>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-400">Welcome, Admin</span>
                        <div className="w-10 h-10 rounded-full bg-gray-700"></div>
                    </div>
                </header>
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

const NavItem = ({ to, icon, label }) => {
    const navigate = useNavigate();
    const isActive = window.location.pathname.startsWith(to);

    return (
        <button
            onClick={() => navigate(to)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${isActive
                    ? 'bg-primary text-black font-bold'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
        >
            {React.cloneElement(icon, { size: 20 })}
            <span>{label}</span>
        </button>
    );
};

export default AdminLayout;
