import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProfileScreen() {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>Таны тухай</Text>
                <MaterialCommunityIcons name="account-circle-outline" size={100} color="#555" />

                {/* You can add local user info here if needed */}
                <Text style={styles.infoText}>Энэ апп нь таны төхөөрөмж дээрх мэдээллийг хадгалдаг.</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f0f2f5',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    infoText: {
        fontSize: 16,
        color: '#555',
        marginTop: 30,
        textAlign: 'center',
        lineHeight: 24,
    },
});
