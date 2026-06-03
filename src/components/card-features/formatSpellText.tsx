interface TextBlock {
	type: 'list' | 'table' | 'paragraph'
	content: string[] | string[][]
}

/**
 * Formats spell text into readable blocks
 * @param text - Raw spell text to format (string array from API, or plain string)
 * @returns Formatted blocks with consecutive lists and tables merged
 */
export const formatSpellText = (text: string | string[] | undefined | null): TextBlock[] => {
	if (!text) return []

	let paragraphs: string[] = []

	if (Array.isArray(text)) {
		paragraphs = text
			.filter((item): item is string => item != null && typeof item === 'string')
			.map((item) => item.trim())
			.filter((item) => item.length > 0)
	} else if (typeof text === 'string') {
		paragraphs = text
			.split(/\n\s*\n/)
			.map((p) => p.trim())
			.filter((p) => p.length > 0)
	} else {
		console.warn('formatSpellText received invalid input:', text)
		return []
	}

	const blocks: TextBlock[] = paragraphs.map((paragraph) => {
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
				.map((line) => line.replace(/^\s*[-•*]\s*/, '').trim())
				.filter(Boolean)
			return { type: 'list', content: items }
		}

		// Regular paragraph — pass through as-is for react-markdown
		return { type: 'paragraph', content: trimmed }
	})

	// Merge consecutive blocks of the same type (lists and tables)
	return blocks.reduce<TextBlock[]>((acc, block) => {
		const lastBlock = acc[acc.length - 1]

		if ((block.type === 'list' || block.type === 'table') && lastBlock?.type === block.type) {
			lastBlock.content = [...lastBlock.content, ...block.content]
			return acc
		}

		acc.push(block)
		return acc
	}, [])
}
