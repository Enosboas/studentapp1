import React, { useState, useEffect } from 'react';
import {
    StyleSheet, Text, View, TextInput, TouchableOpacity,
    SafeAreaView, ScrollView, StatusBar, Alert, Modal, ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// --- Firebase Imports ---
import { db, auth } from './firebase'; // Import your db and auth objects
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function MainScreen({ navigation, route }) {
    const [infoText, setInfoText] = useState('');
    const [loading, setLoading] = useState(false);

    // The modal logic can remain the same if you still want to manually select a date.
    // However, using serverTimestamp is more reliable.
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [displayYear, setDisplayYear] = useState(new Date().getFullYear());

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

        // Get the currently logged-in user from Firebase Auth
        const user = auth.currentUser;
        if (!user) {
            Alert.alert("Authentication Error", "You must be logged in to save data.");
            // Optionally navigate to login screen
            // navigation.navigate('LoginScreen');
            return;
        }

        setLoading(true);
        try {
            // --- Save Data to Firestore ---
            // This creates a document in a subcollection 'history' under the user's ID
            // ensuring that each user's data is private.
            const docRef = await addDoc(collection(db, "users", user.uid, "history"), {
                text: infoText,
                // serverTimestamp provides a reliable, server-generated date
                createdAt: serverTimestamp()
            });

            Alert.alert('Амжилттай', 'Мэдээллийг амжилттай хадгаллаа.');
            setInfoText(''); // Clear input after saving
        } catch (e) {
            console.error("Error adding document: ", e);
            Alert.alert('Алдаа', 'Мэдээлэл хадгалж чадсангүй.');
        } finally {
            setLoading(false);
        }
    };

    // --- Month Picker Modal (No changes needed here) ---
    const handleMonthSelect = (monthIndex) => {
        const newDate = new Date(displayYear, monthIndex);
        setSelectedDate(newDate);
        setIsModalVisible(false);
    };

    const MonthPickerModal = () => {
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();

        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.yearHeader}>
                            <TouchableOpacity onPress={() => setDisplayYear(displayYear - 1)}>
                                <MaterialCommunityIcons name="chevron-left" size={32} color="#3b82f6" />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>{displayYear}</Text>
                            <TouchableOpacity
                                disabled={displayYear >= currentYear}
                                onPress={() => setDisplayYear(displayYear + 1)}
                            >
                                <MaterialCommunityIcons
                                    name="chevron-right"
                                    size={32}
                                    color={displayYear >= currentYear ? '#ccc' : '#3b82f6'}
                                />
                            </TouchableOpacity>
                        </View>
                        {months.map((month, index) => {
                            const isFutureMonth = displayYear === currentYear && index > currentMonth;
                            return (
                                <TouchableOpacity
                                    key={month}
                                    style={styles.monthItem}
                                    disabled={isFutureMonth}
                                    onPress={() => handleMonthSelect(index)}
                                >
                                    <Text style={[styles.monthText, isFutureMonth && styles.disabledMonthText]}>
                                        {month}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => {
                                setIsModalVisible(false);
                                setDisplayYear(selectedDate.getFullYear());
                            }}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    };


    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <MonthPickerModal />
            <ScrollView contentContainerStyle={styles.container}>
                <TouchableOpacity
                    style={styles.imagePlaceholder}
                    onPress={() => navigation.navigate('QRScannerScreen')}
                >
                    <MaterialCommunityIcons name="qrcode-scan" size={80} color="#fff" />
                    <Text style={styles.placeholderText}>Scan QR Code</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={() => {
                    setDisplayYear(selectedDate.getFullYear());
                    setIsModalVisible(true);
                }}>
                    <Text style={styles.buttonText}>
                        {selectedDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                    </Text>
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

                <TouchableOpacity style={styles.button} onPress={saveData} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Хадгалах</Text>}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

// --- Styles (no changes needed) ---
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f0f2f5' },
    container: { flexGrow: 1, alignItems: 'center', padding: 20 },
    imagePlaceholder: {
        width: 200, height: 200, backgroundColor: '#000000',
        borderRadius: 10, borderWidth: 3, borderColor: '#5dade2',
        marginBottom: 30, justifyContent: 'center', alignItems: 'center',
    },
    placeholderText: { color: '#fff', marginTop: 10, fontSize: 16, fontWeight: 'bold' },
    button: { width: '100%', backgroundColor: '#5dade2', paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
    buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
    infoBox: { width: '100%', borderColor: '#5dade2', borderWidth: 2, borderRadius: 10, padding: 15, backgroundColor: '#ffffff', marginBottom: 20 },
    infoTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#333' },
    infoInput: { height: 150, fontSize: 16, color: '#333' },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    yearHeader: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    monthItem: {
        width: '100%',
        paddingVertical: 10,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    monthText: {
        fontSize: 18,
        color: '#3b82f6',
    },
    disabledMonthText: {
        color: '#ccc',
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: '#ef4444',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
