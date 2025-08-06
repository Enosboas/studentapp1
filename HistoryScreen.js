import React, { useState, useCallback, useMemo } from 'react';
import {
    StyleSheet, Text, View, SectionList,
    SafeAreaView, StatusBar, TouchableOpacity,
    Alert, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function HistoryScreen() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [viewMode, setViewMode] = useState('month'); // 'month' or 'date'

    const isSelectionMode = selectedItems.size > 0;

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const stored = await AsyncStorage.getItem('history');
            const parsed = stored ? JSON.parse(stored) : [];

            const dataList = parsed.map(item => ({
                ...item,
                date: new Date(item.createdAt),
                id: `${item.assetCode}-${item.createdAt}` // pseudo-unique ID
            }));

            setHistory(dataList);
        } catch (e) {
            console.error("Failed to load history from storage.", e);
            Alert.alert("Алдаа", "Түүхийг ачааллах үед алдаа гарлаа.");
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => {
        fetchHistory();
    }, []));

    const handleDeleteSelected = async () => {
        if (selectedItems.size === 0) return;

        const newHistory = history.filter(item => !selectedItems.has(item.id));
        setHistory(newHistory);
        setSelectedItems(new Set());
        await AsyncStorage.setItem('history', JSON.stringify(newHistory));
        Alert.alert("Амжилттай", "Сонгосон мэдээллийг устгалаа.");
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
        const grouped = {};

        history.forEach(item => {
            if (viewMode === 'month') {
                const year = item.year ?? item.date.getFullYear();
                const month = item.month ?? (item.date.getMonth() + 1);
                const key = `${year}-${month.toString().padStart(2, '0')}`;
                if (!grouped[key]) grouped[key] = { year, month, data: [] };
                grouped[key].data.push(item);
            } else {
                const title = item.date.toLocaleDateString('mn-MN', {
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

            return sortedKeys.map(key => {
                const { year, month, data } = grouped[key];
                const title = `${year} оны ${month}-р сар`;
                return { title, data };
            });
        } else {
            return Object.values(grouped);
        }
    }, [history, viewMode]);

    const renderHeader = () => (
        <View style={styles.header}>
            {isSelectionMode ? (
                <>
                    <TouchableOpacity onPress={() => setSelectedItems(new Set())}>
                        <Text style={styles.headerButton}>Цуцлах</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>{selectedItems.size} сонгогдсон</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity onPress={handleSelectAll} style={{ marginRight: 20 }}>
                            <Text style={styles.headerButton}>Бүгд</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDeleteSelected}>
                            <MaterialCommunityIcons name="delete" size={24} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                </>
            ) : (
                <>
                    <Text style={styles.title}>Түүх</Text>
                    <TouchableOpacity onPress={() => setViewMode(viewMode === 'month' ? 'date' : 'month')}>
                        <MaterialCommunityIcons name={viewMode === 'month' ? 'calendar-today' : 'calendar-month'} size={24} color="#3b82f6" />
                    </TouchableOpacity>
                </>
            )}
        </View>
    );

    const renderListItem = ({ item }) => {
        const isSelected = selectedItems.has(item.id);
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
                        <Text style={styles.itemText}>
                            {item.handler ? `Эд хариуцагч: ${item.handler}\n` : ''}
                            Хөрөнгийн код: {item.assetCode ?? '—'}{"\n"}
                            {item.assetName ? `Хөрөнгийн нэр: ${item.assetName}\n` : ''}
                            {item.unitType ? `Хэмжих нэгж: ${item.unitType}\n` : ""}
                            Нэгж үнэ: {item.unitPrice ? Number(item.unitPrice).toLocaleString('mn-MN') : '—'} ₮{"\n"}
                            Бүртгэлийн данс: {item.account ?? '—'}{"\n"}
                            А.О.Огноо: {item.date ? new Date(item.date).toLocaleDateString('mn-MN') : '—'}
                        </Text>
                        <Text style={styles.itemDate}>{item.date.toLocaleString('en-GB')}</Text>
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
    itemText: { fontSize: 16, color: '#111827' },
    itemDate: { fontSize: 12, color: '#888', marginTop: 8, textAlign: 'right' },
});
