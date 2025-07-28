import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FirstScreen from './FirstScreen';
import SecondScreen from './SecondScreen';


const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="FirstScreen" component={FirstScreen} options={{ headerShown: false }} />
                <Stack.Screen name="SecondScreen" component={SecondScreen} options={{ headerShown: false }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}