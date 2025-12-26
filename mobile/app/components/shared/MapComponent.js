import React from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { COLORS } from '../../config/colors';

const MapComponent = ({ latitude, longitude, zoom = 13, height = 300 }) => {
    const lat = latitude || 27.7172; 
    const lng = longitude || 85.3240;

    if (Platform.OS === 'web') {
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
        const { Marker } = require('react-native-maps');

        return (
            <View style={[styles.container, { height }]}>
                <MapView
                    style={{ flex: 1 }}
                    initialRegion={{
                        latitude: lat,
                        longitude: lng,
                        latitudeDelta: 0.02,
                        longitudeDelta: 0.02,
                    }}
                >
                    <Marker coordinate={{ latitude: lat, longitude: lng }} pinColor={COLORS.primary} />
                </MapView>
            </View>
        );
    } catch (e) {
        console.warn('react-native-maps not found:', e);
        return (
            <View style={[styles.container, styles.placeholder, { height }]}>
                <Text style={styles.placeholderText}>Map Error</Text>
                <Text style={styles.coordinates}>{lat.toFixed(4)}, {lng.toFixed(4)}</Text>
            </View>
        );
    }
}; // <--- Added missing closing brace here

// Define your styles (make sure this exists)
const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        borderRadius: 12,
        backgroundColor: '#e0e0e0',
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
    }
});

export default MapComponent; // <--- Moved outside the function