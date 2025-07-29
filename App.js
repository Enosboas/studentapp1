import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// --- Firebase Imports ---
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase'; // Ensure this path is correct

import LoginScreen from './LoginScreen';
import MainScreen from './MainScreen';
import QRScannerScreen from './QRScannerScreen';
import HistoryScreen from './HistoryScreen';
// --- Import the new ProfileScreen ---
import ProfileScreen from './ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// --- Main App Tabs (Updated with Profile) ---
function MainTabNavigator() {
    return (
        <Tab.Navigator
            initialRouteName="MainScreen"
            screenOptions={{
                tabBarActiveTintColor: '#5dade2',
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="History"
                component={HistoryScreen}
                options={{
                    tabBarLabel: 'History',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="history" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="MainScreen"
                component={MainScreen}
                options={{
                    tabBarButton: (props) => (
                        <TouchableOpacity
                            {...props}
                            style={{ top: -20, justifyContent: 'center', alignItems: 'center' }}
                            onPress={props.onPress}
                        >
                            <View style={{
                                width: 70, height: 70, borderRadius: 35, backgroundColor: '#5dade2',
                                justifyContent: 'center', alignItems: 'center', shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4,
                                elevation: 5,
                            }}>
                                <MaterialCommunityIcons name="camera" color={'#fff'} size={30} />
                            </View>
                        </TouchableOpacity>
                    ),
                }}
            />
            {/* --- New Profile Tab --- */}
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="account" color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

// --- Auth-aware Navigation Logic (No changes here) ---
export default function App() {
    const [user, setUser] = useState(null);
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            if (initializing) {
                setInitializing(false);
            }
        });
        return unsubscribe;
    }, []);

    if (initializing) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator>
                {user ? (
                    // --- User is Logged In: Show main app ---
                    <>
                        <Stack.Screen
                            name="AppTabs"
                            component={MainTabNavigator}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen name="QRScannerScreen" component={QRScannerScreen} />
                    </>
                ) : (
                    // --- No User: Show login screen ---
                    <Stack.Screen
                        name="LoginScreen"
                        component={LoginScreen}
                        options={{ headerShown: false }}
                    />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
