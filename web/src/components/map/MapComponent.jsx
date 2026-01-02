import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to recenter map when coordinates change
const RecenterMap = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
};

const MapComponent = ({
    driverLocation,
    pickup,
    dropoff,
    height = '100%'
}) => {
    // Default to Kathmandu
    const defaultCenter = [27.7172, 85.3240];
    const center = driverLocation
        ? [driverLocation.latitude, driverLocation.longitude]
        : defaultCenter;

    return (
        <div style={{ height: height, width: '100%', borderRadius: '1rem', overflow: 'hidden' }} className="border border-white/10 z-0">
            <MapContainer
                center={center}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {driverLocation && (
                    <Marker position={[driverLocation.latitude, driverLocation.longitude]}>
                        <Popup>You are here</Popup>
                    </Marker>
                )}

                {pickup && (
                    <Marker position={[pickup.latitude, pickup.longitude]}>
                        <Popup>Pickup Location</Popup>
                    </Marker>
                )}

                {dropoff && (
                    <Marker position={[dropoff.latitude, dropoff.longitude]}>
                        <Popup>Dropoff Location</Popup>
                    </Marker>
                )}

                <RecenterMap center={center} />
            </MapContainer>
        </div>
    );
};

export default MapComponent;
