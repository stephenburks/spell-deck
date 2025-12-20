import { useState, useEffect, useMemo, useCallback } from 'react'
import { Box, SimpleGrid } from '@chakra-ui/react'
import SpellCard from './spellCard.jsx'

// Custom hook for virtualization
function useVirtualization(items, itemsPerPage = 50) {
	const [currentPage, setCurrentPage] = useState(0)
	const [isLoadingMore, setIsLoadingMore] = useState(false)

	// Reset page when items change
	useEffect(() => {
		setCurrentPage(0)
	}, [items])

	// Calculate visible items
	const visibleItems = useMemo(() => {
		const endIndex = (currentPage + 1) * itemsPerPage
		return items.slice(0, endIndex)
	}, [items, currentPage, itemsPerPage])

	// Load more function
	const loadMore = useCallback(() => {
		if (isLoadingMore) return

		const totalPages = Math.ceil(items.length / itemsPerPage)
		if (currentPage < totalPages - 1) {
			setIsLoadingMore(true)
			// Simulate async loading for smooth UX
			setTimeout(() => {
				setCurrentPage((prev) => prev + 1)
				setIsLoadingMore(false)
			}, 100)
		}
	}, [currentPage, items.length, itemsPerPage, isLoadingMore])

	// Check if there are more items to load
	const hasMore = useMemo(() => {
		const totalPages = Math.ceil(items.length / itemsPerPage)
		return currentPage < totalPages - 1
	}, [currentPage, items.length, itemsPerPage])

	return {
		visibleItems,
		loadMore,
		hasMore,
		isLoadingMore,
		totalVisible: visibleItems.length,
		totalItems: items.length
	}
}

// Intersection Observer hook for infinite scroll
function useIntersectionObserver(callback, options = {}) {
	const [targetRef, setTargetRef] = useState(null)

	useEffect(() => {
		if (!targetRef) return

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					callback()
				}
			},
			{
				threshold: 0.1,
				rootMargin: '100px',
				...options
			}
		)

		observer.observe(targetRef)

		return () => {
			observer.disconnect()
		}
	}, [targetRef, callback, options])

	return setTargetRef
}

export default function VirtualizedSpellList({
	spells,
	onAction,
	context = 'deck',
	itemsPerPage = 50
}) {
	const { visibleItems, loadMore, hasMore, isLoadingMore, totalVisible, totalItems } =
		useVirtualization(spells, itemsPerPage)

	// Set up intersection observer for infinite scroll
	const loadMoreRef = useIntersectionObserver(loadMore, {
		threshold: 0.1,
		rootMargin: '200px'
	})

	// Handle spell actions
	const handleSpellAction = useCallback(
		(actionType, spell) => {
			onAction?.(actionType, spell)
		},
		[onAction]
	)

	if (!spells || spells.length === 0) {
		return null
	}

	return (
		<Box>
			{/* Spell Grid */}
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

			{/* Load More Trigger */}
			{hasMore && (
				<Box
					ref={loadMoreRef}
					height="100px"
					display="flex"
					alignItems="center"
					justifyContent="center"
					mt={4}>
					{isLoadingMore ? (
						<Box
							className="loading-spinner"
							width="32px"
							height="32px"
							border="3px solid #f3f3f3"
							borderTop="3px solid #3498db"
							borderRadius="50%"
							animation="spin 1s linear infinite"
						/>
					) : (
						<Box
							as="button"
							onClick={loadMore}
							px={4}
							py={2}
							bg="blue.500"
							color="white"
							borderRadius="md"
							_hover={{ bg: 'blue.600' }}
							cursor="pointer">
							Load More Spells ({totalVisible} of {totalItems})
						</Box>
					)}
				</Box>
			)}

			{/* Add CSS for spinner animation */}
			<style jsx>{`
				@keyframes spin {
					0% {
						transform: rotate(0deg);
					}
					100% {
						transform: rotate(360deg);
					}
				}
			`}</style>
		</Box>
	)
}
