import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Play, Pause, Settings } from 'lucide-react';
import { api } from '../services/api';

function Scheduling() {
  const [scheduledCalls, setScheduledCalls] = useState([]);
  const [schedulingStats, setSchedulingStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSchedulingEnabled, setIsSchedulingEnabled] = useState(false);

  useEffect(() => {
    fetchSchedulingData();
  }, []);

  const fetchSchedulingData = async () => {
    try {
      const [callsRes, statsRes] = await Promise.all([
        api.get('/scheduling/calls'),
        api.get('/scheduling/stats')
      ]);
      setScheduledCalls(callsRes.data);
      setSchedulingStats(statsRes.data.stats);
      setIsSchedulingEnabled(statsRes.data.stats?.isRunning || false);
    } catch (error) {
      console.error('Error fetching scheduling data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleScheduling = async () => {
    try {
      // This would be implemented in the backend
      setIsSchedulingEnabled(!isSchedulingEnabled);
      fetchSchedulingData();
    } catch (error) {
      console.error('Error toggling scheduling:', error);
    }
  };

  const scheduleCall = async (groupId, scheduledTime) => {
    try {
      await api.post('/scheduling/schedule', {
        groupId,
        scheduledTime: new Date(scheduledTime).toISOString()
      });
      fetchSchedulingData();
    } catch (error) {
      console.error('Error scheduling call:', error);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Call Scheduling</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage automated call scheduling for your groups
          </p>
        </div>
        <button
          onClick={toggleScheduling}
          className={`btn-primary ${
            isSchedulingEnabled 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isSchedulingEnabled ? (
            <>
              <Pause className="w-4 h-4 mr-2" />
              Disable Scheduling
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Enable Scheduling
            </>
          )}
        </button>
      </div>

      {/* Scheduling Status */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Scheduling Status</h2>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              isSchedulingEnabled ? 'bg-green-400' : 'bg-red-400'
            }`}></div>
            <span className="text-sm font-medium text-gray-700">
              {isSchedulingEnabled ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        
        {schedulingStats && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {schedulingStats.totalCalls || 0}
              </div>
              <div className="text-sm text-gray-500">Total Calls</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {schedulingStats.scheduled || 0}
              </div>
              <div className="text-sm text-gray-500">Scheduled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {schedulingStats.completed || 0}
              </div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {schedulingStats.failed || 0}
              </div>
              <div className="text-sm text-gray-500">Failed</div>
            </div>
          </div>
        )}
      </div>

      {/* Scheduled Calls */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Scheduled Calls</h2>
        {scheduledCalls.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No scheduled calls</p>
            <p className="text-sm">Calls will appear here when groups are scheduled</p>
          </div>
        ) : (
          <div className="space-y-4">
            {scheduledCalls.map((call) => (
              <div key={call.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {call.groupName || `Group ${call.groupId}`}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(call.scheduledTime).toLocaleString()}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {call.participants || 0} participants
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      call.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      call.status === 'executing' ? 'bg-yellow-100 text-yellow-800' :
                      call.status === 'completed' ? 'bg-green-100 text-green-800' :
                      call.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {call.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scheduling Information */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-medium text-blue-900 mb-2">How Scheduling Works</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>• Groups are automatically scheduled based on their frequency and cadence settings</p>
          <p>• Daily groups are called once per day at their scheduled time</p>
          <p>• Weekly groups are called on random days within the week</p>
          <p>• Monthly groups are called on random days within the month</p>
          <p>• No group will be called more than once per day</p>
        </div>
      </div>

      {/* Settings */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Scheduling Settings</h2>
          <Settings className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Automatic Scheduling</h3>
              <p className="text-sm text-gray-500">
                Enable automatic call scheduling for all active groups
              </p>
            </div>
            <button
              onClick={toggleScheduling}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isSchedulingEnabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isSchedulingEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Scheduling;
