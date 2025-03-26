import React from "react";
import { Image, StyleSheet } from "react-native";

const Logo = () => {
    return <Image source={require("../assets/logo.png")} style={styles.logo} />;
};

const styles = StyleSheet.create({
    logo: {
        width: 160,
        height: 55,
        resizeMode: "contain",
        position: "absolute",
        top: 45,
        left: 20,
    },
});

export default Logo;
