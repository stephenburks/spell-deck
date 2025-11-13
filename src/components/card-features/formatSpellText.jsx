/**
 * Formats spell text into readable blocks
 * @param {string|string[]} text - Raw spell text to format
 * @returns {Array} Formatted blocks with consecutive lists and tables merged
 */
export const formatSpellText = (text) => {
	if (!text) return []

	let paragraphs = []

	if (Array.isArray(text)) {
		// If it's an array, each element is potentially a separate paragraph
		paragraphs = text
			.filter((item) => item && typeof item === 'string')
			.map((item) => item.trim())
			.filter((item) => item.length > 0)
	} else if (typeof text === 'string') {
		// If it's a string, split by double line breaks
		paragraphs = text
			.split(/\n\s*\n/)
			.map((p) => p.trim())
			.filter((p) => p.length > 0)
	} else {
		console.warn('formatSpellText received invalid input:', text)
		return []
	}

	const blocks = paragraphs.map((paragraph) => {
		const trimmed = paragraph.trim()

		// Detect markdown tables (lines with pipes)
		if (trimmed.includes('|')) {
			const rows = trimmed
				.split('\n')
				.map((row) => row.trim())
				.filter((row) => row.length > 0 && row.includes('|'))
				.map((row) =>
					row
						.split('|')
						.map((cell) => cell.trim())
						.filter(Boolean)
				)
				.filter((row) => row.length > 0)

			if (rows.length > 0) {
				return { type: 'table', content: rows }
			}
		}

		// Detect bullet lists
		if (/^\s*[-•*]/.test(trimmed)) {
			const items = trimmed
				.split('\n')
				.map((line) => {
					let item = line.replace(/^\s*[-•*]\s*/, '').trim()
					// Apply bold formatting to list items too
					item = item
						.replace(/\*\*\*(.*?)\*\*\*/g, '<strong>$1</strong>')
						.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
					return item
				})
				.filter(Boolean)
			return { type: 'list', content: items }
		}

		// Handle bold text formatting - multiple patterns
		let processedContent = trimmed
			// Handle ***Text*** pattern
			.replace(/\*\*\*(.*?)\*\*\*/g, '<strong>$1</strong>')
			// Handle **Text** pattern
			.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
			// Handle cases where there might be unmatched asterisks at the start of lines
			.replace(/^\*\*\*([^*]+)\.\*\*\*/gm, '<strong>$1.</strong>')

		// Regular paragraph
		return { type: 'paragraph', content: processedContent }
	})

	// Merge consecutive blocks of the same type (lists and tables)
	return blocks.reduce((acc, block) => {
		const lastBlock = acc[acc.length - 1]

		if ((block.type === 'list' || block.type === 'table') && lastBlock?.type === block.type) {
			lastBlock.content = [...lastBlock.content, ...block.content]
			return acc
		}

		acc.push(block)
		return acc
	}, [])
}
