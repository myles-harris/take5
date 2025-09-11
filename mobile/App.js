import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Platform } from 'react-native';
import * as Linking from 'expo-linking';

import NotificationService from './src/services/notificationService';
import ApiService from './src/services/api';

// Import screens (we'll create these next)
import HomeScreen from './src/screens/HomeScreen';
import VideoCallScreen from './src/screens/VideoCallScreen';
import UserProfileScreen from './src/screens/UserProfileScreen';

const Stack = createStackNavigator();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState('Home');

  useEffect(() => {
    async function initializeApp() {
      try {
        // Initialize notification service
        await NotificationService.initialize();
        
        // Handle deep linking
        const url = await Linking.getInitialURL();
        if (url) {
          handleDeepLink(url);
        }

        // Listen for incoming links
        const subscription = Linking.addEventListener('url', handleDeepLink);
        
        setIsReady(true);
        
        return () => subscription?.remove();
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsReady(true);
      }
    }

    initializeApp();
  }, []);

  const handleDeepLink = (url) => {
    console.log('Deep link received:', url);
    
    // Parse the URL to extract call information
    // Expected format: take5://call/join?roomSid=RMxxx&groupId=1
    if (url.includes('call/join')) {
      const urlObj = new URL(url);
      const roomSid = urlObj.searchParams.get('roomSid');
      const groupId = urlObj.searchParams.get('groupId');
      
      if (roomSid && groupId) {
        setInitialRoute('VideoCall');
        // Store call data for the video call screen
        // This would typically be done through your state management
        console.log('Navigating to video call:', { roomSid, groupId });
      }
    }
  };

  if (!isReady) {
    return (
      <View style={styles.container}>
        <Text>Loading Take5...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator 
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Take5' }}
        />
        <Stack.Screen 
          name="VideoCall" 
          component={VideoCallScreen} 
          options={{ 
            title: 'Video Call',
            headerShown: false // Hide header for video call
          }}
        />
        <Stack.Screen 
          name="UserProfile" 
          component={UserProfileScreen} 
          options={{ title: 'Profile' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
