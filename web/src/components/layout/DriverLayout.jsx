import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';
import { Car, LogOut, Map, User, Settings } from 'lucide-react';

const DriverLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-black overflow-hidden">
            {/* Sidebar */}
            <aside className="w-20 md:w-64 bg-surface border-r border-white/10 flex flex-col transition-all duration-300">
                <div className="h-20 flex items-center justify-center border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-primary to-primary-light rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <Car className="w-6 h-6 text-black" />
                        </div>
                        <span className="hidden md:block font-bold text-xl text-white tracking-tight">Prepedo</span>
                    </div>
                </div>

                <nav className="flex-1 py-6 px-4 space-y-2">
                    <NavItem to="/driver/requests" icon={<Map />} label="Requests" active />
                    <NavItem to="/driver/profile" icon={<User />} label="Profile" />
                    <NavItem to="/driver/settings" icon={<Settings />} label="Settings" />
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-white/5 rounded-xl transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="hidden md:block font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 relative overflow-hidden">
                <div className="absolute inset-0 overflow-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

const NavItem = ({ to, icon, label, active }) => {
    const navigate = useNavigate();
    // Simple active check logic
    const isActive = window.location.pathname.startsWith(to);

    return (
        <button
            onClick={() => navigate(to)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
        >
            <div className={`${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-white'}`}>
                {React.cloneElement(icon, { size: 20 })}
            </div>
            <span className="hidden md:block font-medium">{label}</span>
        </button>
    );
};

export default DriverLayout;
