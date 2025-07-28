// App.js

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 1. Import your screen components
import LoginScreen from './LoginScreen'; // This is the file with the code from the Canvas
 import MainScreen from './MainScreen'; // You can import other screens here

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        // 2. Set up your NavigationContainer here
        <NavigationContainer>
            {/* 3. Define your screens inside the navigator */}
            <Stack.Navigator>
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{
                        // You can customize the header here if you want
                        headerShown: false
                    }}
                />
                {/* <Stack.Screen name="MainScreen" component={MainScreen} /> */}
            </Stack.Navigator>
        </NavigationContainer>
    );
}