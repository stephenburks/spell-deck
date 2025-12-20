import { useState, useEffect, useMemo, useCallback } from 'react'
import { Box, SimpleGrid, Button, Spinner } from '@chakra-ui/react'
import SpellCard from './spellCard.jsx'

/**
 * Custom hook for pagination-based virtualization
 * @param {Array} items - Items to virtualize
 * @param {number} itemsPerPage - Items per page
 * @returns {Object} Virtualization state and controls
 */
const useVirtualization = (items, itemsPerPage = 50) => {
	const [currentPage, setCurrentPage] = useState(0)
	const [isLoading, setIsLoading] = useState(false)

	// Reset when items change
	useEffect(() => {
		setCurrentPage(0)
	}, [items])

	const visibleItems = useMemo(() => {
		const endIndex = (currentPage + 1) * itemsPerPage
		return items.slice(0, endIndex)
	}, [items, currentPage, itemsPerPage])

	const hasMore = useMemo(() => {
		return visibleItems.length < items.length
	}, [visibleItems.length, items.length])

	const loadMore = useCallback(() => {
		if (isLoading || !hasMore) return

		setIsLoading(true)
		// Small delay for smooth UX
		setTimeout(() => {
			setCurrentPage((prev) => prev + 1)
			setIsLoading(false)
		}, 100)
	}, [isLoading, hasMore])

	return {
		visibleItems,
		loadMore,
		hasMore,
		isLoading,
		totalVisible: visibleItems.length,
		totalItems: items.length
	}
}

/**
 * Intersection Observer hook for infinite scroll
 * @param {Function} callback - Function to call when intersecting
 * @returns {Function} Ref setter for target element
 */
const useIntersectionObserver = (callback) => {
	const [targetRef, setTargetRef] = useState(null)

	useEffect(() => {
		if (!targetRef || !callback) return

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					callback()
				}
			},
			{
				threshold: 0.1,
				rootMargin: '200px'
			}
		)

		observer.observe(targetRef)
		return () => observer.disconnect()
	}, [targetRef, callback])

	return setTargetRef
}

/**
 * Virtualized spell list with infinite scroll
 * @param {Array} spells - Array of spell objects
 * @param {Function} onAction - Action handler function
 * @param {string} context - Context for spell cards
 * @param {number} itemsPerPage - Items to load per page
 */
export default function VirtualizedSpellList({
	spells = [],
	onAction,
	context = 'deck',
	itemsPerPage = 50
}) {
	const { visibleItems, loadMore, hasMore, isLoading, totalVisible, totalItems } =
		useVirtualization(spells, itemsPerPage)

	const loadMoreRef = useIntersectionObserver(loadMore)

	const handleSpellAction = useCallback(
		(actionType, spell) => onAction?.(actionType, spell),
		[onAction]
	)

	if (!spells.length) return null

	return (
		<Box>
			<SimpleGrid
				columns={{ base: 1, md: 1, lg: 2, xl: 3 }}
				spacing={3}
				className="spell-list-container">
				{visibleItems.map((spell, index) => (
					<SpellCard
						key={`${spell.index}-${index}`}
						spell={spell}
						context={context}
						onAction={handleSpellAction}
					/>
				))}
			</SimpleGrid>

			{hasMore && (
				<Box
					ref={loadMoreRef}
					height="100px"
					display="flex"
					alignItems="center"
					justifyContent="center"
					mt={4}>
					{isLoading ? (
						<Spinner size="lg" color="blue.500" />
					) : (
						<Button onClick={loadMore} colorScheme="blue" variant="outline">
							Load More ({totalVisible} of {totalItems})
						</Button>
					)}
				</Box>
			)}
		</Box>
	)
}
