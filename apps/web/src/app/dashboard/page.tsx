'use client';

import { useTheme } from 'next-themes';
import { MainLayout } from '@/components/layouts/MainLayout';

interface StatCard {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  accent?: 'blue' | 'green' | 'orange' | 'red';
}

interface RoomStatus {
  code: string;
  name: string;
  status: 'available' | 'occupied' | 'maintenance';
  occupancy?: number;
}

interface Task {
  id: number;
  title: string;
  course: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}

export default function DashboardPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const themeClasses = {
    cardBg: isDark ? 'bg-slate-800/40' : 'bg-white/60',
    cardBorder: isDark ? 'border-blue-500/20' : 'border-blue-500/15',
    text: isDark ? 'text-slate-50' : 'text-slate-950',
    secondaryText: isDark ? 'text-slate-400' : 'text-slate-600',
    accentBg: isDark ? 'bg-blue-500/15' : 'bg-blue-500/10',
  };

  const stats: StatCard[] = [
    {
      label: 'Available Rooms',
      value: '08',
      subtitle: '~2 hours from gateway',
      icon: '📍',
    },
    {
      label: 'Active Courses',
      value: '02',
      subtitle: 'CS211, CS241',
      icon: '📚',
    },
    {
      label: 'Next Session',
      value: 'CS211 @ DLT1',
      subtitle: 'Starts in 45 mins',
      icon: '⏰',
    },
  ];

  const rooms: RoomStatus[] = [
    { code: 'DLT1', name: 'Digital Lecture Theater', status: 'occupied', occupancy: 85 },
    { code: 'DLT2', name: 'Digital Lecture Theater', status: 'occupied', occupancy: 62 },
    { code: 'LT1', name: 'Lecture Theater 1', status: 'available', occupancy: 0 },
    { code: 'A401', name: 'Advanced Systems Lab', status: 'available', occupancy: 0 },
  ];

  const upcomingTasks: Task[] = [
    {
      id: 1,
      title: 'DSA Assignment 4',
      course: 'CS211 Data Structures',
      dueDate: 'Today, 11:59 PM',
      priority: 'high',
    },
    {
      id: 2,
      title: 'MUP Lab Prep',
      course: 'CS241 Microprocessors',
      dueDate: 'Tomorrow',
      priority: 'medium',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'bg-red-500/10 text-red-600 dark:text-red-400';
      case 'available':
        return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'maintenance':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-500/5';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-500/5';
      case 'low':
        return 'border-l-green-500 bg-green-500/5';
      default:
        return 'border-l-blue-500 bg-blue-500/5';
    }
  };

  return (
    <MainLayout>
      <div className={`min-h-screen overflow-auto ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="max-w-7xl mx-auto p-8 space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className={`text-4xl font-bold ${themeClasses.text}`}>
              Academic Overview
            </h1>
            <p className={themeClasses.secondaryText}>
              Welcome back, Vedant. Here's what's happening today.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className={`${themeClasses.cardBg} border ${themeClasses.cardBorder} rounded-2xl p-6 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-200`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`${themeClasses.accentBg} p-3 rounded-lg text-blue-500 text-xl`}>
                    {stat.icon}
                  </div>
                </div>
                <p className={`text-sm font-semibold uppercase tracking-wide ${themeClasses.secondaryText} mb-2`}>
                  {stat.label}
                </p>
                <h3 className={`text-3xl font-bold ${themeClasses.text} mb-1`}>
                  {stat.value}
                </h3>
                {stat.subtitle && (
                  <p className={`text-sm ${themeClasses.secondaryText}`}>
                    {stat.subtitle}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Campus Status */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className={`text-2xl font-bold ${themeClasses.text} mb-4`}>
                  Live Campus Status
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rooms.map((room) => (
                    <div
                      key={room.code}
                      className={`${themeClasses.cardBg} border ${themeClasses.cardBorder} rounded-2xl overflow-hidden backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200`}
                    >
                      {/* Room Image Placeholder */}
                      <div className={`h-24 ${isDark ? 'bg-gradient-to-br from-slate-700 to-slate-800' : 'bg-gradient-to-br from-slate-200 to-slate-300'} flex items-center justify-center relative`}>
                        <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(room.status)}`}>
                          {room.status === 'occupied'
                            ? 'In Use'
                            : room.status === 'maintenance'
                            ? 'Maintenance'
                            : 'Available'}
                        </div>
                      </div>

                      {/* Room Info */}
                      <div className="p-4">
                        <h4 className={`text-lg font-bold ${themeClasses.text} mb-1`}>
                          {room.code}
                        </h4>
                        <p className={`text-sm ${themeClasses.secondaryText}`}>
                          {room.name}
                        </p>
                        {room.occupancy !== undefined && (
                          <div className="mt-3">
                            <div className="flex justify-between items-center mb-2">
                              <span className={`text-xs font-semibold ${themeClasses.secondaryText}`}>
                                Occupancy
                              </span>
                              <span className={`text-xs font-bold ${themeClasses.text}`}>
                                {room.occupancy}%
                              </span>
                            </div>
                            <div className={`h-1.5 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'} overflow-hidden`}>
                              <div
                                className={`h-full ${
                                  room.occupancy > 75
                                    ? 'bg-red-500'
                                    : room.occupancy > 40
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                }`}
                                style={{ width: `${room.occupancy}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Upcoming Tasks */}
              <div>
                <h3 className={`text-lg font-bold ${themeClasses.text} mb-4 flex items-center gap-2`}>
                  <span className="text-blue-500">⏱️</span>
                  Upcoming Tasks
                </h3>
                <div className="space-y-3">
                  {upcomingTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`${themeClasses.cardBg} border-l-4 ${getPriorityColor(task.priority)} rounded-lg p-4 backdrop-blur-sm`}
                    >
                      <h4 className={`font-semibold ${themeClasses.text} mb-1`}>
                        {task.title}
                      </h4>
                      <p className={`text-sm ${themeClasses.secondaryText} mb-2`}>
                        {task.course}
                      </p>
                      <p className={`text-xs ${themeClasses.secondaryText}`}>
                        Due: {task.dueDate}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className={`text-lg font-bold ${themeClasses.text} mb-4`}>
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <button className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg">
                    Book a Room
                  </button>
                  <button className={`w-full px-4 py-3 ${themeClasses.cardBg} border ${themeClasses.cardBorder} ${themeClasses.text} font-semibold rounded-lg transition-all duration-200 hover:shadow-md`}>
                    View Schedule
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className={`${themeClasses.cardBg} border ${themeClasses.cardBorder} rounded-2xl p-6 backdrop-blur-sm`}>
            <h3 className={`text-lg font-bold ${themeClasses.text} mb-4`}>
              Campus Locations Guide
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'A301 Lab', distance: '~5 mins away' },
                { name: 'G400 Class', distance: '~8 mins away' },
                { name: 'L312 Theater', distance: '~3 mins away' },
                { name: 'R500 Study', distance: '~10 mins away' },
              ].map((location, idx) => (
                <div key={idx} className="text-center">
                  <div className={`w-12 h-12 rounded-full ${themeClasses.accentBg} mx-auto mb-2 flex items-center justify-center text-blue-500 text-lg`}>
                    📍
                  </div>
                  <p className={`text-sm font-semibold ${themeClasses.text}`}>
                    {location.name}
                  </p>
                  <p className={`text-xs ${themeClasses.secondaryText}`}>
                    {location.distance}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
