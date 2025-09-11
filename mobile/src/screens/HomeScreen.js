import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ApiService from '../services/api';
import NotificationService from '../services/notificationService';

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [activeCalls, setActiveCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserData();
    loadGroups();
    loadActiveCalls();
  }, []);

  const loadUserData = async () => {
    try {
      // In a real app, you'd get this from your authentication system
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        // Load user data from API
        const users = await ApiService.getUsers();
        const currentUser = users.find(u => u.id === parseInt(userId));
        setUser(currentUser);
        
        // Register push token
        await NotificationService.registerPushTokenWithServer(parseInt(userId));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadGroups = async () => {
    try {
      const groupsData = await ApiService.getGroups();
      setGroups(groupsData);
    } catch (error) {
      console.error('Error loading groups:', error);
      Alert.alert('Error', 'Failed to load groups');
    }
  };

  const loadActiveCalls = async () => {
    try {
      if (user) {
        const callsData = await ApiService.getActiveCalls(user.id);
        setActiveCalls(callsData.activeCalls || []);
      }
    } catch (error) {
      console.error('Error loading active calls:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadUserData(),
      loadGroups(),
      loadActiveCalls(),
    ]);
    setRefreshing(false);
  };

  const joinCall = async (call) => {
    try {
      const callInfo = await ApiService.joinCall(user.id, call.roomSid, call.groupId);
      
      // Navigate to video call screen with call information
      navigation.navigate('VideoCall', {
        callInfo: callInfo.callInfo,
        roomSid: call.roomSid,
        groupId: call.groupId,
      });
    } catch (error) {
      console.error('Error joining call:', error);
      Alert.alert('Error', 'Failed to join call');
    }
  };

  const createTestUser = async () => {
    try {
      const userData = {
        givenName: 'Test',
        familyName: 'User',
        phoneNumber: '5551234567',
        timezone: 'PST',
      };
      
      const newUser = await ApiService.createUser(userData);
      await AsyncStorage.setItem('userId', newUser.id.toString());
      setUser(newUser);
      
      Alert.alert('Success', 'Test user created and logged in');
    } catch (error) {
      console.error('Error creating test user:', error);
      Alert.alert('Error', 'Failed to create test user');
    }
  };

  const renderGroup = ({ item }) => (
    <View style={styles.groupCard}>
      <Text style={styles.groupName}>{item.name}</Text>
      <Text style={styles.groupDetails}>
        {item.users.length} members • {item.cadence} • {item.duration}min
      </Text>
      <Text style={styles.groupStatus}>
        Status: {item.enabled ? 'Active' : 'Inactive'}
      </Text>
    </View>
  );

  const renderActiveCall = ({ item }) => (
    <TouchableOpacity 
      style={styles.callCard}
      onPress={() => joinCall(item)}
    >
      <Text style={styles.callTitle}>📞 {item.groupName}</Text>
      <Text style={styles.callDetails}>
        Room: {item.roomSid}
      </Text>
      <Text style={styles.joinButton}>Tap to Join</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to Take5</Text>
        <Text style={styles.subtitle}>Create a test user to get started</Text>
        <TouchableOpacity style={styles.button} onPress={createTestUser}>
          <Text style={styles.buttonText}>Create Test User</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>
        Welcome, {user.givenName} {user.familyName}!
      </Text>

      {activeCalls.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Calls</Text>
          <FlatList
            data={activeCalls}
            renderItem={renderActiveCall}
            keyExtractor={(item) => item.roomSid}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Groups</Text>
        <FlatList
          data={groups}
          renderItem={renderGroup}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </View>

      <TouchableOpacity 
        style={styles.profileButton}
        onPress={() => navigation.navigate('UserProfile')}
      >
        <Text style={styles.profileButtonText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  groupCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  groupDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  groupStatus: {
    fontSize: 12,
    color: '#007AFF',
  },
  callCard: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    width: 200,
  },
  callTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  callDetails: {
    fontSize: 12,
    color: 'white',
    marginBottom: 10,
  },
  joinButton: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 20,
  },
  profileButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
