import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'

function HistoryTab() {
  const [currentDate, setCurrentDate] = useState(new Date())

  const eventTypes = useLiveQuery(() => db.eventTypes.toArray())
  const events = useLiveQuery(() => db.events.toArray())

  const eventTypeMap = useMemo(() => {
    const map: Record<number, string> = {}
    eventTypes?.forEach((et) => {
      map[et.id!] = et.name
    })
    return map
  }, [eventTypes])

  // Get calendar data for current month
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const startPadding = firstDay.getDay() // 0 = Sunday
    const daysInMonth = lastDay.getDate()

    // Group events by day
    const eventsByDay: Record<string, typeof events> = {}
    events?.forEach((event) => {
      if (!eventsByDay[event.day]) {
        eventsByDay[event.day] = []
      }
      eventsByDay[event.day]!.push(event)
    })

    return { year, month, startPadding, daysInMonth, eventsByDay }
  }, [currentDate, events])

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const formatDayKey = (day: number) => {
    const year = calendarData.year
    const month = String(calendarData.month + 1).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    return `${year}-${month}-${dayStr}`
  }

  const today = new Date().toISOString().split('T')[0]

  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const handleDelete = async (eventId: number) => {
    if (confirm('Delete this event?')) {
      await db.events.delete(eventId)
    }
  }

  return (
    <div className="p-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevMonth}
          className="p-2 text-blue-500 font-bold text-xl"
        >
          &lt;
        </button>
        <h2 className="text-lg font-semibold text-gray-700">
          {monthNames[calendarData.month]} {calendarData.year}
        </h2>
        <button
          onClick={goToNextMonth}
          className="p-2 text-blue-500 font-bold text-xl"
        >
          &gt;
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs text-gray-500 font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for padding */}
        {Array.from({ length: calendarData.startPadding }).map((_, i) => (
          <div key={`pad-${i}`} className="aspect-square" />
        ))}

        {/* Day cells */}
        {Array.from({ length: calendarData.daysInMonth }).map((_, i) => {
          const day = i + 1
          const dayKey = formatDayKey(day)
          const dayEvents = calendarData.eventsByDay[dayKey] || []
          const hasEvents = dayEvents.length > 0
          const isToday = dayKey === today

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(dayKey === selectedDay ? null : dayKey)}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm relative
                ${isToday ? 'ring-2 ring-blue-500' : ''}
                ${hasEvents ? 'bg-blue-100' : 'bg-white'}
                ${selectedDay === dayKey ? 'bg-blue-200' : ''}
              `}
            >
              <span className={isToday ? 'font-bold text-blue-600' : 'text-gray-700'}>
                {day}
              </span>
              {hasEvents && (
                <span className="text-xs text-blue-600">{dayEvents.length}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected Day Details */}
      {selectedDay && (
        <div className="mt-4 bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-700 mb-2">
            {new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </h3>
          {calendarData.eventsByDay[selectedDay]?.length ? (
            <ul className="space-y-2">
              {calendarData.eventsByDay[selectedDay]?.map((event) => (
                <li
                  key={event.id}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                >
                  <span className="text-gray-700">
                    {eventTypeMap[event.typeId] || 'Unknown'}
                  </span>
                  <div className="flex items-center gap-3">
                    {event.value !== null && (
                      <span className="text-blue-600 font-medium">{event.value}</span>
                    )}
                    <button
                      onClick={() => handleDelete(event.id!)}
                      className="text-red-500 text-sm px-2 py-1"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No events on this day</p>
          )}
        </div>
      )}
    </div>
  )
}

export default HistoryTab
