import React, { useState, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const STORAGE_KEY = '@scanned_data_list';

export default function HistoryScreen() {
    const [history, setHistory] = useState([]);
    const [selectedItems, setSelectedItems] = useState(new Set());

    // --- THIS IS THE CORRECTED PART ---
    useFocusEffect(
        useCallback(() => {
            // Define an async function inside the effect
            const fetchHistory = async () => {
                try {
                    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
                    const dataList = jsonValue != null ? JSON.parse(jsonValue) : [];
                    setHistory(dataList.reverse());
                } catch (e) {
                    console.error("Failed to load history.", e);
                    Alert.alert("Алдаа", "Түүхийг уншихад алдаа гарлаа.");
                }
            };

            fetchHistory(); // Call the async function
        }, []) // Empty dependency array ensures this runs once per focus
    );

    const handleSelect = (itemId) => {
        const newSelection = new Set(selectedItems);
        if (newSelection.has(itemId)) {
            newSelection.delete(itemId);
        } else {
            newSelection.add(itemId);
        }
        setSelectedItems(newSelection);
    };

    const handleSelectAll = () => {
        if (selectedItems.size === history.length) {
            setSelectedItems(new Set());
        } else {
            const allItemIds = new Set(history.map(item => item.id));
            setSelectedItems(allItemIds);
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedItems.size === 0) return;
        const newHistory = history.filter(item => !selectedItems.has(item.id));
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...newHistory].reverse()));
            setHistory(newHistory);
            setSelectedItems(new Set());
            Alert.alert("Амжилттай", "Сонгосон мэдээллийг устгалаа.");
        } catch (e) {
            console.error("Failed to delete items.", e);
            Alert.alert("Алдаа", "Устгах явцад алдаа гарлаа.");
        }
    };

    const renderHeader = () => {
        const isSelectionMode = selectedItems.size > 0;

        if (isSelectionMode) {
            return (
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setSelectedItems(new Set())}>
                        <Text style={styles.headerButton}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>{selectedItems.size} selected</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity onPress={handleSelectAll} style={{ marginRight: 20 }}>
                            <Text style={styles.headerButton}>Select All</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDeleteSelected}>
                            <MaterialCommunityIcons name="delete" size={24} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.header}>
                <Text style={styles.title}>Хадгалсан түүх</Text>
            </View>
        );
    };

    const renderItem = ({ item }) => {
        const isSelected = selectedItems.has(item.id);
        return (
            <TouchableOpacity
                style={[styles.listItem, isSelected && styles.listItemSeletected]}
                onPress={() => handleSelect(item.id)}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons
                        name={isSelected ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                        size={24}
                        color={isSelected ? '#3b82f6' : '#888'}
                        style={{ marginRight: 15 }}
                    />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.itemText}>{item.text}</Text>
                        <Text style={styles.itemDate}>
                            {new Date(item.date).toLocaleString('en-GB')}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            {renderHeader()}
            <FlatList
                data={history}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Хадгалсан түүх байхгүй байна.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

// Styles remain the same
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f0f2f5' },
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
    listContainer: { padding: 10 },
    listItem: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    listItemSeletected: {
        backgroundColor: '#e0e7ff',
        borderColor: '#3b82f6',
    },
    itemText: { fontSize: 16, color: '#111827' },
    itemDate: { fontSize: 12, color: '#888', marginTop: 8, textAlign: 'right' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    emptyText: { fontSize: 16, color: '#999' },
});