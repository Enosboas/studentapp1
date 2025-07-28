import React from 'react';
import { View, Text, TouchableOpacity, } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// --- Import your screens ---
// Make sure you have a LoginScreen.js file for this to work.
import LoginScreen from './LoginScreen';

// This is the screen for the center tab button.
import MainScreen from './MainScreen';

// --- Placeholder screens for other tabs ---
// These are simple components so the app can run without errors.
function SearchScreen() {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Search!</Text></View>;
}
function HistoryScreen() {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>History!</Text></View>;
}
function ProfileScreen() {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Profile!</Text></View>;
}

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// This component defines your bottom tab layout
function MainTabNavigator() {
    return (
        <Tab.Navigator
            initialRouteName="MainScreen"
            screenOptions={{
                tabBarActiveTintColor: '#5dade2', // Active icon color
                headerShown: false, // Hides the header for all tab screens
            }}
        >
            <Tab.Screen
                name="LoginTab" // Changed name to avoid conflict, component is now a placeholder
                component={SearchScreen} // Using a placeholder, as Login is now outside tabs
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
                            style={{
                                top: -20, // This lifts the button up
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                            onPress={() => props.onPress()} // Ensure navigation still works
                        >
                            <View style={{
                                width: 70,
                                height: 70,
                                borderRadius: 35,
                                backgroundColor: '#5dade2',
                                justifyContent: 'center',
                                alignItems: 'center',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 4,
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


// This is now the main exported component
export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="LoginScreen">
                {/* The Login screen is now part of the Stack Navigator and has no tabs */}
                <Stack.Screen
                    name="LoginScreen"
                    component={LoginScreen}
                    options={{ headerShown: false }}
                />
                {/* The MainTabNavigator contains all your tab screens */}
                <Stack.Screen
                    name="MainScreen"
                    component={MainTabNavigator}
                    options={{ headerShown: false }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
