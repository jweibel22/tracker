import { useState, useEffect } from 'react'
import { seedDefaultEventTypes } from './db'
import RegisterTab from './components/RegisterTab'
import HistoryTab from './components/HistoryTab'
import RecentTab from './components/RecentTab'
import SettingsTab from './components/SettingsTab'

type Tab = 'register' | 'history' | 'recent' | 'settings'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('register')

  useEffect(() => {
    seedDefaultEventTypes()
  }, [])

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <header className="bg-blue-500 text-white px-4 py-3 text-center font-semibold text-lg">
        Life Event Tracker
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        {activeTab === 'register' && <RegisterTab />}
        {activeTab === 'history' && <HistoryTab />}
        {activeTab === 'recent' && <RecentTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 flex">
        <button
          onClick={() => setActiveTab('register')}
          className={`flex-1 py-3 text-center ${
            activeTab === 'register'
              ? 'text-blue-500 border-t-2 border-blue-500 -mt-[2px]'
              : 'text-gray-500'
          }`}
        >
          <div className="text-xl">+</div>
          <div className="text-xs">Register</div>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-center ${
            activeTab === 'history'
              ? 'text-blue-500 border-t-2 border-blue-500 -mt-[2px]'
              : 'text-gray-500'
          }`}
        >
          <div className="text-xl">📅</div>
          <div className="text-xs">Calendar</div>
        </button>
        <button
          onClick={() => setActiveTab('recent')}
          className={`flex-1 py-3 text-center ${
            activeTab === 'recent'
              ? 'text-blue-500 border-t-2 border-blue-500 -mt-[2px]'
              : 'text-gray-500'
          }`}
        >
          <div className="text-xl">☰</div>
          <div className="text-xs">Recent</div>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-3 text-center ${
            activeTab === 'settings'
              ? 'text-blue-500 border-t-2 border-blue-500 -mt-[2px]'
              : 'text-gray-500'
          }`}
        >
          <div className="text-xl">⚙️</div>
          <div className="text-xs">Settings</div>
        </button>
      </nav>
    </div>
  )
}

export default App
