import React from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { COLORS } from '../../config/colors';

/**
 * A simple Map component that uses OpenStreetMap/Leaflet for the web platform
 * and displays a placeholder for native platforms.
 */
const MapComponent = ({ latitude, longitude, zoom = 13, height = 300 }) => {
    const lat = latitude || 27.7172; // Default to KTM
    const lng = longitude || 85.3240;

    if (Platform.OS === 'web') {
        // Leaflet map embedded via iframe for a free web alternative
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

    return (
        <View style={[styles.container, styles.placeholder, { height }]}>
            <Text style={styles.placeholderText}>
                Map View (Native Placeholder)
            </Text>
            <Text style={styles.coordinates}>
                {lat.toFixed(4)}, {lng.toFixed(4)}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: COLORS.cardBackground,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    coordinates: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginTop: 4,
    },
});

export default MapComponent;
