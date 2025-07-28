import React from "react";
import { View, Text, StyleSheet } from "react-native";

const TextComponent = ({ text }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>{text}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    text: {
        fontSize: 16,
        color: "#333",
    },
});

export default TextComponent;
