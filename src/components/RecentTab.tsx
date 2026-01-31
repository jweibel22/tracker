import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'

function RecentTab() {
  const [filterTypeId, setFilterTypeId] = useState<number | null>(null)

  const eventTypes = useLiveQuery(() => db.eventTypes.toArray())
  const events = useLiveQuery(() => db.events.orderBy('createdAt').reverse().toArray())

  const eventTypeMap = useMemo(() => {
    const map: Record<number, { name: string; color: string }> = {}
    eventTypes?.forEach((et) => {
      map[et.id!] = { name: et.name, color: et.color || '#3b82f6' }
    })
    return map
  }, [eventTypes])

  const filteredEvents = useMemo(() => {
    if (!events) return []
    if (filterTypeId === null) return events
    return events.filter((e) => e.typeId === filterTypeId)
  }, [events, filterTypeId])

  const formatDate = (day: string) => {
    return new Date(day + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleDelete = async (eventId: number) => {
    if (confirm('Delete this event?')) {
      await db.events.delete(eventId)
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">Recent Events</h2>

      {/* Filter */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFilterTypeId(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium ${
            filterTypeId === null
              ? 'bg-gray-700 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          All
        </button>
        {eventTypes?.map((et) => (
          <button
            key={et.id}
            onClick={() => setFilterTypeId(et.id!)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 ${
              filterTypeId === et.id
                ? 'ring-2 ring-offset-1 ring-gray-400'
                : ''
            }`}
            style={{
              backgroundColor: filterTypeId === et.id ? et.color : `${et.color}33`,
              color: filterTypeId === et.id ? 'white' : 'inherit',
            }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: filterTypeId === et.id ? 'white' : et.color }}
            />
            {et.name}
          </button>
        ))}
      </div>

      {/* Event List */}
      {filteredEvents.length > 0 ? (
        <ul className="bg-white rounded-lg shadow divide-y divide-gray-100">
          {filteredEvents.map((event) => {
            const eventType = eventTypeMap[event.typeId]
            return (
              <li
                key={event.id}
                className="p-3 flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: eventType?.color || '#3b82f6' }}
                  />
                  <div>
                    <div className="text-gray-700 font-medium">
                      {eventType?.name || 'Unknown'}
                      {event.value !== null && (
                        <span className="ml-2 text-blue-600">({event.value})</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{formatDate(event.day)}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(event.id!)}
                  className="text-red-500 text-sm px-2 py-1"
                >
                  Delete
                </button>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-gray-500 text-center mt-8">
          {filterTypeId !== null ? 'No events of this type' : 'No events yet'}
        </p>
      )}
    </div>
  )
}

export default RecentTab
