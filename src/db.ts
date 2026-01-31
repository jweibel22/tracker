import Dexie, { type EntityTable } from 'dexie'

export interface EventType {
  id?: number
  name: string
  isNumeric: boolean
  color: string
}

export const EVENT_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#22c55e', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
]

export interface Event {
  id?: number
  typeId: number
  day: string // ISO date string YYYY-MM-DD
  createdAt: string // ISO datetime string
  value: number | null
}

const db = new Dexie('LifeEventTracker') as Dexie & {
  eventTypes: EntityTable<EventType, 'id'>
  events: EntityTable<Event, 'id'>
}

db.version(1).stores({
  eventTypes: '++id, name',
  events: '++id, typeId, day, createdAt'
})

db.version(2).stores({
  eventTypes: '++id, name',
  events: '++id, typeId, day, createdAt'
}).upgrade(tx => {
  return tx.table('eventTypes').toCollection().modify((eventType, ref) => {
    if (!eventType.color) {
      ref.value.color = EVENT_COLORS[ref.value.id! % EVENT_COLORS.length]
    }
  })
})

export { db }

// Helper to get today's date as YYYY-MM-DD
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

// Export all data as JSON
export async function exportData(): Promise<string> {
  const eventTypes = await db.eventTypes.toArray()
  const events = await db.events.toArray()
  return JSON.stringify({ eventTypes, events }, null, 2)
}

// Import data from JSON
export async function importData(jsonString: string): Promise<void> {
  const data = JSON.parse(jsonString)

  await db.transaction('rw', [db.eventTypes, db.events], async () => {
    // Clear existing data
    await db.eventTypes.clear()
    await db.events.clear()

    // Import new data
    if (data.eventTypes && Array.isArray(data.eventTypes)) {
      await db.eventTypes.bulkAdd(data.eventTypes)
    }
    if (data.events && Array.isArray(data.events)) {
      await db.events.bulkAdd(data.events)
    }
  })
}

// Seed some default event types if database is empty
export async function seedDefaultEventTypes(): Promise<void> {
  const count = await db.eventTypes.count()
  if (count === 0) {
    await db.eventTypes.bulkAdd([
      { name: 'Exercise', isNumeric: false, color: '#22c55e' },
      { name: 'Meditation', isNumeric: false, color: '#8b5cf6' },
      { name: 'Water (glasses)', isNumeric: true, color: '#3b82f6' },
      { name: 'Sleep (hours)', isNumeric: true, color: '#06b6d4' },
    ])
  }
}
