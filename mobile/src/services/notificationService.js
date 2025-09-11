import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from './api';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  async initialize() {
    try {
      // Register for push notifications
      await this.registerForPushNotificationsAsync();
      
      // Set up notification listeners
      this.setupNotificationListeners();
      
      console.log('NotificationService initialized successfully');
    } catch (error) {
      console.error('Error initializing NotificationService:', error);
    }
  }

  async registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('video_calls', {
        name: 'Video Calls',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
      
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Expo push token:', token);
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    this.expoPushToken = token;
    return token;
  }

  setupNotificationListeners() {
    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Listener for when a user taps on or interacts with a notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  handleNotificationReceived(notification) {
    const { data } = notification.request.content;
    
    if (data.type === 'video_call') {
      console.log('Video call notification received:', data);
      // Handle the notification (e.g., show in-app notification)
      this.showInAppCallNotification(data);
    }
  }

  handleNotificationResponse(response) {
    const { data } = response.notification.request.content;
    
    if (data.type === 'video_call') {
      console.log('User tapped video call notification:', data);
      // Navigate to video call screen
      this.navigateToVideoCall(data);
    }
  }

  showInAppCallNotification(callData) {
    // This would typically use your app's navigation or state management
    // to show an in-app notification or modal
    console.log('Showing in-app call notification for:', callData.groupName);
  }

  navigateToVideoCall(callData) {
    // This would typically use your app's navigation to go to the video call screen
    console.log('Navigating to video call:', callData.roomSid);
    
    // Store call data for the video call screen
    AsyncStorage.setItem('currentCallData', JSON.stringify(callData));
  }

  async registerPushTokenWithServer(userId) {
    if (!this.expoPushToken) {
      console.log('No push token available');
      return;
    }

    try {
      await ApiService.registerPushToken(userId, this.expoPushToken);
      console.log('Push token registered with server');
    } catch (error) {
      console.error('Error registering push token:', error);
    }
  }

  async unregisterPushTokenFromServer(userId) {
    try {
      await ApiService.unregisterPushToken(userId);
      console.log('Push token unregistered from server');
    } catch (error) {
      console.error('Error unregistering push token:', error);
    }
  }

  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

export default new NotificationService();
