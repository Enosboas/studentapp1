import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ListItem = ({ text }) => {
    return (
        <View style={styles.item}>
            <Text style={styles.text}>{text}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    item: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginVertical: 5,
        backgroundColor: "#fff",
    },
    text: {
        color: "#333",
        fontSize: 16,
    },
});

export default ListItem;
