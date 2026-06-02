import { useState, useEffect, useRef } from 'react'

export function useDebounce(value, delay) {
	const [debouncedValue, setDebouncedValue] = useState(value)
	const [isDebouncing, setIsDebouncing] = useState(false)
	const idRef = useRef(0)

	useEffect(() => {
		const id = ++idRef.current
		setIsDebouncing(true)
		const handler = setTimeout(() => {
			if (id === idRef.current) {
				setDebouncedValue(value)
				setIsDebouncing(false)
			}
		}, delay)
		return () => clearTimeout(handler)
	}, [value, delay])

	return { debouncedValue, isDebouncing }
}
