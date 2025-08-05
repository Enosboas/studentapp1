import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// --- Firebase Imports ---
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

// --- Screen Imports ---
import LoginScreen from './LoginScreen';
import MainScreen from './MainScreen';
import HistoryScreen from './HistoryScreen';
import ProfileScreen from './ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabNavigator() {
    return (
        <Tab.Navigator
            initialRouteName="MainScreen"
            screenOptions={{
                tabBarActiveTintColor: '#5dade2',
                headerShown: false,
                tabBarStyle: { height: 60, paddingBottom: 5 }
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
                    tabBarLabel: '',
                    tabBarIcon: () => (
                        <View style={{
                            position: 'absolute',
                            bottom: 15,
                            height: 60,
                            width: 60,
                            borderRadius: 30,
                            backgroundColor: '#5dade2',
                            justifyContent: 'center',
                            alignItems: 'center',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            elevation: 5,
                        }}>
                            <MaterialCommunityIcons name="qrcode-scan" color={'#fff'} size={30} />
                        </View>
                    ),
                }}
            />
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
                <ActivityIndicator size="large" color="#5dade2" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator>
                {user ? (
                    <Stack.Screen
                        name="AppTabs"
                        component={MainTabNavigator}
                        options={{ headerShown: false }}
                    />
                ) : (
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
