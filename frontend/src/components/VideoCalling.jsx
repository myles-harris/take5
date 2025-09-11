import React, { useState, useEffect } from 'react';
import { Video, Phone, Users, Clock, Play, Square } from 'lucide-react';
import { api } from '../services/api';

function VideoCalling() {
  const [groups, setGroups] = useState([]);
  const [activeCalls, setActiveCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isInCall, setIsInCall] = useState(false);
  const [currentCall, setCurrentCall] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [groupsRes] = await Promise.all([
        api.get('/group')
      ]);
      setGroups(groupsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startVideoCall = async () => {
    if (!selectedGroup || !scheduledTime) {
      alert('Please select a group and scheduled time');
      return;
    }

    try {
      const response = await api.post('/twilio/call', {
        groupId: parseInt(selectedGroup),
        scheduledTime: new Date(scheduledTime).toISOString()
      });

      const callData = response.data.call;
      setCurrentCall(callData);
      setIsInCall(true);
      
      // Store call data for later use
      setActiveCalls(prev => [...prev, callData]);
      
      console.log('Video call started:', callData);
    } catch (error) {
      console.error('Error starting video call:', error);
      alert('Failed to start video call. Please try again.');
    }
  };

  const endVideoCall = async () => {
    if (!currentCall) return;

    try {
      await api.delete(`/twilio/call/${currentCall.roomSid}`);
      setIsInCall(false);
      setCurrentCall(null);
    } catch (error) {
      console.error('Error ending video call:', error);
    }
  };

  const joinVideoCall = (call) => {
    if (call.joinUrl) {
      window.open(call.joinUrl, '_blank');
    }
  };

  const getCallStatus = async (roomSid) => {
    try {
      const response = await api.get(`/twilio/call/${roomSid}`);
      return response.data;
    } catch (error) {
      console.error('Error getting call status:', error);
      return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Video Calling</h1>
        <p className="mt-1 text-sm text-gray-500">
          Start and manage video calls for your groups
        </p>
      </div>

      {/* Start New Call */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Start New Video Call</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Group
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="input-field"
            >
              <option value="">Choose a group...</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name} ({group.users?.length || 0} members)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scheduled Time
            </label>
            <input
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={startVideoCall}
              disabled={!selectedGroup || !scheduledTime || isInCall}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Video className="w-4 h-4 mr-2" />
              Start Call
            </button>
          </div>
        </div>
      </div>

      {/* Current Call */}
      {isInCall && currentCall && (
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-green-900">Call in Progress</h3>
              <p className="text-sm text-green-700">
                Room: {currentCall.roomName} • {currentCall.participants} participants
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => joinVideoCall(currentCall)}
                className="btn-primary bg-green-600 hover:bg-green-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Join Call
              </button>
              <button
                onClick={endVideoCall}
                className="btn-secondary bg-red-100 text-red-700 hover:bg-red-200"
              >
                <Square className="w-4 h-4 mr-2" />
                End Call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Calls */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Active Calls</h2>
        {activeCalls.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Video className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No active calls</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeCalls.map((call) => (
              <div key={call.callId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <Video className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{call.groupName}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {call.participants} participants
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(call.scheduledTime).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {call.status}
                    </span>
                    <button
                      onClick={() => joinVideoCall(call)}
                      className="btn-primary"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Join
                    </button>
                  </div>
                </div>
                
                {call.participants && call.participants.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Participants:</h4>
                    <div className="space-y-2">
                      {call.participants.map((participant, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                              <span className="text-xs font-medium text-gray-600">
                                {participant.phoneNumber?.slice(-4)}
                              </span>
                            </div>
                            <span className="text-gray-600">
                              {participant.phoneNumber}
                            </span>
                          </div>
                          <button
                            onClick={() => joinVideoCall(call)}
                            className="text-blue-600 hover:text-primary-800 text-xs"
                          >
                            Join
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Call Instructions */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-medium text-blue-900 mb-2">How to Join Video Calls</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>1. Click "Start Call" to create a video room for your group</p>
          <p>2. Click "Join Call" to open the video call in a new tab</p>
          <p>3. Allow camera and microphone permissions when prompted</p>
          <p>4. Share the join URL with other participants if needed</p>
        </div>
      </div>
    </div>
  );
}

export default VideoCalling;
