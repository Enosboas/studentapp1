import React from "react";
import { TextInput, StyleSheet } from "react-native";

const InputField = ({ placeholder, keyboardType, secureTextEntry }) => {
    return (
        <TextInput
            style={styles.input}
            placeholder={placeholder}
            keyboardType={keyboardType}
            secureTextEntry={secureTextEntry}
        />
    );
};

const styles = StyleSheet.create({
    input: {
        backgroundColor: "white",
        width: "100%",
        height: 45,
        borderWidth: 1,
        borderColor: "#999",
        borderRadius: 8,
        paddingHorizontal: 10,
        marginTop:30
    },
});

export default InputField;
