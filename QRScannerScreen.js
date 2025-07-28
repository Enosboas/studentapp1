import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { CameraView } from 'expo-camera';

export default function QRScannerScreen({ navigation }) {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        const getCameraPermissions = async () => {
            const { status } = await CameraView.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        };
        getCameraPermissions();
    }, []);

    const handleBarCodeScanned = (scanningResult) => {
        if (scanningResult.data) {
            setScanned(true);
            // --- THIS IS THE MAIN CHANGE ---
            // Navigate back to the previous screen (MainScreen) and merge the new data
            // into its parameters. This is a cleaner way to return data.
            navigation.navigate({
                name: 'MainScreen',
                params: { scannedData: scanningResult.data },
                merge: true,
            });
        }
    };

    if (hasPermission === null) {
        return <View style={styles.centerText}><Text>Requesting for camera permission...</Text></View>;
    }
    if (hasPermission === false) {
        return <View style={styles.centerText}><Text>No access to camera. Please enable it in your settings.</Text></View>;
    }

    return (
        <View style={styles.container}>
            <CameraView
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
                style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.overlay}>
                <View style={styles.unfocused} />
                <View style={styles.focused} />
                <View style={styles.unfocused} />
            </View>
            {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
        </View>
    );
}

// --- Styles (no changes needed here) ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    centerText: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    unfocused: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    focused: {
        flex: 2,
        borderColor: '#fff',
        borderWidth: 2,
        borderRadius: 10,
    },
});