'use client';

import { useState } from 'react';
import { Shield, Bell, Palette, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Settings</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage your preferences and settings</p>
      </div>

      {/* Notifications */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-gray-500">Receive notifications via email</p>
            </div>
            <button
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                emailNotifications ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  emailNotifications ? 'transform translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-gray-500">Receive push notifications</p>
            </div>
            <button
              onClick={() => setPushNotifications(!pushNotifications)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                pushNotifications ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  pushNotifications ? 'transform translate-x-6' : ''
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-gray-500">Enable dark theme</p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                darkMode ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  darkMode ? 'transform translate-x-6' : ''
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Language & Region */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Language & Region
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium mb-2">Language</p>
            <select className="w-full px-3 py-2 border rounded-lg">
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
            </select>
          </div>

          <div>
            <p className="font-medium mb-2">Timezone</p>
            <select className="w-full px-3 py-2 border rounded-lg">
              <option>UTC (GMT+0:00)</option>
              <option>EST (GMT-5:00)</option>
              <option>PST (GMT-8:00)</option>
              <option>IST (GMT+5:30)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="py-3 border-b">
            <p className="font-medium mb-1">Change Password</p>
            <p className="text-sm text-gray-500 mb-3">Update your password regularly</p>
            <Button variant="outline" size="sm">
              Change Password
            </Button>
          </div>

          <div className="py-3">
            <p className="font-medium mb-1">Two-Factor Authentication</p>
            <p className="text-sm text-gray-500 mb-3">Add an extra layer of security</p>
            <Button variant="outline" size="sm">
              Enable 2FA
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <Button size="lg">
          Save All Settings
        </Button>
      </div>
    </div>
  );
}
