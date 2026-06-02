import { useState, useEffect } from 'react'

export function useDebounce(value, delay) {
	const [debouncedValue, setDebouncedValue] = useState(value)
	const [isDebouncing, setIsDebouncing] = useState(false)

	useEffect(() => {
		if (value !== debouncedValue) setIsDebouncing(true)

		const handler = setTimeout(() => {
			setDebouncedValue(value)
			setIsDebouncing(false)
		}, delay)

		return () => clearTimeout(handler)
	}, [value, delay, debouncedValue])

	return { debouncedValue, isDebouncing }
}
