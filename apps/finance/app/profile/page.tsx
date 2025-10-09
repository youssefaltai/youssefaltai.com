'use client'

import { useState } from 'react'
import { Card, CardSection, ListItem } from '@repo/ui'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()
  const [currency, setCurrency] = useState('EGP')
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)

  const handleLogout = async () => {
    // Implement logout logic here
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-ios-gray-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="px-4 pt-6 pb-4">
          <h1 className="text-ios-title-1 font-bold text-ios-label-primary">Profile</h1>
          <p className="text-ios-body text-ios-gray-1 mt-1">Manage your account settings</p>
        </div>

        {/* User Info */}
        <div className="px-4 mb-6">
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-ios-blue to-ios-blue/80 rounded-full flex items-center justify-center text-white text-ios-title-2 font-bold">
                Y
              </div>
              <div className="flex-1">
                <h2 className="text-ios-headline font-semibold text-ios-label-primary">Youssef Altai</h2>
                <p className="text-ios-footnote text-ios-gray-1 mt-0.5">youssefaltai@example.com</p>
              </div>
              <button className="text-ios-blue text-ios-callout font-medium">
                Edit
              </button>
            </div>
          </Card>
        </div>

        {/* Settings Sections */}
        <div className="px-4 space-y-6">
          {/* Preferences */}
          <CardSection title="Preferences">
            <div className="flex items-center justify-between px-4 py-3 border-b border-ios-gray-5">
              <span className="text-ios-body text-ios-label-primary">Currency</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-transparent text-ios-body text-ios-gray-1 border-none focus:outline-none"
              >
                <option value="EGP">EGP (E£)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GOLD_G">Gold (g)</option>
              </select>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-b border-ios-gray-5">
              <span className="text-ios-body text-ios-label-primary">Dark Mode</span>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-12 h-7 rounded-full transition-colors relative ${
                  darkMode ? 'bg-ios-green' : 'bg-ios-gray-3'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-ios-body text-ios-label-primary">Notifications</span>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-7 rounded-full transition-colors relative ${
                  notifications ? 'bg-ios-green' : 'bg-ios-gray-3'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${
                    notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </CardSection>

          {/* Data & Privacy */}
          <CardSection title="Data & Privacy">
            <ListItem label="Export Data" chevron />
            <ListItem label="Backup & Restore" chevron />
            <ListItem label="Privacy Policy" chevron />
          </CardSection>

          {/* Security */}
          <CardSection title="Security">
            <ListItem label="Change Password" chevron />
            <ListItem label="Two-Factor Authentication" chevron />
            <ListItem label="Face ID / Touch ID" value="Enabled" />
          </CardSection>

          {/* About */}
          <CardSection title="About">
            <ListItem label="Version" value="1.0.0" />
            <ListItem label="Terms of Service" chevron />
            <ListItem label="Help & Support" chevron />
          </CardSection>
        </div>

        {/* Logout Button */}
        <div className="px-4 py-6">
          <button
            onClick={handleLogout}
            className="w-full py-3 bg-ios-red text-white rounded-ios font-semibold hover:bg-ios-red/90 active:scale-95 transition-all"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  )
}

