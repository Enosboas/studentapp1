import React, { useState, useCallback, useMemo } from 'react';
import {
    StyleSheet, Text, View, SectionList, FlatList,
    SafeAreaView, StatusBar, TouchableOpacity, Alert, ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// --- Firebase Imports ---
import { db, auth } from './firebase';
import { collection, query, orderBy, getDocs, writeBatch, doc, limit, startAfter } from "firebase/firestore";

const PAGE_SIZE = 25; // How many items to fetch at a time

export default function HistoryScreen() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [lastDoc, setLastDoc] = useState(null); // Keep track of the last document fetched
    const [hasMore, setHasMore] = useState(true); // To know if there's more data to load

    const [selectedItems, setSelectedItems] = useState(new Set());
    const [viewMode, setViewMode] = useState('month');
    const [expandedDate, setExpandedDate] = useState(null);

    const isSelectionMode = selectedItems.size > 0;

    // --- Fetch Initial Data ---
    const fetchHistory = async () => {
        setLoading(true);
        setHasMore(true);
        const user = auth.currentUser;
        if (!user) {
            setHistory([]);
            setLoading(false);
            return;
        }

        try {
            const q = query(
                collection(db, "users", user.uid, "history"),
                orderBy("createdAt", "desc"),
                limit(PAGE_SIZE)
            );

            const documentSnapshots = await getDocs(q);

            const dataList = documentSnapshots.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().createdAt.toDate()
            }));

            setHistory(dataList);
            // Save the last visible document
            const lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
            setLastDoc(lastVisible);

            if (documentSnapshots.docs.length < PAGE_SIZE) {
                setHasMore(false);
            }

        } catch (e) {
            console.error("Failed to load history.", e);
            Alert.alert("Error", "Could not fetch history. Have you created the Firestore index?");
        } finally {
            setLoading(false);
        }
    };

    // --- Fetch More Data for Pagination ---
    const fetchMoreHistory = async () => {
        if (loadingMore || !hasMore) {
            return;
        }
        setLoadingMore(true);
        const user = auth.currentUser;

        try {
            const q = query(
                collection(db, "users", user.uid, "history"),
                orderBy("createdAt", "desc"),
                startAfter(lastDoc), // Fetch documents after the last one we have
                limit(PAGE_SIZE)
            );

            const documentSnapshots = await getDocs(q);

            const newDataList = documentSnapshots.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().createdAt.toDate()
            }));

            setHistory(prevHistory => [...prevHistory, ...newDataList]);

            const lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
            setLastDoc(lastVisible);

            if (documentSnapshots.docs.length < PAGE_SIZE) {
                setHasMore(false);
            }

        } catch (e) {
            console.error("Failed to load more history.", e);
        } finally {
            setLoadingMore(false);
        }
    };

    // Use useFocusEffect to re-fetch data when the screen is focused
    useFocusEffect(useCallback(() => {
        fetchHistory();
    }, []));

    // --- Deletion Logic (no changes needed) ---
    const handleDeleteSelected = async () => {
        if (selectedItems.size === 0) return;
        const user = auth.currentUser;
        if (!user) return;

        try {
            const batch = writeBatch(db);
            selectedItems.forEach(itemId => {
                const docRef = doc(db, "users", user.uid, "history", itemId);
                batch.delete(docRef);
            });
            await batch.commit();

            const newHistory = history.filter(item => !selectedItems.has(item.id));
            setHistory(newHistory);
            setSelectedItems(new Set());
            Alert.alert("Амжилттай", "Сонгосон мэдээллийг устгалаа.");
        } catch (e) {
            console.error("Failed to delete items.", e);
        }
    };

    // --- Render Functions ---
    // (renderHeader, renderListItem, etc. have no changes)
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

    const renderHeader = () => {
        if (isSelectionMode) {
            return (
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setSelectedItems(new Set())}><Text style={styles.headerButton}>Cancel</Text></TouchableOpacity>
                    <Text style={styles.title}>{selectedItems.size} selected</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity onPress={handleSelectAll} style={{ marginRight: 20 }}><Text style={styles.headerButton}>Select All</Text></TouchableOpacity>
                        <TouchableOpacity onPress={handleDeleteSelected}><MaterialCommunityIcons name="delete" size={24} color="#ef4444" /></TouchableOpacity>
                    </View>
                </View>
            );
        }
        return (
            <View style={styles.header}>
                <Text style={styles.title}>Хадгалсан түүх</Text>
                <TouchableOpacity onPress={() => setViewMode(viewMode === 'month' ? 'date' : 'month')}>
                    <MaterialCommunityIcons name={viewMode === 'month' ? 'calendar-today' : 'calendar-month'} size={24} color="#3b82f6" />
                </TouchableOpacity>
            </View>
        );
    };

    const renderListItem = ({ item }) => {
        const isSelected = selectedItems.has(item.id);
        return (
            <TouchableOpacity
                style={[styles.listItem, isSelected && styles.listItemSeletected]}
                onPress={() => handleSelect(item.id)}
            >
                <View style={styles.listItemContent}>
                    <MaterialCommunityIcons
                        name={isSelected ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                        size={24}
                        color={isSelected ? '#3b82f6' : '#888'}
                        style={{ marginRight: 15 }}
                    />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.itemText}>{item.text}</Text>
                        <Text style={styles.itemDate}>{new Date(item.date).toLocaleString('en-GB')}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderFooter = () => {
        if (!loadingMore) return null;
        return <ActivityIndicator style={{ marginVertical: 20 }} size="large" color="#3b82f6" />;
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text>Loading History...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            {renderHeader()}
            <View style={{ flex: 1, paddingHorizontal: 10 }}>
                {history.length === 0 ? (
                    <View style={styles.centered}>
                        <Text style={styles.emptyText}>Your history is empty.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={history}
                        renderItem={renderListItem}
                        keyExtractor={item => item.id}
                        onEndReached={fetchMoreHistory} // This triggers loading more data
                        onEndReachedThreshold={0.5} // How close to the end to trigger
                        ListFooterComponent={renderFooter} // Shows a spinner at the bottom
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

// --- Styles ---
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
    listItem: {
        backgroundColor: 'white', borderRadius: 8,
        marginVertical: 5, marginHorizontal: 10,
    },
    listItemSeletected: { backgroundColor: '#e0e7ff', borderColor: '#3b82f6', borderWidth: 1 },
    listItemContent: { flexDirection: 'row', alignItems: 'center', padding: 15 },
    itemText: { fontSize: 16, color: '#111827' },
    itemDate: { fontSize: 12, color: '#888', marginTop: 8, textAlign: 'right' },
});
