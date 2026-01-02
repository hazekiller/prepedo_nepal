import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import socketService from '../../services/socketService';
import api from '../../api';
import MapComponent from '../../components/map/MapComponent';
import { Button } from '../../components/common/UI';
import { MapPin, Navigation, Clock, CreditCard, RotateCw } from 'lucide-react';

const RequestsPage = () => {
    const { token } = useSelector(state => state.auth);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRide, setSelectedRide] = useState(null);
    const [driverLocation, setDriverLocation] = useState(null);
    const [acceptingId, setAcceptingId] = useState(null);

    // Initial Location & Data Fetch
    useEffect(() => {
        // Get initial location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setDriverLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => console.error('Error getting location:', error)
            );
        }

        fetchRequests();
    }, [token]);

    // Socket Connection
    useEffect(() => {
        if (token) {
            socketService.connect();

            // Listeners
            socketService.on('booking:new', (newBooking) => {
                console.log('🔔 New booking:', newBooking);
                setRequests(prev => {
                    if (prev.some(r => r.id === newBooking.id)) return prev;
                    return [newBooking, ...prev];
                });
            });

            socketService.on('booking:taken', (data) => {
                console.log('🚫 Booking taken:', data.bookingId);
                setRequests(prev => {
                    const newList = prev.filter(r => r.id !== data.bookingId);
                    // Deselect if currently selected side was taken
                    if (selectedRide?.id === data.bookingId) {
                        setSelectedRide(newList.length > 0 ? newList[0] : null);
                    }
                    return newList;
                });
            });

            socketService.on('booking:assigned', (booking) => {
                alert('You have been selected for this ride!');
                // navigate(`/driver/active-ride?rideId=${booking.id}`);
            });

            return () => {
                socketService.disconnect();
                socketService.off('booking:new');
                socketService.off('booking:taken');
                socketService.off('booking:assigned');
            };
        }
    }, [token, selectedRide]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/bookings/available');
            if (response.data.success) {
                const bookings = response.data.data.bookings || response.data.data; // Handle pagination if needed
                setRequests(bookings);
                if (bookings.length > 0) setSelectedRide(bookings[0]);
            }
        } catch (error) {
            console.error('Failed to fetch requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendOffer = async (bookingId) => {
        try {
            setAcceptingId(bookingId);
            const response = await api.post(`/api/bookings/${bookingId}/offer`);
            if (response.data.success) {
                // Update local state to show offer sent
                setRequests(prev => prev.map(req =>
                    req.id === bookingId ? { ...req, offer_sent: true } : req
                ));
                if (selectedRide?.id === bookingId) {
                    setSelectedRide(prev => ({ ...prev, offer_sent: true }));
                }
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to send offer');
        } finally {
            setAcceptingId(null);
        }
    };

    return (
        <div className="h-full flex flex-col md:flex-row">
            {/* List Section */}
            <div className="w-full md:w-[450px] bg-card-bg border-r border-white/10 flex flex-col h-1/2 md:h-full">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Requests</h1>
                        <p className="text-gray-400 text-sm">Available rides near you</p>
                    </div>
                    <button onClick={fetchRequests} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                        <RotateCw className={`w-5 h-5 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {requests.length === 0 && !loading && (
                        <div className="text-center py-20 text-gray-500">
                            <p>No requests found.</p>
                            <p className="text-sm">Waiting for new rides...</p>
                        </div>
                    )}

                    {requests.map(req => (
                        <div
                            key={req.id}
                            onClick={() => setSelectedRide(req)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedRide?.id === req.id
                                    ? 'bg-primary/5 border-primary shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                                    : 'bg-surface border-white/5 hover:border-white/20'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-white">{req.user_name || 'Passenger'}</h3>
                                    <div className="flex items-center gap-1 text-primary text-xs font-semibold mt-1">
                                        <span>4.8 ★</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block text-lg font-bold text-primary">Rs. {req.estimated_fare || req.fare}</span>
                                    <span className="text-xs text-gray-500">Cash</span>
                                </div>
                            </div>

                            <div className="space-y-3 relative">
                                {/* Route Line */}
                                <div className="absolute left-[7px] top-[8px] bottom-[8px] w-[2px] bg-white/10"></div>

                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-4 h-4 rounded-full border-2 border-primary bg-black flex-shrink-0"></div>
                                    <p className="text-sm text-gray-300 truncate">{req.pickup_location || req.pickup}</p>
                                </div>
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-4 h-4 rounded-full border-2 border-red-500 bg-black flex-shrink-0"></div>
                                    <p className="text-sm text-gray-300 truncate">{req.dropoff_location || req.drop}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Map Section */}
            <div className="flex-1 relative bg-black h-1/2 md:h-full">
                <MapComponent
                    driverLocation={driverLocation}
                    pickup={selectedRide ? { latitude: Number(selectedRide.pickup_latitude), longitude: Number(selectedRide.pickup_longitude) } : null}
                    dropoff={selectedRide ? { latitude: Number(selectedRide.dropoff_latitude), longitude: Number(selectedRide.dropoff_longitude) } : null}
                />

                {/* Overlay Action Card for Mobile (Floating) or Desktop (Bottom) */}
                {selectedRide && (
                    <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 bg-black/80 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl z-[1000]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-white">Ride Actions</h3>
                            <span className="text-primary font-bold">Rs. {selectedRide.estimated_fare}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-white/5 p-3 rounded-lg">
                                <span className="text-xs text-gray-400 block mb-1">Distance</span>
                                <span className="text-white font-medium">5.2 km</span>
                            </div>
                            <div className="bg-white/5 p-3 rounded-lg">
                                <span className="text-xs text-gray-400 block mb-1">Duration</span>
                                <span className="text-white font-medium">15 min</span>
                            </div>
                        </div>

                        <Button
                            className="w-full"
                            disabled={acceptingId === selectedRide.id || selectedRide.offer_sent}
                            onClick={() => handleSendOffer(selectedRide.id)}
                        >
                            {acceptingId === selectedRide.id
                                ? 'Sending...'
                                : selectedRide.offer_sent ? 'Offer Sent' : 'Send Offer'
                            }
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequestsPage;
