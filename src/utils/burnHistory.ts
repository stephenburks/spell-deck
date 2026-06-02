export const BURN_HISTORY_KEY = 'spell-deck-burn-history'

export interface BurnEntry {
	name: string
	level: number
	timestamp: number
}

export const loadBurnHistory = (): BurnEntry[] => {
	try {
		const stored = localStorage.getItem(BURN_HISTORY_KEY)
		return stored ? JSON.parse(stored) : []
	} catch {
		return []
	}
}

const saveBurnHistory = (entries: BurnEntry[]): void => {
	localStorage.setItem(BURN_HISTORY_KEY, JSON.stringify(entries))
}

export const addBurnedSpell = (name: string, level: number): void => {
	const history = loadBurnHistory()
	history.push({ name, level, timestamp: Date.now() })
	saveBurnHistory(history)
}

export const clearBurnHistory = (): void => {
	localStorage.removeItem(BURN_HISTORY_KEY)
}

export const getRelativeTime = (timestamp: number): string => {
	const seconds = Math.floor((Date.now() - timestamp) / 1000)
	if (seconds < 60) return 'just now'
	const minutes = Math.floor(seconds / 60)
	if (minutes < 60) return `${minutes} min ago`
	const hours = Math.floor(minutes / 60)
	if (hours < 24) return `${hours}h ago`
	const days = Math.floor(hours / 24)
	return `${days}d ago`
}
