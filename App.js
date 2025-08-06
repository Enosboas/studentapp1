import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// --- Screen Imports ---
import MainScreen from './MainScreen';
import HistoryScreen from './HistoryScreen';
import ProfileScreen from './ProfileScreen';

const Tab = createBottomTabNavigator();

export default function App() {
    return (
        <NavigationContainer>
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
        </NavigationContainer>
    );
}
