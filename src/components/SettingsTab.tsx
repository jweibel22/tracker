import { useState, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, exportData, importData, EVENT_COLORS } from '../db'

function SettingsTab() {
  const eventTypes = useLiveQuery(() => db.eventTypes.toArray())
  const [newTypeName, setNewTypeName] = useState('')
  const [newTypeIsNumeric, setNewTypeIsNumeric] = useState(false)
  const [newTypeColor, setNewTypeColor] = useState(EVENT_COLORS[0])
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleAddType = async () => {
    if (!newTypeName.trim()) {
      showMessage('error', 'Please enter a name')
      return
    }

    await db.eventTypes.add({
      name: newTypeName.trim(),
      isNumeric: newTypeIsNumeric,
      color: newTypeColor,
    })

    setNewTypeName('')
    setNewTypeIsNumeric(false)
    setNewTypeColor(EVENT_COLORS[0])
    showMessage('success', 'Event type added!')
  }

  const handleDeleteType = async (id: number) => {
    if (confirm('Delete this event type? Events of this type will remain in history.')) {
      await db.eventTypes.delete(id)
      showMessage('success', 'Event type deleted')
    }
  }

  const handleExport = async () => {
    try {
      const data = await exportData()
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `life-events-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showMessage('success', 'Data exported!')
    } catch {
      showMessage('error', 'Export failed')
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      await importData(text)
      showMessage('success', 'Data imported!')
    } catch {
      showMessage('error', 'Import failed - invalid file format')
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">Settings</h2>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-center ${
            message.type === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Export/Import Section */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="font-medium text-gray-700 mb-3">Backup & Restore</h3>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg font-medium active:bg-green-600"
          >
            Export Data
          </button>
          <label className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <div className="bg-orange-500 text-white py-3 px-4 rounded-lg font-medium text-center cursor-pointer active:bg-orange-600">
              Import Data
            </div>
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Save exports to your Dropbox or Synology Drive folder for backup.
        </p>
      </div>

      {/* Add Event Type Section */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="font-medium text-gray-700 mb-3">Add Event Type</h3>
        <input
          type="text"
          placeholder="Event name"
          value={newTypeName}
          onChange={(e) => setNewTypeName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
        />
        <label className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            checked={newTypeIsNumeric}
            onChange={(e) => setNewTypeIsNumeric(e.target.checked)}
            className="w-5 h-5"
          />
          <span className="text-gray-700">Has numeric value</span>
        </label>
        <div className="mb-3">
          <span className="text-gray-700 text-sm block mb-2">Color</span>
          <div className="flex gap-2 flex-wrap">
            {EVENT_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setNewTypeColor(color)}
                className={`w-8 h-8 rounded-full ${
                  newTypeColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
        <button
          onClick={handleAddType}
          className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium active:bg-blue-600"
        >
          Add Event Type
        </button>
      </div>

      {/* Existing Event Types */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-medium text-gray-700 mb-3">Event Types</h3>
        {eventTypes?.length ? (
          <ul className="space-y-2">
            {eventTypes.map((et) => (
              <li
                key={et.id}
                className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: et.color || '#3b82f6' }}
                  />
                  <span className="text-gray-700">{et.name}</span>
                  {et.isNumeric && (
                    <span className="ml-1 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                      numeric
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteType(et.id!)}
                  className="text-red-500 text-sm"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No event types yet</p>
        )}
      </div>
    </div>
  )
}

export default SettingsTab
