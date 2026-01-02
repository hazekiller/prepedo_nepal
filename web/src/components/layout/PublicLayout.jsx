import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';
import { Car, Menu, X, Facebook, Instagram, Twitter, Phone, Mail, LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from '../common/UI';

const PublicLayout = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector(state => state.auth);

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col font-sans">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-tr from-primary to-primary-light rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                                <Car className="w-6 h-6 text-black" />
                            </div>
                            <span className="font-bold text-2xl tracking-tighter">Prepedo</span>
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-8">
                            <Link to="/" className="text-gray-300 hover:text-primary transition-colors font-medium">Home</Link>
                            <Link to="/about" className="text-gray-300 hover:text-primary transition-colors font-medium">About Us</Link>
                            <Link to="/contact" className="text-gray-300 hover:text-primary transition-colors font-medium">Contact</Link>
                            <Link to="/safety" className="text-gray-300 hover:text-primary transition-colors font-medium">Safety</Link>
                        </div>

                        <div className="hidden md:flex items-center gap-4">
                            {isAuthenticated ? (
                                <>
                                    {user?.role === 'admin' && (
                                        <Button
                                            onClick={() => navigate('/admin/dashboard')}
                                            className="!py-2 !px-4 flex items-center gap-2 !bg-zinc-800 hover:!bg-zinc-700 !text-white border border-white/10"
                                        >
                                            <LayoutDashboard size={16} /> Admin Panel
                                        </Button>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                        title="Logout"
                                    >
                                        <LogOut size={20} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="text-sm text-gray-500 hover:text-white font-medium mr-2">Login</Link>
                                    <Button onClick={() => window.location.href = '#download'} className="!py-2 !px-4">Download App</Button>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
                                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Flyout */}
                {isMenuOpen && (
                    <div className="md:hidden bg-black border-b border-white/10 absolute w-full h-screen">
                        <div className="px-6 pt-8 pb-6 space-y-6 flex flex-col items-center text-center">
                            <Link to="/" className="text-2xl font-medium text-white" onClick={() => setIsMenuOpen(false)}>Home</Link>
                            <Link to="/about" className="text-2xl font-medium text-gray-400" onClick={() => setIsMenuOpen(false)}>About</Link>
                            <Link to="/contact" className="text-2xl font-medium text-gray-400" onClick={() => setIsMenuOpen(false)}>Contact</Link>

                            <div className="w-full h-px bg-white/10 my-4"></div>

                            {isAuthenticated ? (
                                <>
                                    {user?.role === 'admin' && (
                                        <Link to="/admin/dashboard" className="text-2xl font-medium text-primary" onClick={() => setIsMenuOpen(false)}>Admin Dashboard</Link>
                                    )}
                                    <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="text-2xl font-medium text-red-500">Logout</button>
                                </>
                            ) : (
                                <Link to="/login" className="text-2xl font-medium text-gray-400" onClick={() => setIsMenuOpen(false)}>Login</Link>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="flex-1">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-zinc-900 border-t border-white/10 pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                    <Car className="w-5 h-5 text-black" />
                                </div>
                                <span className="font-bold text-xl">Prepedo</span>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Redefining urban mobility in Nepal. Safe, reliable, and premium ride-sharing for everyone.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold text-white mb-4">Company</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
                                <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                                <li><Link to="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
                                <li><Link to="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-white mb-4">Support</h3>
                            <ul className="space-y-4 text-gray-400">
                                <li className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-primary" />
                                    <span>+977 9800000000</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-primary" />
                                    <span>support@prepedo.com</span>
                                </li>
                                <li><Link to="/safety" className="hover:text-primary transition-colors">Safety Center</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-white mb-4">Follow Us</h3>
                            <div className="flex gap-4">
                                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-black transition-all">
                                    <Facebook size={18} />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-black transition-all">
                                    <Instagram size={18} />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-black transition-all">
                                    <Twitter size={18} />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                        <p>&copy; {new Date().getFullYear()} Prepedo Nepal. All rights reserved.</p>
                        <div className="flex gap-6">
                            <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
                            <Link to="/terms" className="hover:text-white">Terms of Service</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PublicLayout;
