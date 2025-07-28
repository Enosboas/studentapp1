import React from "react";
import {View, Text, StyleSheet, TouchableOpacity, Image} from "react-native";
import TextComponent from "./components/TextComponent";

const SecondScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            {/* Text List Section */}
            <View style={styles.textSection}>
                <TextComponent text="efsfes" />
                <TextComponent text="EFFES" />
                <TextComponent text="AEFSFF" />
                <TextComponent text="TAEFSFES" />
                <View style={styles.bottomSection}>
                    <Image source={require('./assets/dog2.jpg')} style={styles.image} />
                </View>
            </View>

            {/* Bottom Section */}


            {/* Back Button */}
            <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        marginTop: 20,
    },
    textSection: {
        flex: 0.6,
        backgroundColor: "#f8f8f8",
        padding: 20,
    },
    bottomSection: {
        flex: 1,
        backgroundColor: "#e0e0e0",
        padding: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        fontSize: 18,
        color: "#333",
    },
    button: {
        position: "absolute",
        bottom: 20,
        left: 20,
        backgroundColor: "#007bff",
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 6,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    image: {
        flex: 1,
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
});

export default SecondScreen;
