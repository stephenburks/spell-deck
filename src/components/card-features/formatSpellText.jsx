/**
 * Formats spell text with proper paragraph breaks and special formatting
 * @param {string|string[]} text - Raw spell text to format
 * @returns {Array} Formatted paragraphs with special formatting
 */
export const formatSpellText = (text) => {
	// Handle empty or invalid input
	if (!text) return []

	// Convert array to string if needed
	const textContent = Array.isArray(text) ? text.join('\n\n') : text

	// Ensure we have a string
	if (typeof textContent !== 'string') {
		console.warn('formatSpellText received invalid input:', text)
		return []
	}

	// Split into true paragraphs first (double line breaks)
	const paragraphs = textContent.split(/\n\s*\n/).filter(Boolean)

	// ...rest of your existing code...
	return paragraphs.map((paragraph) => {
		// Handle bullet points
		if (paragraph.match(/^[•\-*]/m)) {
			return {
				type: 'list',
				content: paragraph
					.split(/\n/)
					.map((item) => item.replace(/^[•\-*]\s*/, '').trim())
					.filter(Boolean)
			}
		}

		// Handle table-like content
		if (paragraph.match(/\S\s{3,}\S/)) {
			return {
				type: 'table',
				content: paragraph.split(/\n/).map((row) => row.split(/\s{3,}/).map((cell) => cell.trim()))
			}
		}

		// Regular paragraphs
		return {
			type: 'paragraph',
			content: paragraph.trim()
		}
	})
}
