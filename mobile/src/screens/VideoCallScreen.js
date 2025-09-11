import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ApiService from '../services/api';

const { width, height } = Dimensions.get('window');

export default function VideoCallScreen({ navigation, route }) {
  const [callInfo, setCallInfo] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [participants, setParticipants] = useState([]);

  const { roomSid, groupId, callInfo: initialCallInfo } = route.params || {};

  useEffect(() => {
    if (initialCallInfo) {
      setCallInfo(initialCallInfo);
      joinCall();
    } else if (roomSid && groupId) {
      loadCallInfo();
    }
  }, []);

  const loadCallInfo = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const callData = await ApiService.joinCall(parseInt(userId), roomSid, groupId);
        setCallInfo(callData.callInfo);
        joinCall();
      }
    } catch (error) {
      console.error('Error loading call info:', error);
      Alert.alert('Error', 'Failed to load call information');
    }
  };

  const joinCall = async () => {
    setIsConnecting(true);
    
    try {
      // In a real implementation, you would use Twilio Video SDK here
      // For now, we'll simulate the connection
      console.log('Joining video call:', callInfo);
      
      // Simulate connection process
      setTimeout(() => {
        setIsConnected(true);
        setIsConnecting(false);
        startCallTimer();
      }, 2000);
      
    } catch (error) {
      console.error('Error joining call:', error);
      setIsConnecting(false);
      Alert.alert('Error', 'Failed to join call');
    }
  };

  const startCallTimer = () => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    // Store timer reference for cleanup
    return timer;
  };

  const endCall = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId && callInfo) {
        await ApiService.endCall(parseInt(userId), callInfo.roomSid);
      }
      
      // Navigate back to home
      navigation.goBack();
    } catch (error) {
      console.error('Error ending call:', error);
      Alert.alert('Error', 'Failed to end call');
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!callInfo) {
    return (
      <View style={styles.container}>
        <Text>Loading call information...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Video Area */}
      <View style={styles.videoContainer}>
        {isConnecting ? (
          <View style={styles.connectingView}>
            <Text style={styles.connectingText}>Connecting...</Text>
            <Text style={styles.connectingSubtext}>
              Joining {callInfo.groupName}
            </Text>
          </View>
        ) : isConnected ? (
          <View style={styles.connectedView}>
            <Text style={styles.connectedText}>📹 Video Call Active</Text>
            <Text style={styles.groupName}>{callInfo.groupName}</Text>
            <Text style={styles.duration}>{formatDuration(callDuration)}</Text>
          </View>
        ) : (
          <View style={styles.errorView}>
            <Text style={styles.errorText}>Failed to connect</Text>
          </View>
        )}
      </View>

      {/* Call Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.callInfo}>
          <Text style={styles.callInfoText}>
            Room: {callInfo.roomSid}
          </Text>
          <Text style={styles.callInfoText}>
            User: {callInfo.userName}
          </Text>
        </View>

        <View style={styles.controlButtons}>
          <TouchableOpacity 
            style={[styles.controlButton, styles.muteButton]}
            onPress={() => console.log('Toggle mute')}
          >
            <Text style={styles.controlButtonText}>🔇</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.controlButton, styles.videoButton]}
            onPress={() => console.log('Toggle video')}
          >
            <Text style={styles.controlButtonText}>📹</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.controlButton, styles.endButton]}
            onPress={endCall}
          >
            <Text style={styles.controlButtonText}>📞</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Debug Info */}
      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>
          Access Token: {callInfo.accessToken ? 'Available' : 'Missing'}
        </Text>
        <Text style={styles.debugText}>
          Join URL: {callInfo.joinUrl ? 'Available' : 'Missing'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  connectingView: {
    alignItems: 'center',
  },
  connectingText: {
    fontSize: 24,
    color: 'white',
    marginBottom: 10,
  },
  connectingSubtext: {
    fontSize: 16,
    color: '#ccc',
  },
  connectedView: {
    alignItems: 'center',
  },
  connectedText: {
    fontSize: 20,
    color: 'white',
    marginBottom: 10,
  },
  groupName: {
    fontSize: 18,
    color: '#007AFF',
    marginBottom: 5,
  },
  duration: {
    fontSize: 16,
    color: '#ccc',
  },
  errorView: {
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#ff3b30',
  },
  controlsContainer: {
    backgroundColor: '#2c2c2e',
    padding: 20,
  },
  callInfo: {
    marginBottom: 20,
  },
  callInfoText: {
    color: 'white',
    fontSize: 12,
    marginBottom: 2,
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  muteButton: {
    backgroundColor: '#48484a',
  },
  videoButton: {
    backgroundColor: '#48484a',
  },
  endButton: {
    backgroundColor: '#ff3b30',
  },
  controlButtonText: {
    fontSize: 24,
  },
  debugInfo: {
    position: 'absolute',
    top: 50,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 5,
  },
  debugText: {
    color: 'white',
    fontSize: 10,
    marginBottom: 2,
  },
});
