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
    ActivityIndicator,
    Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// --- Firebase Imports ---
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from 'firebase/auth';
import { auth } from './firebase';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAuthentication = async () => {
        if (email.trim() === '' || password.trim() === '') {
            Alert.alert("Мэдээлэл дутуу", "И-мэйл болон нууц үгээ оруулна уу.");
            return;
        }

        setLoading(true);
        try {
            if (isRegistering) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (error) {
            let errorMessage = "Алдаа гарлаа. Дахин оролдоно уу.";
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "Энэ и-мэйл хаяг бүртгэлтэй байна.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Зөв и-мэйл хаяг оруулна уу.";
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "Нууц үг дор хаяж 6 тэмдэгттэй байх ёстой.";
            } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                errorMessage = "И-мэйл эсвэл нууц үг буруу байна.";
            }
            Alert.alert("Нэвтрэхэд алдаа гарлаа", errorMessage);
        } finally {
            setLoading(false);
        }
    };


    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                <Image
                    source={require('./assets/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="email-outline" size={22} color="#888" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="и-мэйл"
                        placeholderTextColor="#888"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="lock-outline" size={22} color="#888" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Нууц үг"
                        placeholderTextColor="#888"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>

                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleAuthentication}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.loginButtonText}>
                            {isRegistering ? 'БҮРТГҮҮЛЭХ' : 'НЭВТРЭХ'}
                        </Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={() => setIsRegistering(!isRegistering)}
                    disabled={loading}
                >
                    <Text style={styles.toggleButtonText}>
                        {isRegistering
                            ? 'Бүртгэлтэй бол энд дарна уу'
                            : "Бүртгэл байхгүй юу? Шинээр үүсгэх"}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// --- Styles ---
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
        backgroundColor: '#f3f4f6',
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
    loginButton: {
        width: '100%',
        backgroundColor: '#3b82f6',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    loginButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    toggleButton: {
        marginTop: 20,
    },
    toggleButtonText: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '600',
    },
});
