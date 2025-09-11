import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:3000/api'\;

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // User methods
  async getUsers() {
    return this.request('/user');
  }

  async createUser(userData) {
    return this.request('/user', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Group methods
  async getGroups() {
    return this.request('/group');
  }

  async createGroup(groupData) {
    return this.request('/group', {
      method: 'POST',
      body: JSON.stringify(groupData),
    });
  }

  // Mobile-specific methods
  async registerPushToken(userId, pushToken) {
    return this.request('/mobile/push-token', {
      method: 'POST',
      body: JSON.stringify({ userId, pushToken }),
    });
  }

  async unregisterPushToken(userId) {
    return this.request(`/mobile/push-token/${userId}`, {
      method: 'DELETE',
    });
  }

  async joinCall(userId, roomSid, groupId) {
    return this.request('/mobile/join-call', {
      method: 'POST',
      body: JSON.stringify({ userId, roomSid, groupId }),
    });
  }

  async getActiveCalls(userId) {
    return this.request(`/mobile/active-calls/${userId}`);
  }

  async endCall(userId, roomSid) {
    return this.request('/mobile/end-call', {
      method: 'POST',
      body: JSON.stringify({ userId, roomSid }),
    });
  }

  // Twilio Video methods
  async createVideoCall(groupId, scheduledTime) {
    return this.request('/twilio/call', {
      method: 'POST',
      body: JSON.stringify({ groupId, scheduledTime }),
    });
  }

  async getCallStatus(roomSid) {
    return this.request(`/twilio/call/${roomSid}`);
  }
}

export default new ApiService();
