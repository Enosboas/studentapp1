import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
} from 'react-native';

// Using icons from the library you already have installed
import { MaterialCommunityIcons } from '@expo/vector-icons';

// This is the main component for your Login Screen.
// You can save this code in a new file called `LoginScreen.js`.
export default function LoginScreen({ navigation }) {
    // State to manage the checkbox
    const [rememberMe, setRememberMe] = useState(false);

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                {/* Logo */}
                <Image
                    source={require('../studentappd/assets/logo.png')} // Using a URL for the CTS logo
                    style={styles.logo}
                    resizeMode="contain"
                />

                {/* Email Input */}
                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="email-outline" size={22} color="#888" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="и-мейл" // E-mail in Mongolian
                        placeholderTextColor="#888"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="lock-outline" size={22} color="#888" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Нууц үг" // Password in Mongolian
                        placeholderTextColor="#888"
                        secureTextEntry // Hides the password
                    />
                </View>

                {/* Remember Me & Forgot Password */}
                <View style={styles.optionsContainer}>
                    <TouchableOpacity style={styles.checkboxContainer} onPress={() => setRememberMe(!rememberMe)}>
                        <MaterialCommunityIcons
                            name={rememberMe ? 'checkbox-marked' : 'checkbox-blank-outline'}
                            size={24}
                            color={rememberMe ? '#3B82F6' : '#888'}
                        />
                        <Text style={styles.checkboxLabel}>Намайг сана</Text>
                    </TouchableOpacity>

                    <TouchableOpacity>
                        <Text style={styles.forgotPasswordText}>Нууц үг мартсан</Text>
                    </TouchableOpacity>
                </View>

                {/* Login Button */}
                <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('AppTabs')}>
                    <Text style={styles.loginButtonText}>НЭВТРЭХ</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// --- Styles for the Login Screen ---
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    container: {
        flex: 0.9,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 25,
        backgroundColor: '#fff',
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 60,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#f3f4f6', // A light grey background
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
        height: 55,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: '#111827',
    },
    optionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 30,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkboxLabel: {
        marginLeft: 8,
        fontSize: 14,
        color: '#4b5563',
    },
    forgotPasswordText: {
        fontSize: 14,
        color: '#3B82F6', // A standard blue link color
        fontWeight: '600',
    },
    loginButton: {
        width: '100%',
        backgroundColor: '#3b82f6', // A nice blue color
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    loginButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
