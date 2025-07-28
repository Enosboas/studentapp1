import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

const FirstScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <View style={styles.topSection}>
                <View style={styles.halfWidth}>
                    <Text style={styles.text}>grknl;fgsafhkjesnm,f[psaeoijkfnsmefsaehbfnm,se;fushbm f,;p[ipo</Text>
                </View>
                <View style={styles.row}>
                    <View style={styles.halfWidth}>
                        <Text style={styles.text}>opiuhjbnlk;oiyughjkn;lipuoyiughvjbnkjoiuyguhvjb</Text>
                    </View>
                    <View style={styles.halfWidth}>
                        <Image source={require('./assets/dog.jpg')} style={styles.image} />
                    </View>
                </View>
            </View>

            {/* Bottom Section (50%) */}
            <View style={styles.bottomSection}>
                <TouchableOpacity style={styles.nextButton} onPress={() => navigation.navigate('SecondScreen')}>
                    <Text style={styles.nextButtonText}>Next</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default FirstScreen;

const styles = StyleSheet.create({
    container: { flex: 1 },

    // Top Section (50%)
    topSection: { flex: 0.7, padding: 20 ,marginTop:40},
    fullWidth: { flex: 1, backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    row: { flex: 1, flexDirection: 'row' },
    halfWidth: { flex: 0.7, backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center', margin: 10 },
    image: {
        flex: 1,
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },

    // Bottom Section (50%)
    bottomSection: { flex: 0.5, justifyContent: 'flex-end', alignItems: 'flex-end', padding: 30 },

    text: { fontSize: 18 },
    nextButton: {
        backgroundColor: '#007BFF',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        borderWidth: 3,
        borderColor: '#fff',
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },

});