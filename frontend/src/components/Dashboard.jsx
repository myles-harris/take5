import React, { useState, useEffect } from 'react';
import { Users, Users2, Video, Calendar, Activity } from 'lucide-react';
import { api } from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    groups: 0,
    activeCalls: 0,
    scheduledCalls: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, groupsRes, schedulingRes] = await Promise.all([
        api.get('/user'),
        api.get('/group'),
        api.get('/scheduling/stats')
      ]);

      setStats({
        users: usersRes.data.length,
        groups: groupsRes.data.length,
        activeCalls: 0, // TODO: Get from video call status
        scheduledCalls: schedulingRes.data.stats?.scheduled || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.users,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Active Groups',
      value: stats.groups,
      icon: Users2,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Active Calls',
      value: stats.activeCalls,
      icon: Video,
      color: 'bg-purple-500',
      change: '+3'
    },
    {
      title: 'Scheduled Calls',
      value: stats.scheduledCalls,
      icon: Calendar,
      color: 'bg-orange-500',
      change: '+5'
    }
  ];

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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your Take5 video calling system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-md ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.title}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button className="btn-primary">
            <Users className="w-4 h-4 mr-2" />
            Add User
          </button>
          <button className="btn-primary">
            <Users2 className="w-4 h-4 mr-2" />
            Create Group
          </button>
          <button className="btn-primary">
            <Video className="w-4 h-4 mr-2" />
            Start Call
          </button>
          <button className="btn-primary">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Call
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          <Activity className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
            Video call completed for "Team Standup" group
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
            New user "John Doe" added to "Marketing Team" group
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
            Call scheduled for "Engineering Team" at 2:00 PM PST
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
