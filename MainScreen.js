import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    StatusBar,
} from 'react-native';

// This is the main component for your new screen.
// You can save this code in a new file called `MainScreen.js`.
export default function MainScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <ScrollView contentContainerStyle={styles.container}>
                {/* Image Placeholder */}
                <View style={styles.imagePlaceholder} />

                {/* Month Button */}
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>6-р сар</Text>
                </TouchableOpacity>

                {/* Information Box */}
                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Мэдээлэл</Text>
                    <TextInput
                        style={styles.infoInput}
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top" // Ensures text starts from the top on Android
                    />
                </View>

                {/* Save Button */}
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Хадгалах</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

// --- Styles for the Main Screen ---
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f0f2f5', // A light background color
    },
    container: {
        flexGrow: 1,
        alignItems: 'center',
        padding: 20,
    },
    imagePlaceholder: {
        width: 200,
        height: 200,
        backgroundColor: '#000000',
        borderRadius: 10,
        borderWidth: 3,
        borderColor: '#5dade2', // Blue border color from the image
        marginBottom: 30,
    },
    button: {
        width: '100%',
        backgroundColor: '#5dade2',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    infoBox: {
        width: '100%',
        borderColor: '#5dade2',
        borderWidth: 2,
        borderRadius: 10,
        padding: 15,
        backgroundColor: '#ffffff',
        marginBottom: 20,
    },
    infoTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#333',
    },
    infoInput: {
        height: 150, // Fixed height for the text area
        fontSize: 16,
        color: '#333',
    },
});
