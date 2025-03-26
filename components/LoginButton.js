import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const LoginButton = ({ title, onPress }) => {
    return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {

        paddingVertical: 6,
        paddingHorizontal: 25,
        borderWidth: 1,
        borderColor: "white",
        borderRadius: 10,
        marginTop: 40,
    },

    buttonText: {
        color: "white",
        fontWeight: "regular",
        fontSize: 16,
    },
});

export default LoginButton;
