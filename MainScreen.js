import React, { useState, useEffect } from 'react';
import {
    StyleSheet, Text, View, TextInput, TouchableOpacity,
    SafeAreaView, ScrollView, StatusBar, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import the icon library
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function MainScreen({ navigation, route }) {
    const [infoText, setInfoText] = useState('');
    const STORAGE_KEY = '@scanned_data_list';

    useEffect(() => {
        if (route.params?.scannedData) {
            setInfoText(route.params.scannedData);
        }
    }, [route.params?.scannedData]);

    const saveData = async () => {
        if (infoText.trim() === '') {
            Alert.alert('Хоосон', 'Хадгалах мэдээлэл байхгүй байна.');
            return;
        }
        try {
            const existingData = await AsyncStorage.getItem(STORAGE_KEY);
            const dataList = existingData ? JSON.parse(existingData) : [];
            const newData = {
                id: Date.now(),
                text: infoText,
                date: new Date().toISOString(),
            };
            dataList.push(newData);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataList));
            Alert.alert('Амжилттай', 'Мэдээллийг амжилттай хадгаллаа.');
            setInfoText('');
        } catch (e) {
            console.error(e);
            Alert.alert('Алдаа', 'Хадгалах явцад алдаа гарлаа.');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <ScrollView contentContainerStyle={styles.container}>
                {/* --- THIS IS THE MAIN CHANGE --- */}
                {/* The black square is now a touchable button that navigates to the QR Scanner */}
                <TouchableOpacity
                    style={styles.imagePlaceholder}
                    onPress={() => navigation.navigate('QRScannerScreen')}
                >
                    <MaterialCommunityIcons name="qrcode-scan" size={80} color="#fff" />
                    <Text style={styles.placeholderText}>Scan QR Code</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>6-р сар</Text>
                </TouchableOpacity>

                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Мэдээлэл</Text>
                    <TextInput
                        style={styles.infoInput}
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                        value={infoText}
                        onChangeText={setInfoText}
                        placeholder="QR кодоос уншсан мэдээлэл энд харагдана..."
                    />
                </View>

                <TouchableOpacity style={styles.button} onPress={saveData}>
                    <Text style={styles.buttonText}>Хадгалах</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f0f2f5' },
    container: { flexGrow: 1, alignItems: 'center', padding: 20 },
    // Updated style for the placeholder to center the icon and text
    imagePlaceholder: {
        width: 200,
        height: 200,
        backgroundColor: '#000000',
        borderRadius: 10,
        borderWidth: 3,
        borderColor: '#5dade2',
        marginBottom: 30,
        // Added to center content
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#fff',
        marginTop: 10,
        fontSize: 16,
        fontWeight: 'bold',
    },
    button: { width: '100%', backgroundColor: '#5dade2', paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
    buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
    infoBox: { width: '100%', borderColor: '#5dade2', borderWidth: 2, borderRadius: 10, padding: 15, backgroundColor: '#ffffff', marginBottom: 20 },
    infoTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#333' },
    infoInput: { height: 150, fontSize: 16, color: '#333' },
});