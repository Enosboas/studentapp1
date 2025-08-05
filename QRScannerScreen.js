import React, { useState } from 'react';
import { Text, View, StyleSheet, Button, Linking } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function QRScannerScreen({ navigation }) {
    // Use the modern hook for permissions. It provides more details.
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    const handleBarCodeScanned = (scanningResult) => {
        if (scanningResult.data) {
            setScanned(true);
            navigation.navigate({
                name: 'MainScreen',
                params: { scannedData: scanningResult.data },
                merge: true,
            });
        }
    };

    // If permissions are still loading, show a loading message.
    if (!permission) {
        return <View />;
    }

    // If permissions have not been granted yet.
    if (!permission.granted) {
        return (
            <View style={styles.centerText}>
                <Text style={{ textAlign: 'center', marginBottom: 20 }}>
                    We need your permission to use the camera for scanning QR codes.
                </Text>
                {/* This button allows the user to trigger the permission dialog. */}
                <Button onPress={requestPermission} title="Grant Permission" />
            </View>
        );
    }

    // If permission was explicitly denied by the user.
    if (!permission.granted && permission.canAskAgain === false) {
        return (
            <View style={styles.centerText}>
                <Text style={{ textAlign: 'center', marginBottom: 20 }}>
                    Camera permission has been permanently denied. Please go to your device settings to enable it.
                </Text>
                {/* This button opens the app settings on the user's phone. */}
                <Button onPress={() => Linking.openSettings()} title="Open Settings" />
            </View>
        );
    }

    // If we have permission, show the camera.
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

// --- Styles ---
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
        padding: 20,
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
