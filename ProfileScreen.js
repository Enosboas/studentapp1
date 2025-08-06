import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth } from './firebase'; // Import your auth object
import { signOut } from 'firebase/auth';

export default function ProfileScreen() {
    // Get the current user from Firebase auth
    const user = auth.currentUser;

    const handleLogout = async () => {
        try {
            await signOut(auth);
            // The onAuthStateChanged listener in App.js will handle navigation
        } catch (error) {
            console.error("Error signing out: ", error);
            Alert.alert("Logout Error", "An error occurred while signing out. Please try again.");
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>Profile</Text>
                <MaterialCommunityIcons name="account-circle-outline" size={100} color="#555" />

                {/* Display user's email if available */}
                {user?.email && (
                    <Text style={styles.emailText}>{user.email}</Text>
                )}

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Log Out</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f0f2f5',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    emailText: {
        fontSize: 18,
        color: '#555',
        marginBottom: 40,
        marginTop: 20,
    },
    logoutButton: {
        width: '100%',
        backgroundColor: '#ef4444', // A red color for logout
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
    logoutButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
