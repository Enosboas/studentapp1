import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Animated,
    Easing,
    SafeAreaView,
    ScrollView
} from "react-native";
import Logo from "./components/Logo";
import InputField from "./components/InputField";
import LoginButton from "./components/LoginButton";

const LoginScreen = () => {
    const [language, setLanguage] = useState("mn");
    const [greeting, setGreeting] = useState("");
    const switchAnim = new Animated.Value(language === "mn" ? 0 : 1);

    useEffect(() => {
        const updateGreeting = () => {
            const hour = new Date().getHours();
            if (hour < 12) {
                setGreeting(language === "mn" ? "Өглөөний мэнд" : "Good Morning");
            } else if (hour < 18) {
                setGreeting(language === "mn" ? "Өдрийн мэнд" : "Good Afternoon");
            } else {
                setGreeting(language === "mn" ? "Оройн мэнд" : "Good Evening");
            }
        };

        updateGreeting();
    }, [language]);

    const toggleLanguage = () => {
        const newLanguage = language === "mn" ? "en" : "mn";
        setLanguage(newLanguage);

        Animated.timing(switchAnim, {
            toValue: newLanguage === "mn" ? 0 : 1,
            duration: 300,
            easing: Easing.linear,
            useNativeDriver: true,
        }).start();
    };

    return (
        <SafeAreaView style={styles.safeContainer}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Logo />

                <TouchableOpacity onPress={toggleLanguage} style={styles.languageSwitch}>
                    <Animated.View
                        style={[
                            styles.switchCircle,
                            {
                                transform: [{ translateX: switchAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 30] }) }],
                            },
                        ]}
                    >
                        <Image
                            source={language === "mn" ? require("./assets/mongolia.png") : require("./assets/uk.png")}
                            style={styles.flagIcon}
                        />
                    </Animated.View>
                </TouchableOpacity>
                <Text style={styles.greeting}>{greeting}</Text>

                <View style={styles.whiteBox}>

                    <InputField placeholder={language === "mn" ? "Оюутны / Багшийн код" : "Student / Teacher Code"} />
                    <InputField placeholder={language === "mn" ? "Цахим шуудан" : "Email"} keyboardType="email-address" />
                    <InputField placeholder={language === "mn" ? "Нууц үг" : "Password"} secureTextEntry />
                    <LoginButton title={language === "mn" ? "НЭВТРЭХ" : "LOGIN"} onPress={() => alert("Login Pressed")} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: "white",
    },
    scrollContainer: {
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 20,
    },
    whiteBox: {
        width: "90%",
        height: "55%",
        backgroundColor: "#AEC6CF",
        padding: 20,
        borderRadius: 20,
        alignItems: "center",
        elevation: 5,
    },
    languageSwitch: {
        position: "absolute",
        top: 55,
        right: 20,
        width: 60,
        height: 30,
        borderWidth: 1,
        borderColor: "black",
        backgroundColor: "white",
        borderRadius: 20,
        justifyContent: "center",
        padding: 3,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 2,
        elevation: 3,
    },
    switchCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "white",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
    },
    flagIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },
    greeting: {
        fontSize: 20,
        fontWeight: "bold",
        color: "black",
        marginTop:20,
        marginBottom:30,
    },
});

export default LoginScreen;
