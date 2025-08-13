import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import MainScreen from './MainScreen';
import HistoryScreen from './HistoryScreen';

const Tab = createBottomTabNavigator();

// A dummy component for the center button tab
const DummyComponent = () => null;

// Header компонент
const CustomHeader = ({ selectedDate, onCalendarPress, showCalendar, totalCount }) => {
    const insets = useSafeAreaInsets();
    return (
        <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                {/* Зүүн талд calendar */}
                <View style={styles.leftRow}>
                    {showCalendar && (
                        <TouchableOpacity style={styles.headerButtonTouchable} onPress={onCalendarPress}>
                            <MaterialCommunityIcons name="calendar-month" size={24} color="#3b82f6" />
                            <Text style={styles.headerButtonText}>
                                {selectedDate.toLocaleString('mn-MN', { month: 'short', year: 'numeric' })}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Баруун талд Бүгд: X */}
                {showCalendar && typeof totalCount === 'number' ? (
                    <View style={styles.countChip}>
                        <Text style={styles.countChipText}>Бүгд: {totalCount}</Text>
                    </View>
                ) : <View style={{ width: 0 }} />}
            </View>
        </View>
    );
};

// Сар сонгох цонх
function MonthPickerModal({ isVisible, setVisible, onSelectMonth }) {
    const [displayYear, setDisplayYear] = useState(new Date().getFullYear());
    const months = ["1-р сар", "2-р сар", "3-р сар", "4-р сар", "5-р сар", "6-р сар", "7-р сар", "8-р сар", "9-р сар", "10-р сар", "11-р сар", "12-р сар"];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    return (
        <Modal transparent={true} visible={isVisible} onRequestClose={() => setVisible(false)}>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.yearHeader}>
                        <TouchableOpacity onPress={() => setDisplayYear(d => d - 1)}>
                            <MaterialCommunityIcons name="chevron-left" size={32} color="#3b82f6" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>{displayYear}</Text>
                        <TouchableOpacity
                            disabled={displayYear >= currentYear}
                            onPress={() => setDisplayYear(d => d + 1)}
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
                                onPress={() => onSelectMonth(displayYear, index)}
                            >
                                <Text style={[styles.monthText, isFutureMonth && styles.disabledMonthText]}>{month}</Text>
                            </TouchableOpacity>
                        );
                    })}
                    <TouchableOpacity style={styles.closeButton} onPress={() => setVisible(false)}>
                        <Text style={styles.closeButtonText}>Хаах</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

export default function App() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [totalCount, setTotalCount] = useState(null);

    useEffect(() => {
        const loadSelectedDate = async () => {
            const savedDate = await AsyncStorage.getItem('selectedDate');
            if (savedDate) setSelectedDate(new Date(savedDate));
        };
        loadSelectedDate();
    }, []);

    const handleMonthSelect = async (year, monthIndex) => {
        const newDate = new Date(year, monthIndex);
        setSelectedDate(newDate);
        await AsyncStorage.setItem('selectedDate', newDate.toISOString());
        setIsModalVisible(false);
    };

    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <MonthPickerModal
                    isVisible={isModalVisible}
                    setVisible={setIsModalVisible}
                    onSelectMonth={handleMonthSelect}
                />
                <Tab.Navigator
                    initialRouteName="MainScreen"
                    screenOptions={({ route }) => ({
                        tabBarActiveTintColor: '#5dade2',
                        tabBarStyle: { height: 60, paddingBottom: 5, backgroundColor: '#fff' },
                        tabBarShowLabel: false,
                        header: () => {
                            const showCalendar = route.name === 'MainScreen' || route.name === 'History';
                            return (
                                <CustomHeader
                                    selectedDate={selectedDate}
                                    onCalendarPress={() => setIsModalVisible(true)}
                                    showCalendar={showCalendar}
                                    totalCount={showCalendar ? totalCount : null}
                                />
                            );
                        }
                    })}
                >
                    <Tab.Screen
                        name="MainScreen"
                        options={{
                            tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="home-outline" color={color} size={size} />
                        }}
                    >
                        {props => <MainScreen {...props} selectedDate={selectedDate} />}
                    </Tab.Screen>

                    <Tab.Screen
                        name="History"
                        options={{ tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="history" color={color} size={size} /> }}
                    >
                        {props => (
                            <HistoryScreen
                                {...props}
                                selectedDate={selectedDate}
                                setTotalCount={setTotalCount}
                            />
                        )}
                    </Tab.Screen>
                </Tab.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    headerContainer: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 15, paddingRight: 20, paddingBottom: 15, paddingTop: 10, minHeight: 60 },
    leftRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerButtonTouchable: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eef2ff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
    headerButtonText: { fontSize: 16, color: '#3b82f6', fontWeight: '500', marginLeft: 8 },
    countChip: { backgroundColor: '#e5f6ff', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: '#bae6fd' },
    countChipText: { color: '#0369a1', fontSize: 14, fontWeight: '600' },
    centerButton: {
        position: 'absolute',
        bottom: 15, // Adjusted for better visual alignment
        height: 64,
        width: 64,
        borderRadius: 32,
        backgroundColor: '#3498db',
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#fff',
        borderWidth: 3,
        // Shadow for iOS
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        // Elevation for Android
        elevation: 8,
    },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { width: '85%', backgroundColor: 'white', borderRadius: 10, padding: 20, alignItems: 'center' },
    yearHeader: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    modalTitle: { fontSize: 22, fontWeight: 'bold' },
    monthItem: { width: '100%', paddingVertical: 10, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' },
    monthText: { fontSize: 18, color: '#3b82f6' },
    disabledMonthText: { color: '#ccc' },
    closeButton: { marginTop: 20, backgroundColor: '#ef4444', paddingVertical: 10, paddingHorizontal: 30, borderRadius: 8 },
    closeButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});