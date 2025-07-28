import React from 'react';
import { View, Text, TouchableOpacity, } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import LoginScreen from './LoginScreen';
import MainScreen from './MainScreen';
import QRScannerScreen from './QRScannerScreen';
import HistoryScreen from './HistoryScreen'; // 1. ADD THIS IMPORT

function SearchScreen() {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Search!</Text></View>;
}
// 2. THE OLD HistoryScreen() FUNCTION IS DELETED FROM HERE
function ProfileScreen() {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Profile!</Text></View>;
}

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// --- No changes needed in MainTabNavigator or the rest of the file ---
function MainTabNavigator({ navigation }) {
    // ... same as before
    return (
        <Tab.Navigator
            initialRouteName="MainScreen"
            screenOptions={{
                tabBarActiveTintColor: '#5dade2',
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="Home"
                component={SearchScreen}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="home" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Search"
                component={SearchScreen}
                options={{
                    tabBarLabel: 'Search',
                    tabBarIcon: ({ color, size }) => (

                        <MaterialCommunityIcons name="magnify" color={color} size={size} />
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
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="LoginScreen">
                <Stack.Screen
                    name="LoginScreen"
                    component={LoginScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="AppTabs"
                    component={MainTabNavigator}
                    options={{ headerShown: false }}
                />
                <Stack.Screen name="QRScannerScreen" component={QRScannerScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}