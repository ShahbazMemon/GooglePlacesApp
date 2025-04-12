import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import { SearchProvider } from './src/context/SearchContext';

const Stack = createStackNavigator();

export default function App() {
    return (
        <SearchProvider>
            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen name="Google Map" component={HomeScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </SearchProvider>
    );
}