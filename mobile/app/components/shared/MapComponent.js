import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS } from '../../config/colors';
import { Ionicons } from '@expo/vector-icons';

const MapComponent = ({
    latitude,
    longitude,
    pickup, // { latitude, longitude } (Static Marker)
    dropoff, // { latitude, longitude } (Static Marker)
    driver, // { latitude, longitude } (Moving Marker)
    origin, // { latitude, longitude } (Internal routing origin)
    destination, // { latitude, longitude } (Internal routing destination)
    zoom = 13,
    height = 300,
    onLocationSelect,
    onRouteInfo, // Callback for { distance, duration }
    selectable = false,
    showUserLocation = false,
    selectionType = 'pickup' // 'pickup' or 'dropoff'
}) => {
    const mapRef = useRef(null);
    const [routeCoords, setRouteCoords] = useState([]);
    const [isLoadingRoute, setIsLoadingRoute] = useState(false);

    const [region, setRegion] = useState({
        latitude: latitude || pickup?.latitude || 27.7172,
        longitude: longitude || pickup?.longitude || 85.3240,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });

    useEffect(() => {
        if (latitude && longitude) {
            setRegion(prev => ({
                ...prev,
                latitude,
                longitude
            }));
        }
    }, [latitude, longitude]);


    const fitAllPoints = () => {
        if (!mapRef.current || Platform.OS === 'web') return;

        const points = [];
        if (pickup?.latitude) points.push(pickup);
        if (dropoff?.latitude) points.push(dropoff);
        if (driver?.latitude) points.push(driver);

        if (points.length > 1) {
            mapRef.current.fitToCoordinates(points, {
                edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
                animated: true,
            });
        }
    };

    // Fetch route when points change
    useEffect(() => {
        const start = origin?.latitude ? origin : pickup;
        const end = destination?.latitude ? destination : dropoff;

        if (start?.latitude && end?.latitude) {
            fetchRoute(start, end);
        } else {
            setRouteCoords([]);
        }
    }, [
        origin?.latitude, origin?.longitude,
        destination?.latitude, destination?.longitude,
        pickup?.latitude, pickup?.longitude,
        dropoff?.latitude, dropoff?.longitude
    ]);

    const fetchRoute = async (start, end) => {
        try {
            setIsLoadingRoute(true);
            const url = `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.code === 'Ok' && data.routes?.length > 0) {
                const route = data.routes[0];
                const coords = route.geometry.coordinates.map(c => ({
                    latitude: c[1],
                    longitude: c[0]
                }));

                setRouteCoords(coords);

                if (onRouteInfo) {
                    onRouteInfo({
                        distance: route.distance / 1000,
                        duration: route.duration / 60,
                    });
                }

                setTimeout(fitAllPoints, 200);
            }
        } catch (error) {
            console.error('Error fetching route:', error);
        } finally {
            setIsLoadingRoute(false);
        }
    };

    // Auto-fit when driver moves (occasionally)
    useEffect(() => {
        if (driver?.latitude && !selectable) {
            fitAllPoints();
        }
    }, [driver?.latitude, driver?.longitude]);

    if (Platform.OS === 'web') {
        const lat = region.latitude;
        const lng = region.longitude;
        const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`;

        return (
            <View style={[styles.container, { height }]}>
                <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight="0"
                    marginWidth="0"
                    src={mapUrl}
                    style={{ border: 'none', borderRadius: 12 }}
                />
            </View>
        );
    }

    // Native (iOS/Android)
    try {
        const MapView = require('react-native-maps').default;
        const { Marker, Polyline } = require('react-native-maps');

        return (
            <View style={[styles.container, { height }]}>
                <MapView
                    ref={mapRef}
                    style={{ flex: 1 }}
                    region={region}
                    showsUserLocation={showUserLocation}
                    onRegionChangeComplete={(newRegion) => {
                        if (selectable) {
                            setRegion(newRegion);
                            if (onLocationSelect) {
                                onLocationSelect({
                                    latitude: newRegion.latitude,
                                    longitude: newRegion.longitude
                                });
                            }
                        }
                    }}
                >
                    {/* Only show central marker icon if selectable, otherwise show markers */}
                    {!selectable && !pickup && !dropoff && (
                        <Marker
                            coordinate={{
                                latitude: region.latitude,
                                longitude: region.longitude
                            }}
                            pinColor={COLORS.primary}
                        />
                    )}

                    {pickup?.latitude && (
                        <Marker coordinate={pickup} title="Pickup">
                            <View style={styles.markerContainer}>
                                <Ionicons name="location" size={30} color={COLORS.primary} />
                            </View>
                        </Marker>
                    )}

                    {dropoff?.latitude && (
                        <Marker coordinate={dropoff} title="Drop-off">
                            <View style={styles.markerContainer}>
                                <Ionicons name="flag" size={30} color="#FF4B4B" />
                            </View>
                        </Marker>
                    )}

                    {driver?.latitude && (
                        <Marker coordinate={driver} title="Driver">
                            <View style={styles.markerContainer}>
                                <Ionicons name="car-sport" size={32} color={COLORS.primary} />
                            </View>
                        </Marker>
                    )}

                    {routeCoords.length > 0 && (
                        <Polyline
                            coordinates={routeCoords}
                            strokeWidth={4}
                            strokeColor={COLORS.primary}
                        />
                    )}
                </MapView>

                {selectable && (
                    <View style={styles.centerMarkerContainer} pointerEvents="none">
                        <Ionicons
                            name={selectionType === 'dropoff' ? "flag" : "location"}
                            size={40}
                            color={selectionType === 'dropoff' ? "#FF4B4B" : COLORS.primary}
                        />
                    </View>
                )}

                {isLoadingRoute && (
                    <View style={styles.loader}>
                        <ActivityIndicator color={COLORS.primary} />
                    </View>
                )}
            </View>
        );
    } catch (e) {
        console.warn('react-native-maps not found:', e);
        return (
            <View style={[styles.container, styles.placeholder, { height }]}>
                <Text style={styles.placeholderText}>Map Error</Text>
                <Text style={styles.coordinates}>{region.latitude.toFixed(4)}, {region.longitude.toFixed(4)}</Text>
            </View>
        );
    }
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        borderRadius: 12,
        backgroundColor: '#1a1a1a',
        position: 'relative'
    },
    centerMarkerContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -40,
        marginLeft: -20,
        zIndex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontWeight: 'bold',
        color: '#666',
    },
    coordinates: {
        fontSize: 12,
        color: '#888',
    },
    loader: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 8,
        borderRadius: 20,
    }
});

export default MapComponent;