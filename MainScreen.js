import React, { useState } from 'react';
import {
    StyleSheet, Text, View, TouchableOpacity,
    SafeAreaView, ScrollView, StatusBar, Alert, Modal,
    ActivityIndicator, Vibration, Button
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';

// Firebase
import { db, auth } from './firebase';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import * as Device from 'expo-device';


export default function MainScreen({ navigation }) {
    const [infoText, setInfoText] = useState(null);
    const [loading, setLoading] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [displayYear, setDisplayYear] = useState(new Date().getFullYear());

    const handleBarCodeScanned = ({ data }) => {
        setScanned(true);
        Vibration.vibrate();

        const parts = data.split('^?');
        if (parts.length !== 7 && parts.length !== 9) {
            Alert.alert("QR формат алдаатай", "QR кодын өгөгдөл дутуу эсвэл илүү байна.");
            return;
        }

        const parsed = {
            assetCode: parts[2],
            unitPrice: parts[3],
            account: parts[1],
            date: parts[4],
            raw: data,
        };

        // If extra info exists
        if (parts.length === 9) {
            parsed.handler = parts[7];
            parsed.assetName = parts[8];
        }

        setInfoText(parsed);
    };


    const saveData = async () => {
        if (!infoText || !infoText.raw) {
            Alert.alert('Хоосон мэдээлэл', 'Хадгалах мэдээлэл олдсонгүй.');
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            Alert.alert("Нэвтрээгүй", "Та нэвтэрч орно уу.");
            return;
        }

        setLoading(true);

        try {
            const deviceId = Device.osInternalBuildId || Device.modelId || Device.deviceName || "UNKNOWN";

            // Create modified string for API
            const fullPayload = `${infoText.raw}^?${deviceId}^?CT$FS4`;

            // 1. Save to Firebase (structured format)
            await addDoc(collection(db, "users", user.uid, "history"), {
                ...infoText,
                deviceId,
                tag: "CT$FS4",
                createdAt: serverTimestamp()
            });

            // 2. Send to API
            await fetch("https://your-api-url.com/endpoint", {
                method: "POST",
                headers: { "Content-Type": "text/plain" },
                body: fullPayload
            });

            Alert.alert('Амжилттай', 'Мэдээллийг хадгаллаа.');
            setInfoText(null);
            setScanned(false);
        } catch (e) {
            console.error("Error saving data: ", e);
            Alert.alert('Алдаа', 'Мэдээллийг хадгалах үед алдаа гарлаа.');
        } finally {
            setLoading(false);
        }
    };


    const handleMonthSelect = (monthIndex) => {
        const newDate = new Date(displayYear, monthIndex);
        setSelectedDate(newDate);
        setIsModalVisible(false);
    };

    const MonthPickerModal = () => {
        const months = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
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

    if (!permission) return <View />;
    if (!permission.granted) {
        return (
            <View style={styles.centerText}>
                <Text style={{ textAlign: 'center', marginBottom: 10 }}>Camera permission is required.</Text>
                <Button onPress={requestPermission} title="Grant Permission" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <MonthPickerModal />
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.cameraContainer}>
                    <CameraView
                        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                        style={StyleSheet.absoluteFillObject}
                    />
                    {scanned && (
                        <TouchableOpacity style={styles.rescanButton} onPress={() => setScanned(false)}>
                            <MaterialCommunityIcons name="qrcode-scan" size={40} color="#fff" />
                            <Text style={styles.rescanButtonText}>Дахин унших</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.dateButton} onPress={() => {
                        setDisplayYear(selectedDate.getFullYear());
                        setIsModalVisible(true);
                    }}>
                        <Text style={styles.buttonText}>
                            {selectedDate.toLocaleString('mn-MN', { month: 'long', year: 'numeric' })}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveButton} onPress={saveData} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Хадгалах</Text>}
                    </TouchableOpacity>
                </View>



                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Мэдээлэл</Text>
                    {infoText ? (
                        <Text style={styles.infoFormatted}>
                            {infoText.handler && `Эд хариуцагч: ${infoText.handler}\n`}
                            Хөрөнгийн код: {infoText.assetCode}{"\n"}
                            {infoText.assetName && `Хөрөнгийн нэр: ${infoText.assetName}\n`}
                            Нэгж үнэ: {infoText.unitPrice} ₮{"\n"}
                            Бүртгэлийн данс: {infoText.account}{"\n"}
                            А.О.Огноо: {infoText.date}
                        </Text>
                    ) : (
                        <Text style={styles.placeholderText}>QR уншуулсан мэдээлэл энд харагдана.</Text>
                    )}
                </View>



            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f0f2f5' },
    container: { flexGrow: 1, alignItems: 'center', padding: 20 },
    cameraContainer: {
        width: 250,
        height: 250,
        overflow: 'hidden',
        borderRadius: 10,
        borderWidth: 3,
        borderColor: '#5dade2',
        marginBottom: 30,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
    },
    dateButton: {
        flex: 1,
        marginRight: 10,
        backgroundColor: '#5dade2',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center'
    },

    rescanButton: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
    rescanButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
    },
    centerText: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },

    saveButton: {
        flex: 1,
        marginLeft: 10,
        backgroundColor: '#34d399',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    infoBox: {
        width: '100%', borderColor: '#5dade2',
        borderWidth: 2, borderRadius: 10,
        padding: 15, backgroundColor: '#ffffff',
        marginBottom: 20
    },
    infoTitle: {
        fontSize: 20, fontWeight: 'bold',
        textAlign: 'center', marginBottom: 10, color: '#333'
    },
    infoFormatted: { fontSize: 16, color: '#333', lineHeight: 26 },
    placeholderText: { color: '#999', fontStyle: 'italic' },
    modalContainer: {
        flex: 1, justifyContent: 'center',
        alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '85%', backgroundColor: 'white',
        borderRadius: 10, padding: 20, alignItems: 'center',
    },
    yearHeader: {
        width: '100%', flexDirection: 'row',
        justifyContent: 'space-between', alignItems: 'center', marginBottom: 15,
    },
    modalTitle: { fontSize: 22, fontWeight: 'bold' },
    monthItem: {
        width: '100%', paddingVertical: 10,
        alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee',
    },
    monthText: { fontSize: 18, color: '#3b82f6' },
    disabledMonthText: { color: '#ccc' },
    closeButton: {
        marginTop: 20, backgroundColor: '#ef4444',
        paddingVertical: 10, paddingHorizontal: 30, borderRadius: 8,
    },
    closeButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
