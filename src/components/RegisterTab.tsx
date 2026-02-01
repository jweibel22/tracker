import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, getTodayString, type EventType } from '../db'

function RegisterTab() {
  const eventTypes = useLiveQuery(() => db.eventTypes.toArray())
  const today = getTodayString()
  const [selectedDate, setSelectedDate] = useState(today)
  const selectedDateEvents = useLiveQuery(
    () => db.events.where('day').equals(selectedDate).toArray(),
    [selectedDate]
  )
  const [numericValues, setNumericValues] = useState<Record<number, string>>({})
  const [feedback, setFeedback] = useState<string | null>(null)

  const isToday = selectedDate === today

  const registeredOnDate = useMemo(() => {
    const set = new Set<number>()
    selectedDateEvents?.forEach((e) => set.add(e.typeId))
    return set
  }, [selectedDateEvents])

  const handleRegister = async (eventType: EventType) => {
    const value = eventType.isNumeric
      ? parseInt(numericValues[eventType.id!] || '0', 10)
      : null

    if (eventType.isNumeric && (isNaN(value!) || numericValues[eventType.id!] === '')) {
      setFeedback('Please enter a value')
      setTimeout(() => setFeedback(null), 2000)
      return
    }

    await db.events.add({
      typeId: eventType.id!,
      day: selectedDate,
      createdAt: new Date().toISOString(),
      value,
    })

    // Clear the input
    setNumericValues((prev) => ({ ...prev, [eventType.id!]: '' }))

    // Show feedback
    setFeedback(`${eventType.name} logged!`)
    setTimeout(() => setFeedback(null), 2000)
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">Register Event</h2>

      {/* Date Picker */}
      <div className="mb-4 flex items-center gap-2">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white"
        />
        {!isToday && (
          <button
            onClick={() => setSelectedDate(today)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium active:bg-blue-600"
          >
            Today
          </button>
        )}
      </div>

      {feedback && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-center">
          {feedback}
        </div>
      )}

      <div className="space-y-3">
        {eventTypes?.map((eventType) => {
          const isRegistered = registeredOnDate.has(eventType.id!)
          return (
            <div
              key={eventType.id}
              className="bg-white rounded-lg shadow p-4 flex items-center gap-3"
            >
              {eventType.isNumeric ? (
                <>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    value={numericValues[eventType.id!] || ''}
                    onChange={(e) =>
                      setNumericValues((prev) => ({
                        ...prev,
                        [eventType.id!]: e.target.value,
                      }))
                    }
                    disabled={isRegistered}
                    className={`w-20 px-3 py-2 border border-gray-300 rounded-lg text-center text-lg ${
                      isRegistered ? 'bg-gray-100 text-gray-400' : ''
                    }`}
                  />
                  <button
                    onClick={() => handleRegister(eventType)}
                    disabled={isRegistered}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium ${
                      isRegistered
                        ? 'bg-gray-300 text-gray-500'
                        : 'bg-blue-500 text-white active:bg-blue-600'
                    }`}
                  >
                    {isRegistered ? `${eventType.name} (done)` : eventType.name}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleRegister(eventType)}
                  disabled={isRegistered}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium ${
                    isRegistered
                      ? 'bg-gray-300 text-gray-500'
                      : 'bg-blue-500 text-white active:bg-blue-600'
                  }`}
                >
                  {isRegistered ? `${eventType.name} (done)` : eventType.name}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {(!eventTypes || eventTypes.length === 0) && (
        <p className="text-gray-500 text-center mt-8">
          No event types configured. Add some in Settings.
        </p>
      )}
    </div>
  )
}

export default RegisterTab
