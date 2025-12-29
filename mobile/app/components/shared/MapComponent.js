import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS } from '../../config/colors';

const MapComponent = ({
    latitude,
    longitude,
    pickup,
    dropoff,
    driver,
    origin,
    destination,
    zoom = 13,
    height = 300,
    onLocationSelect,
    onRouteInfo,
    selectable = false,
    selectionType = 'pickup'
}) => {
    const webViewRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [routeCoords, setRouteCoords] = useState([]);

    // Initial region
    const initialLat = latitude || pickup?.latitude || origin?.latitude || 27.7172;
    const initialLng = longitude || pickup?.longitude || origin?.longitude || 85.3240;

    // Fetch route via OSRM
    useEffect(() => {
        const fetchRoute = async () => {
            // Use origin/destination if provided, else fallback to pickup/dropoff
            const start = origin || pickup;
            const end = destination || dropoff;

            if (start?.latitude && end?.latitude) {
                try {
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
                    }
                } catch (error) {
                    console.error('Error fetching route:', error);
                }
            } else {
                setRouteCoords([]);
            }
        };

        fetchRoute();
    }, [
        origin?.latitude, origin?.longitude,
        destination?.latitude, destination?.longitude,
        pickup?.latitude, pickup?.longitude,
        dropoff?.latitude, dropoff?.longitude
    ]);

    const htmlContent = useMemo(() => `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <style>
                body { margin: 0; padding: 0; background: #1a1a1a; }
                #map { height: 100vh; width: 100vw; }
                .leaflet-container { background: #1a1a1a; }
                .leaflet-tile { filter: invert(100%) hue-rotate(180deg) brightness(0.6) contrast(0.9); }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script>
                var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([${initialLat}, ${initialLng}], ${zoom});
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

                var markers = {};
                var routeLayer;

                function updateMap(data) {
                    if (markers.pickup) map.removeLayer(markers.pickup);
                    if (markers.dropoff) map.removeLayer(markers.dropoff);
                    if (markers.driver) map.removeLayer(markers.driver);
                    if (routeLayer) map.removeLayer(routeLayer);

                    var points = [];

                    if (data.pickup && data.pickup.latitude) {
                        markers.pickup = L.marker([data.pickup.latitude, data.pickup.longitude], {
                            icon: L.divIcon({
                                html: '<div style="background:${COLORS.primary};width:12px;height:12px;border-radius:6px;border:2px solid white;box-shadow:0 0 10px ${COLORS.primary}"></div>',
                                iconSize: [12, 12]
                            })
                        }).addTo(map);
                        points.push([data.pickup.latitude, data.pickup.longitude]);
                    }

                    if (data.dropoff && data.dropoff.latitude) {
                        markers.dropoff = L.marker([data.dropoff.latitude, data.dropoff.longitude], {
                            icon: L.divIcon({
                                html: '<div style="background:#FF4B4B;width:12px;height:12px;border-radius:6px;border:2px solid white;box-shadow:0 0 10px #FF4B4B"></div>',
                                iconSize: [12, 12]
                            })
                        }).addTo(map);
                        points.push([data.dropoff.latitude, data.dropoff.longitude]);
                    }

                    if (data.driver && data.driver.latitude) {
                        markers.driver = L.marker([data.driver.latitude, data.driver.longitude], {
                            icon: L.divIcon({
                                html: '<div style="font-size:24px;filter:drop-shadow(0 0 5px ${COLORS.primary})">🚗</div>',
                                iconSize: [24, 24],
                                iconAnchor: [12, 12]
                            })
                        }).addTo(map);
                        points.push([data.driver.latitude, data.driver.longitude]);
                    }

                    if (data.route && data.route.length > 0) {
                        routeLayer = L.polyline(data.route.map(c => [c.latitude, c.longitude]), {
                            color: '${COLORS.primary}',
                            weight: 5,
                            opacity: 0.8,
                            lineCap: 'round',
                            lineJoin: 'round'
                        }).addTo(map);
                        if (!${selectable}) map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] });
                    } else if (points.length > 1 && !${selectable}) {
                        map.fitBounds(points, { padding: [50, 50] });
                    }
                }

                if (${selectable}) {
                    map.on('moveend', function() {
                        var center = map.getCenter();
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'onLocationSelect',
                            latitude: center.lat,
                            longitude: center.lng
                        }));
                    });
                }

                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'onLoaded' }));
            </script>
        </body>
        </html>
    `, [COLORS.primary, selectable]);

    useEffect(() => {
        if (isLoaded && webViewRef.current) {
            const data = { pickup, dropoff, driver, route: routeCoords };
            webViewRef.current.injectJavaScript(`updateMap(${JSON.stringify(data)}); true;`);
        }
    }, [pickup, dropoff, driver, routeCoords, isLoaded]);

    useEffect(() => {
        if (isLoaded && webViewRef.current && (latitude || longitude)) {
            webViewRef.current.injectJavaScript(`map.setView([${latitude}, ${longitude}]); true;`);
        }
    }, [latitude, longitude, isLoaded]);

    return (
        <View style={[styles.container, { height }]}>
            <WebView
                ref={webViewRef}
                style={styles.webview}
                source={{ html: htmlContent }}
                onMessage={(e) => {
                    try {
                        const data = JSON.parse(e.nativeEvent.data);
                        if (data.type === 'onLoaded') setIsLoaded(true);
                        if (data.type === 'onLocationSelect' && onLocationSelect) onLocationSelect(data);
                    } catch (err) { }
                }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                scrollEnabled={false}
                originWhitelist={['*']}
            />
            {selectable && (
                <View style={[styles.centerMarker, { top: height / 2 - 40 }]} pointerEvents="none">
                    <Text style={{ fontSize: 40, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 4 }}>
                        {selectionType === 'dropoff' ? '🏁' : '📍'}
                    </Text>
                </View>
            )}
            {!isLoaded && (
                <View style={styles.loader}>
                    <ActivityIndicator color={COLORS.primary} size="large" />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { overflow: 'hidden', borderRadius: 20, backgroundColor: '#1a1a1a', position: 'relative', borderWidth: 1, borderColor: '#333' },
    webview: { flex: 1, backgroundColor: 'transparent' },
    centerMarker: { position: 'absolute', left: '50%', marginLeft: -20, zIndex: 10 },
    loader: { ...StyleSheet.absoluteFillObject, backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center', zIndex: 20 }
});

export default MapComponent;