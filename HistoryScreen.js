import React, { useState, useCallback, useMemo } from 'react';
import {
    StyleSheet, Text, View, SectionList,
    SafeAreaView, StatusBar, TouchableOpacity, Alert, ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HistoryScreen() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [viewMode, setViewMode] = useState('month');

    const isSelectionMode = selectedItems.size > 0;

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const historyJSON = await AsyncStorage.getItem('scanHistory');
            if (historyJSON) {
                const parsedHistory = JSON.parse(historyJSON);
                const historyWithDates = parsedHistory.map(item => ({
                    ...item,
                    savedAt: item.createdAt ? new Date(item.createdAt) : null
                }));
                historyWithDates.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
                setHistory(historyWithDates);
            } else {
                setHistory([]);
            }
        } catch (e) {
            console.error("Failed to load history from AsyncStorage.", e);
            Alert.alert("Алдаа", "Түүх уншихад алдаа гарлаа.");
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => {
        fetchHistory();
    }, []));

    const handleDeleteSelected = async () => {
        if (selectedItems.size === 0) return;

        try {
            const updatedHistory = history.filter(item => !selectedItems.has(item.id));
            await AsyncStorage.setItem('scanHistory', JSON.stringify(updatedHistory));
            setHistory(updatedHistory);
            setSelectedItems(new Set());
            Alert.alert("Амжилттай", "Сонгосон мэдээллийг устгалаа.");
        } catch (e) {
            console.error("Failed to delete items from AsyncStorage.", e);
            Alert.alert("Алдаа", "Мэдээлэл устгахад алдаа гарлаа.");
        }
    };

    const handleSelect = (itemId) => {
        const newSelection = new Set(selectedItems);
        newSelection.has(itemId) ? newSelection.delete(itemId) : newSelection.add(itemId);
        setSelectedItems(newSelection);
    };

    const handleSelectAll = () => {
        if (selectedItems.size === history.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(history.map(item => item.id)));
        }
    };

    const sections = useMemo(() => {
        const grouped = history.reduce((acc, item) => {
            let title = "Огноо тодорхойгүй";
            let sortKey = "9999-99"; // A key that will always be sorted to the bottom

            if (item.year && item.month) {
                if (viewMode === 'month') {
                    title = `${item.year} оны ${item.month}-р сар`;
                    sortKey = `${item.year}-${String(item.month).padStart(2, '0')}`;
                } else if (item.savedAt) {
                    title = item.savedAt.toLocaleDateString('mn-MN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                    sortKey = item.savedAt.toISOString().split('T')[0];
                }
            }

            if (!acc[sortKey]) {
                acc[sortKey] = { title, data: [] };
            }
            acc[sortKey].data.push(item);
            return acc;
        }, {});

        // Sort the groups chronologically (latest first)
        const sortedGroupKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

        return sortedGroupKeys.map(key => grouped[key]);

    }, [history, viewMode]);

    const renderHeader = () => (
        <View style={styles.header}>
            {isSelectionMode ? (
                <>
                    <TouchableOpacity onPress={() => setSelectedItems(new Set())}><Text style={styles.headerButton}>Цуцлах</Text></TouchableOpacity>
                    <Text style={styles.title}>{selectedItems.size} сонгосон</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity onPress={handleSelectAll} style={{ marginRight: 20 }}><Text style={styles.headerButton}>Бүгдийг сонгох</Text></TouchableOpacity>
                        <TouchableOpacity onPress={handleDeleteSelected}><MaterialCommunityIcons name="delete" size={24} color="#ef4444" /></TouchableOpacity>
                    </View>
                </>
            ) : (
                <>
                    <Text style={styles.title}>Хадгалсан түүх</Text>
                    <TouchableOpacity onPress={() => setViewMode(viewMode === 'month' ? 'date' : 'month')}>
                        <MaterialCommunityIcons name={viewMode === 'month' ? 'calendar-today' : 'calendar-month'} size={24} color="#3b82f6" />
                    </TouchableOpacity>
                </>
            )}
        </View>
    );

    const renderListItem = ({ item }) => {
        const isSelected = selectedItems.has(item.id);
        const savedDateString = item.savedAt && item.savedAt instanceof Date && !isNaN(item.savedAt)
            ? item.savedAt.toLocaleString('mn-MN')
            : 'Огноо байхгүй';

        return (
            <TouchableOpacity
                style={[styles.listItem, isSelected && styles.listItemSeletected]}
                onPress={() => handleSelect(item.id)}
                onLongPress={() => handleSelect(item.id)}
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
                        {item.handler && <Text style={styles.infoRow}><Text style={styles.infoLabel}>Эд хариуцагч:</Text> {item.handler}</Text>}
                        <Text style={styles.infoRow}><Text style={styles.infoLabel}>Хөрөнгийн код:</Text> {item.assetCode}</Text>
                        {item.assetName && <Text style={styles.infoRow}><Text style={styles.infoLabel}>Хөрөнгийн нэр:</Text> {item.assetName}</Text>}
                        <Text style={styles.infoRow}><Text style={styles.infoLabel}>Нэгж үнэ:</Text> {item.unitPrice} ₮</Text>
                        <Text style={styles.infoRow}><Text style={styles.infoLabel}>Бүртгэлийн данс:</Text> {item.account}</Text>
                        <Text style={styles.infoRow}><Text style={styles.infoLabel}>А.О.Огноо:</Text> {item.date}</Text>
                        <Text style={styles.itemDate}>Хадгалсан огноо: {savedDateString}</Text>
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
                {history.length === 0 ? (
                    <View style={styles.centered}><Text style={styles.emptyText}>Түүх хоосон байна.</Text></View>
                ) : (
                    <SectionList
                        sections={sections}
                        keyExtractor={(item) => item.id}
                        renderItem={renderListItem}
                        renderSectionHeader={({ section: { title } }) => (
                            <Text style={styles.sectionHeader}>{title}</Text>
                        )}
                        stickySectionHeadersEnabled={false}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f0f2f5' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5' },
    emptyText: { fontSize: 18, fontWeight: 'bold', color: '#555' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        backgroundColor: '#fff',
    },
    title: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    headerButton: { fontSize: 16, color: '#3b82f6', fontWeight: '500' },
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
    },
    listItemSeletected: { backgroundColor: '#e0e7ff', borderColor: '#3b82f6', borderWidth: 1 },
    listItemContent: { flexDirection: 'row', alignItems: 'center', padding: 15 },
    infoRow: {
        fontSize: 14,
        color: '#333',
        lineHeight: 22,
    },
    infoLabel: {
        fontWeight: 'bold',
    },
    itemDate: {
        fontSize: 12,
        color: '#888',
        marginTop: 8,
        textAlign: 'right'
    },
});
