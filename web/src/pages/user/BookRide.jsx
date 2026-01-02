import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import MapComponent from '../../components/map/MapComponent';
import { Input, Button } from '../../components/common/UI';
import { MapPin, Navigation, Clock } from 'lucide-react';
import api from '../../api';

const BookingPage = () => {
    const [pickup, setPickup] = useState('');
    const [dropoff, setDropoff] = useState('');
    const [userLocation, setUserLocation] = useState(null);
    const [loading, setLoading] = useState(false);

    // Quick coordinates for demo (Kathmandu)
    const [pickupCoords, setPickupCoords] = useState(null);
    const [dropoffCoords, setDropoffCoords] = useState(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                    // Default pickup to current location
                    setPickupCoords({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => console.error(error)
            );
        }
    }, []);

    const handleSearch = async () => {
        // Implement OSM Geocoding or similar here
        // For now, mocking coordinates offset from current location
        if (userLocation) {
            setDropoffCoords({
                latitude: userLocation.latitude + 0.02,
                longitude: userLocation.longitude + 0.02
            });
        }
    };

    const handleRequestRide = async () => {
        try {
            setLoading(true);
            const bookingData = {
                pickup_location: pickup || "Current Location",
                dropoff_location: dropoff || "Thamel, Kathmandu",
                pickup_latitude: pickupCoords?.latitude || userLocation?.latitude,
                pickup_longitude: pickupCoords?.longitude || userLocation?.longitude,
                dropoff_latitude: dropoffCoords?.latitude || (userLocation?.latitude + 0.01),
                dropoff_longitude: dropoffCoords?.longitude || (userLocation?.longitude + 0.01),
                fare: 250, // Mock fare
                distance: "5 km"
            };

            const response = await api.post('/api/bookings/create', bookingData);
            if (response.data.success) {
                alert('Ride requested successfully! Waiting for drivers...');
            }
        } catch (error) {
            console.error('Ride request error:', error);
            alert('Failed to request ride.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col md:flex-row">
            {/* Booking Panel */}
            <div className="w-full md:w-[400px] bg-card-bg border-r border-white/10 p-6 z-10 flex flex-col justify-center shadow-2xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Where to?</h1>
                    <p className="text-gray-400">Request a ride instantly.</p>
                </div>

                <div className="space-y-4 relative">
                    {/* Connecting Line */}
                    <div className="absolute left-[15px] top-[45px] bottom-[45px] w-[2px] bg-white/10 -z-0"></div>

                    <div className="relative z-10">
                        <Input
                            value={pickup}
                            onChange={(e) => setPickup(e.target.value)}
                            placeholder="Current Location"
                            className="pl-8"
                        />
                        <div className="absolute left-3 top-3.5 w-3 h-3 bg-primary rounded-full border-2 border-black"></div>
                    </div>

                    <div className="relative z-10">
                        <Input
                            value={dropoff}
                            onChange={(e) => setDropoff(e.target.value)}
                            placeholder="Enter Destination"
                            className="pl-8"
                        />
                        <div className="absolute left-3 top-3.5 w-3 h-3 bg-white rounded-sm border-2 border-black"></div>
                    </div>
                </div>

                <Button
                    variant="primary"
                    className="w-full mt-6"
                    onClick={handleRequestRide}
                    disabled={loading}
                >
                    {loading ? 'Requesting...' : 'Confirm Ride'}
                </Button>

                {/* Recent Locations (Mock) */}
                <div className="mt-8">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Recent Places</h3>
                    <div className="space-y-2">
                        <button className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition-colors text-left text-gray-300">
                            <Clock size={16} className="text-gray-500" />
                            <div>
                                <span className="block font-medium text-white">Thamel</span>
                                <span className="text-xs text-gray-500">Kathmandu</span>
                            </div>
                        </button>
                        <button className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition-colors text-left text-gray-300">
                            <Clock size={16} className="text-gray-500" />
                            <div>
                                <span className="block font-medium text-white">Tribhuvan Airport</span>
                                <span className="text-xs text-gray-500">Ring Road</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="flex-1 relative bg-zinc-900">
                <MapComponent
                    driverLocation={userLocation}
                    pickup={pickupCoords}
                    dropoff={dropoffCoords}
                />
            </div>
        </div>
    );
};

export default BookingPage;
