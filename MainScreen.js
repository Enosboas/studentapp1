import React, { useState } from 'react';
import {
    StyleSheet, Text, View, TouchableOpacity,
    SafeAreaView, ScrollView, StatusBar, Alert, Modal,
    ActivityIndicator, Vibration, Button
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
        if (scanned) {
            return;
        }
        setScanned(true);
        Vibration.vibrate();

        const parts = data.split('^?');
        if (parts.length !== 7 && parts.length !== 9) {
            Alert.alert("QR формат алдаатай", "QR кодын өгөгдөл дутуу эсвэл илүү байна.");
            setScanned(false);
            return;
        }

        const parsed = {
            assetCode: parts[2],
            unitPrice: parts[3],
            account: parts[1],
            date: parts[4],
            raw: data,
        };

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

        setLoading(true);

        try {
            const deviceId = Device.osInternalBuildId || Device.modelId || Device.deviceName || "UNKNOWN";

            // --- FIXED: Include the selected year and month in the saved record ---
            const newRecord = {
                id: Date.now().toString(),
                ...infoText,
                deviceId,
                tag: "CT$FS4",
                createdAt: new Date().toISOString(),
                year: selectedDate.getFullYear(),
                month: selectedDate.getMonth() + 1,
            };

            const existingHistoryJSON = await AsyncStorage.getItem('scanHistory');
            const existingHistory = existingHistoryJSON ? JSON.parse(existingHistoryJSON) : [];
            const updatedHistory = [...existingHistory, newRecord];
            await AsyncStorage.setItem('scanHistory', JSON.stringify(updatedHistory));

            Alert.alert('Амжилттай', 'Мэдээллийг төхөөрөмжид хадгаллаа.');
            setInfoText(null);
            setScanned(false);
        } catch (e) {
            console.error("Error saving data to AsyncStorage: ", e);
            Alert.alert('Алдаа', `Мэдээллийг хадгалах үед алдаа гарлаа: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleMonthSelect = (monthIndex) => {
        const newDate = new Date(displayYear, monthIndex, 1);
        setSelectedDate(newDate);
        setIsModalVisible(false);
    };

    const MonthPickerModal = () => {
        const months = ["1-р сар", "2-р сар", "3-р сар", "4-р сар", "5-р сар", "6-р сар",
            "7-р сар", "8-р сар", "9-р сар", "10-р сар", "11-р сар", "12-р сар"];
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
                            <Text style={styles.modalTitle}>{displayYear} он</Text>
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
                            <Text style={styles.closeButtonText}>Хаах</Text>
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
                <Text style={{ textAlign: 'center', marginBottom: 10 }}>Камер ашиглахын тулд зөвшөөрөл олгоно уу.</Text>
                <Button onPress={requestPermission} title="Зөвшөөрөх" />
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
                        <TouchableOpacity style={styles.rescanButton} onPress={() => {
                            setInfoText(null);
                            setScanned(false);
                        }}>
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
                            {`${selectedDate.getFullYear()} оны ${selectedDate.getMonth() + 1}-р сар`}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveButton} onPress={saveData} disabled={loading || !infoText}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Хадгалах</Text>}
                    </TouchableOpacity>
                </View>

                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Мэдээлэл</Text>
                    {infoText ? (
                        <View>
                            {infoText.handler && <Text style={styles.infoRow}><Text style={styles.infoLabel}>Эд хариуцагч:</Text> {infoText.handler}</Text>}
                            <Text style={styles.infoRow}><Text style={styles.infoLabel}>Хөрөнгийн код:</Text> {infoText.assetCode}</Text>
                            {infoText.assetName && <Text style={styles.infoRow}><Text style={styles.infoLabel}>Хөрөнгийн нэр:</Text> {infoText.assetName}</Text>}
                            <Text style={styles.infoRow}><Text style={styles.infoLabel}>Нэгж үнэ:</Text> {infoText.unitPrice} ₮</Text>
                            <Text style={styles.infoRow}><Text style={styles.infoLabel}>Бүртгэлийн данс:</Text> {infoText.account}</Text>
                            <Text style={styles.infoRow}><Text style={styles.infoLabel}>А.О.Огноо:</Text> {infoText.date}</Text>
                        </View>
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
        width: '100%',
        borderColor: '#5dade2',
        borderWidth: 2,
        borderRadius: 10,
        padding: 15,
        backgroundColor: '#ffffff',
        marginBottom: 20,
        justifyContent: 'flex-start',
    },
    infoTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#333'
    },
    infoRow: {
        fontSize: 16,
        color: '#333',
        lineHeight: 26,
    },
    infoLabel: {
        fontWeight: 'bold',
    },
    placeholderText: {
        color: '#999',
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 20,
    },
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
