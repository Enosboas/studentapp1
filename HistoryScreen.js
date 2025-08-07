import React, { useState, useCallback, useMemo } from 'react';
import {
    StyleSheet, Text, View, SectionList,
    SafeAreaView, StatusBar, TouchableOpacity,
    Alert, ActivityIndicator, TextInput // 1. Import TextInput
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Animated } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import NetInfo from '@react-native-community/netinfo';
import * as Device from 'expo-device';



export default function HistoryScreen() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [viewMode, setViewMode] = useState('month');
    const [searchQuery, setSearchQuery] = useState('');
    const [zoomedItem, setZoomedItem] = useState(null);
    const [scaleAnim] = useState(new Animated.Value(0));
    const [opacityAnim] = useState(new Animated.Value(0));
    const [refreshing, setRefreshing] = useState(false);
    const deviceId = Device.osInternalBuildId || Device.modelId || Device.deviceName || "UNKNOWN";

    const isSelectionMode = selectedItems.size > 0;

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const stored = await AsyncStorage.getItem('history');
            const parsed = stored ? JSON.parse(stored) : [];
            const parsedWithDate = parsed.map(item => ({
                ...item,
                date: new Date(item.date || item.createdAt || new Date()),
                id: `${item.Code}-${item.createdAt || Date.now()}`
            }));
            setHistory(parsedWithDate);
        } catch (e) {
            console.error("Failed to load history from storage.", e);
            Alert.alert("Алдаа", "Түүхийг ачааллах үед алдаа гарлаа.");
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => { fetchHistory(); }, []));

    const handleRefresh = async () => {
        setRefreshing(true);
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const deviceId = Device.osInternalBuildId || Device.modelId || Device.deviceName || "UNKNOWN";

        try {
            const stored = await AsyncStorage.getItem('history');
            const parsed = stored ? JSON.parse(stored) : [];

            // 1️⃣ Бүх түүх хадгалсан хувь
            const updatedItems = [...parsed];

            // 2️⃣ Зөвхөн оффлайн үед уншсан item-ууд
            const offlineItems = parsed.filter(item => item.tag === 'CT$FS4');

            for (let i = 0; i < offlineItems.length; i++) {
                const item = offlineItems[i];

                if (!item.raw) continue;

                const fullPayload = `"${item.raw}^?${year}^?${month}^?${deviceId}^?CT$FS4"`;

                // 📤 `/api/asset` руу явуулна
                try {
                    await fetch("https://ctsystem.mn/api/asset", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: fullPayload,
                    });
                } catch (e) {
                    console.warn(`❌ [asset] QR ${item.assetCode}:`, e.message);
                }

                // 📥 `/api/details` рүү явуулна
                try {
                    const response = await fetch("https://ctsystem.mn/api/details", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: fullPayload,
                    });

                    const responseText = await response.text();
                    let parsedJson = JSON.parse(responseText);
                    if (typeof parsedJson === 'string') {
                        parsedJson = JSON.parse(parsedJson);
                    }

                    const itemData = Array.isArray(parsedJson) ? parsedJson[0] : parsedJson;

                    // 🔁 Update зөвхөн энэ item дээр
                    const index = updatedItems.findIndex(x =>
                        x.assetCode === item.assetCode && x.serialNumber === item.serialNumber
                    );

                    if (index !== -1) {
                        updatedItems[index] = {
                            ...updatedItems[index],
                            assetName: itemData.name || '[нэр алга]',
                            unitType: itemData.unt || '',
                            handler: itemData.lord || '',
                            account: itemData.dans || item.account,
                            unitPrice: itemData.une?.toString() || item.unitPrice,
                            date: itemData.ognoo || item.date,
                        };
                    }

                } catch (err) {
                    console.warn(`❌ [details] QR ${item.assetCode}:`, err.message);
                }
            }

            // 3️⃣ UI-д харуулах ба хадгалах
            await AsyncStorage.setItem('history', JSON.stringify(updatedItems));

            setHistory(updatedItems.map(item => ({
                ...item,
                date: new Date(item.date),
                id: `${item.assetCode}-${item.serialNumber}-${item.createdAt}`
            })));

            Alert.alert("Шинэчлэгдлээ", "Оффлайн QR мэдээлэл шинэчлэгдлээ.");

        } catch (e) {
            console.error("❌ Refresh Error:", e.message);
            Alert.alert("Алдаа", "Шинэчлэх үед алдаа гарлаа.");
        } finally {
            setRefreshing(false);
        }
    };





    const filteredHistory = useMemo(() => {
        if (!searchQuery) return history;
        const q = searchQuery.toLowerCase();
        return history.filter(item =>
            item.assetCode?.toLowerCase().includes(q) ||
            item.assetName?.toLowerCase().includes(q) ||
            item.handler?.toLowerCase().includes(q)
        );
    }, [history, searchQuery]);

    const handleDeleteSelected = async () => {
        if (selectedItems.size === 0) return;
        const newHistory = history.filter(item => !selectedItems.has(item.id));
        setHistory(newHistory);
        setSearchQuery('');
        setSelectedItems(new Set());
        await AsyncStorage.setItem('history', JSON.stringify(newHistory));
        Alert.alert("Амжилттай", "Сонгосон мэдээллийг устгалаа.");
    };


    const handleExportSelected = async () => {
        const selectedData = history.filter(item => selectedItems.has(item.id));
        if (selectedData.length === 0) {
            Alert.alert("Анхаар!", "Экспортлох мэдээлэл сонгогдоогүй байна.");
            return;
        }

        const exportData = selectedData.map(item => {
            const {
                handler, tag, createdAt, raw, id, assetCode, ...rest
            } = item;
            return {
                ...rest,
                lordID: raw.split('^?')[0],
                Code: item.assetCode
            };
        });

        const jsonString = JSON.stringify(exportData, null, 2);

        try {
            const fileUri = FileSystem.documentDirectory + `qr_selected_export_${Date.now()}.json`;
            await FileSystem.writeAsStringAsync(fileUri, jsonString, { encoding: FileSystem.EncodingType.UTF8 });
            await Sharing.shareAsync(fileUri);
        } catch (error) {
            console.error("Export error:", error);
            Alert.alert("Алдаа", "Экспортлох үед алдаа гарлаа.");
        }
    };


    const handleSelect = (itemId) => {
        const newSelection = new Set(selectedItems);
        newSelection.has(itemId) ? newSelection.delete(itemId) : newSelection.add(itemId);
        setSelectedItems(newSelection);
    };

    const handleSelectAll = () => {
        if (selectedItems.size === filteredHistory.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(filteredHistory.map(item => item.id)));
        }
    };
    const handleZoomItem = (item) => {
        setZoomedItem(item);

        // Reset animations
        scaleAnim.setValue(0.8);
        opacityAnim.setValue(0);

        // Start animation
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            })
        ]).start();
    };
    const closeZoomItem = () => {
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: 0.8,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            })
        ]).start(() => {
            setZoomedItem(null);
        });
    };



    const handleExportFilteredJson = async () => {
        if (filteredHistory.length === 0) {
            Alert.alert("Анхаар!", "Экспортлох хайлтын үр дүн алга байна.");
            return;
        }

        const exportData = filteredHistory.map(item => {
            const {
                handler, tag, createdAt, raw, id, assetCode, ...rest
            } = item;
            return {
                ...rest,
                lordID: raw.split('^?')[0],  // raw-ийн эхний хэсгийг lordID болгоно
                Code: item.assetCode         // assetCode-г code гэж нэрлэнэ
            };
        });

        const jsonString = JSON.stringify(exportData, null, 2);

        try {
            const fileUri = FileSystem.documentDirectory + `qr_filtered_export_${Date.now()}.json`;
            await FileSystem.writeAsStringAsync(fileUri, jsonString, { encoding: FileSystem.EncodingType.UTF8 });
            await Sharing.shareAsync(fileUri);
        } catch (error) {
            console.error("Export error:", error);
            Alert.alert("Алдаа", "Экспортлох үед алдаа гарлаа.");
        }
    };





    const sections = useMemo(() => {
        const grouped = {};
        filteredHistory.forEach(item => {
            if (viewMode === 'month') {
                const year = item.year ?? item.date.getFullYear();
                const month = item.month ?? (item.date.getMonth() + 1);
                const key = `${year}-${month.toString().padStart(2, '0')}`;
                if (!grouped[key]) grouped[key] = { year, month, data: [] };
                grouped[key].data.push(item);
            } else {
                const date = new Date(item.createdAt);
                const title = date.toLocaleDateString('mn-MN', {
                    weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric'
                });
                if (!grouped[title]) grouped[title] = { title, data: [] };
                grouped[title].data.push(item);

            }
        });

        if (viewMode === 'month') {
            const sortedKeys = Object.keys(grouped).sort((a, b) => {
                const [yA, mA] = a.split('-').map(Number);
                const [yB, mB] = b.split('-').map(Number);
                return yB !== yA ? yB - yA : mB - mA;
            });
            return sortedKeys.map(key => ({
                title: `${grouped[key].year} оны ${grouped[key].month}-р сар`,
                data: grouped[key].data
            }));
        } else {
            return Object.values(grouped);
        }
    }, [filteredHistory, viewMode]);

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <View style={styles.header}>
                {isSelectionMode ? (
                    <>
                        <TouchableOpacity onPress={() => setSelectedItems(new Set())}>
                            <Text style={styles.headerButton}>Цуцлах</Text>
                        </TouchableOpacity>
                        <Text style={styles.title}>{selectedItems.size} сонгогдсон</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity onPress={handleSelectAll} style={{ marginRight: 20 }}>
                                <MaterialCommunityIcons
                                    name={selectedItems.size === filteredHistory.length ? 'checkbox-multiple-marked' : 'checkbox-multiple-blank-outline'}
                                    size={24}
                                    color="#3b82f6"
                                />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleExportSelected} style={{ marginRight: 15 }}>
                                <MaterialCommunityIcons name="tray-arrow-down" size={24} color="#10b981" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleDeleteSelected}>
                                <MaterialCommunityIcons name="delete" size={24} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <>
                        <Text style={styles.title}>Түүх ({filteredHistory.length})</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {/* Calendar icon */}
                            <TouchableOpacity onPress={() => setViewMode(viewMode === 'month' ? 'date' : 'month')} style={{ marginRight: 15 }}>
                                <MaterialCommunityIcons name={viewMode === 'month' ? 'calendar-today' : 'calendar-month'} size={24} color="#3b82f6" />
                            </TouchableOpacity>

                            {/* Export icon */}
                            <TouchableOpacity
                                onPress={handleExportFilteredJson}
                            >
                                <MaterialCommunityIcons name="tray-arrow-down" size={24} color="#10b981" />
                            </TouchableOpacity>
                        </View>

                    </>
                )}
            </View>
            {!isSelectionMode && (
                <>
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Хайх (код, нэр, эд хариуцагч...)"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor="#9ca3af"
                        />
                    </View>


                </>
            )}
        </View>
    );

    const renderListItem = ({ item }) => {
        const isSelected = selectedItems.has(item.id);
        return (
            <TouchableOpacity
                style={[styles.listItem, isSelected && styles.listItemSeletected]}
                onLongPress={() => handleZoomItem(item)}
                onPress={() => handleSelect(item.id)}
            >


            <View style={styles.listItemContent}>
                    {isSelectionMode && (
                        <MaterialCommunityIcons
                            name={isSelected ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                            size={24}
                            color={isSelected ? '#3b82f6' : '#888'}
                            style={{ marginRight: 15 }}
                        />
                    )}
                    <View style={{ flex: 1 }}>
                        <Text style={styles.itemText}>
                            {item.handler ? `Эд хариуцагч: ${item.handler}\n` : ''}
                            Хөрөнгийн код: {item.assetCode ?? '—'}{"\n"}
                            {item.assetName ? `Хөрөнгийн нэр: ${item.assetName}\n` : ''}
                            {item.unitType ? `Хэмжих нэгж: ${item.unitType}\n` : ""}
                            Нэгж үнэ: {item.unitPrice ? Number(item.unitPrice).toLocaleString('mn-MN') : '—'} ₮{"\n"}
                            Бүртгэлийн данс: {item.account ?? '—'}{"\n"}
                            А.О.Огноо: {item.date ? new Date(item.date).toLocaleDateString('mn-MN') : '—'}
                        </Text>
                        <Text style={styles.itemDate}>
                            {item.createdAt
                                ? new Date(item.createdAt).toLocaleString('en-GB')
                                : '—'}
                        </Text>

                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return <SafeAreaView style={styles.centered}><ActivityIndicator size="large" color="#3b82f6" /></SafeAreaView>;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            {renderHeader()}
            <View style={{ flex: 1, paddingHorizontal: 10 }}>
                {filteredHistory.length === 0 ? (
                    <View style={styles.centered}>
                        <Text style={styles.emptyText}>
                            {searchQuery ? 'Илэрц олдсонгүй.' : 'Түүх хоосон байна.'}
                        </Text>
                    </View>
                ) : (
                    <SectionList
                        sections={sections}
                        keyExtractor={(item) => item.id}
                        renderItem={renderListItem}
                        renderSectionHeader={({ section: { title } }) => (
                            <Text style={styles.sectionHeader}>{title}</Text>
                        )}
                        stickySectionHeadersEnabled={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        onRefresh={handleRefresh}        // ✅ ЭНЭ НЭМ
                        refreshing={refreshing}
                    />
                )}
            </View>
            {zoomedItem && (
                <Animated.View style={[styles.zoomOverlay, { opacity: opacityAnim }]}>
                    <Animated.View style={[styles.zoomBox, { transform: [{ scale: scaleAnim }] }]}>
                        <Text style={styles.zoomTitle}>Хөрөнгийн дэлгэрэнгүй</Text>
                        <Text style={styles.zoomText}>Код: {zoomedItem.assetCode}</Text>
                        <Text style={styles.zoomText}>Нэр: {zoomedItem.assetName || '—'}</Text>
                        <Text style={styles.zoomText}>Үнэ: {Number(zoomedItem.unitPrice).toLocaleString()} ₮</Text>
                        <Text style={styles.zoomText}>Хэмжих нэгж: {zoomedItem.unitType || '—'}</Text>
                        <Text style={styles.zoomText}>А.О. Огноо: {new Date(zoomedItem.date).toLocaleDateString('mn-MN')}</Text>
                        <Text style={styles.zoomText}>Эд хариуцагч: {zoomedItem.handler || '—'}</Text>

                        <TouchableOpacity onPress={closeZoomItem} style={styles.zoomCloseBtn}>
                            <Text style={styles.zoomCloseText}>Хаах</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </Animated.View>
            )}


        </SafeAreaView>
    );
}

// Styles нь өмнөхтэй ижил байж болно.

// 7. Add and update styles
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f0f2f5' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5' },
    emptyText: { fontSize: 18, fontWeight: 'bold', color: '#555' },
    headerContainer: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    zoomOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },

    zoomBox: {
        backgroundColor: 'white',
        padding: 25,
        borderRadius: 16,
        width: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 10,
    },

    zoomTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },

    zoomText: {
        fontSize: 16,
        marginBottom: 10,
    },

    zoomCloseBtn: {
        marginTop: 20,
        alignSelf: 'center',
        backgroundColor: '#3b82f6',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 8,
    },

    zoomCloseText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 15,         // 👈 Add this line!
        minHeight: 60,             // 👈 Ensure enough height
        backgroundColor: '#fff',
    },

    title: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    headerButton: { fontSize: 16, color: '#3b82f6', fontWeight: '500' },
    searchContainer: {
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 15,
    },
    searchInput: {
        backgroundColor: '#f0f2f5',
        height: 40,
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#111827',
    },
    sectionHeader: {
        paddingVertical: 8,
        paddingHorizontal: 10,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#555',
        backgroundColor: '#f0f2f5',
        textTransform: 'uppercase',
    },
    listItem: {
        backgroundColor: 'white',
        borderRadius: 8,
        marginVertical: 5,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    listItemSeletected: { backgroundColor: '#e0e7ff', borderColor: '#3b82f6', borderWidth: 1.5 },
    listItemContent: { flexDirection: 'row', alignItems: 'center', padding: 15 },
    itemText: { fontSize: 16, color: '#111827', lineHeight: 24 },
    itemDate: { fontSize: 12, color: '#888', marginTop: 8, textAlign: 'right' },
});