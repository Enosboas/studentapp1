import React, { useState, useCallback, useMemo } from 'react';
import {
    StyleSheet, Text, View, SectionList,
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
    const [lastDoc, setLastDoc] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    const [selectedItems, setSelectedItems] = useState(new Set());
    const [viewMode, setViewMode] = useState('month'); // Can be 'month' or 'date'

    const isSelectionMode = selectedItems.size > 0;

    const fetchHistory = async (isRefreshing = false) => {
        if (!isRefreshing) setLoading(true);
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
            const lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
            setLastDoc(lastVisible);
            if (documentSnapshots.docs.length < PAGE_SIZE) setHasMore(false);

        } catch (e) {
            console.error("Failed to load history.", e);
            Alert.alert("Error", "Could not fetch history.");
        } finally {
            if (!isRefreshing) setLoading(false);
        }
    };

    const fetchMoreHistory = async () => {
        if (loadingMore || !hasMore || !lastDoc) return;
        setLoadingMore(true);
        const user = auth.currentUser;

        try {
            const q = query(
                collection(db, "users", user.uid, "history"),
                orderBy("createdAt", "desc"),
                startAfter(lastDoc),
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
            if (documentSnapshots.docs.length < PAGE_SIZE) setHasMore(false);

        } catch (e) {
            console.error("Failed to load more history.", e);
        } finally {
            setLoadingMore(false);
        }
    };

    useFocusEffect(useCallback(() => {
        fetchHistory();
    }, []));

    const handleDeleteSelected = async () => {
        if (selectedItems.size === 0) return;
        const user = auth.currentUser;
        if (!user) return;

        const batch = writeBatch(db);
        selectedItems.forEach(itemId => {
            const docRef = doc(db, "users", user.uid, "history", itemId);
            batch.delete(docRef);
        });
        await batch.commit();

        const newHistory = history.filter(item => !selectedItems.has(item.id));
        setHistory(newHistory);
        setSelectedItems(new Set());
        Alert.alert("Success", "Selected items have been deleted.");
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

    // --- EDITED: Group history data into sections based on viewMode ---
    const sections = useMemo(() => {
        const grouped = history.reduce((acc, item) => {
            let title = '';
            if (viewMode === 'month') {
                title = item.date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
            } else {
                title = item.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            }
            if (!acc[title]) {
                acc[title] = [];
            }
            acc[title].push(item);
            return acc;
        }, {});

        return Object.keys(grouped).map(title => ({
            title,
            data: grouped[title],
        }));
    }, [history, viewMode]);

    const renderHeader = () => (
        <View style={styles.header}>
            {isSelectionMode ? (
                <>
                    <TouchableOpacity onPress={() => setSelectedItems(new Set())}><Text style={styles.headerButton}>Cancel</Text></TouchableOpacity>
                    <Text style={styles.title}>{selectedItems.size} selected</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity onPress={handleSelectAll} style={{ marginRight: 20 }}><Text style={styles.headerButton}>Select All</Text></TouchableOpacity>
                        <TouchableOpacity onPress={handleDeleteSelected}><MaterialCommunityIcons name="delete" size={24} color="#ef4444" /></TouchableOpacity>
                    </View>
                </>
            ) : (
                <>
                    <Text style={styles.title}>History</Text>
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
                            Нэгж үнэ: {item.unitPrice ?? '—'} ₮{"\n"}
                            Бүртгэлийн данс: {item.account ?? '—'}{"\n"}
                            А.О.Огноо: {item.date ? new Date(item.date).toLocaleDateString('mn-MN') : '—'}
                        </Text>
                        <Text style={styles.itemDate}>{item.date.toLocaleString('en-GB')}</Text>
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
        return <SafeAreaView style={styles.centered}><ActivityIndicator size="large" color="#3b82f6" /></SafeAreaView>;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            {renderHeader()}
            <View style={{ flex: 1, paddingHorizontal: 10 }}>
                {history.length === 0 ? (
                    <View style={styles.centered}><Text style={styles.emptyText}>Your history is empty.</Text></View>
                ) : (
                    // --- EDITED: Replaced FlatList with SectionList ---
                    <SectionList
                        sections={sections}
                        keyExtractor={(item) => item.id}
                        renderItem={renderListItem}
                        renderSectionHeader={({ section: { title } }) => (
                            <Text style={styles.sectionHeader}>{title}</Text>
                        )}
                        onEndReached={fetchMoreHistory}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={renderFooter}
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