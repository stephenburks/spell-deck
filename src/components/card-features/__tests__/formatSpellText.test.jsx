import { describe, it, expect } from 'vitest'
import { formatSpellText } from '../formatSpellText'

describe('formatSpellText', () => {
	it('returns empty array for null', () => {
		expect(formatSpellText(null)).toEqual([])
	})

	it('returns empty array for undefined', () => {
		expect(formatSpellText(undefined)).toEqual([])
	})

	it('returns empty array for empty string', () => {
		expect(formatSpellText('')).toEqual([])
	})

	it('returns empty array for non-string non-array input', () => {
		expect(formatSpellText(42)).toEqual([])
	})

	it('handles single paragraph string', () => {
		const result = formatSpellText('You create a burst of fire.')
		expect(result).toHaveLength(1)
		expect(result[0]).toEqual({ type: 'paragraph', content: 'You create a burst of fire.' })
	})

	it('handles multi-paragraph string split on double newline', () => {
		const result = formatSpellText('First paragraph.\n\nSecond paragraph.')
		expect(result).toHaveLength(2)
		expect(result[0].type).toBe('paragraph')
		expect(result[1].type).toBe('paragraph')
	})

	it('handles array input', () => {
		const result = formatSpellText(['Line one', 'Line two'])
		expect(result).toHaveLength(2)
	})

	it('filters out empty strings from array', () => {
		const result = formatSpellText(['', 'Valid', '  '])
		expect(result).toHaveLength(1)
	})

	it('filters out null/undefined from array', () => {
		const result = formatSpellText(['Valid', null, undefined])
		expect(result).toHaveLength(1)
	})

	it('detects markdown table rows', () => {
		const result = formatSpellText('| Level | Damage |\n| 1 | 2d8 |\n| 2 | 3d8 |')
		expect(result).toHaveLength(1)
		expect(result[0].type).toBe('table')
	})

	it('correctly parses table rows into cells', () => {
		const result = formatSpellText('| A | B |\n| C | D |')
		const table = result[0]
		expect(table.type).toBe('table')
		expect(table.content).toEqual([['A', 'B'], ['C', 'D']])
	})

	it('detects bullet lists with dash prefix', () => {
		const result = formatSpellText('- First item\n- Second item')
		expect(result).toHaveLength(1)
		expect(result[0].type).toBe('list')
		expect(result[0].content).toEqual(['First item', 'Second item'])
	})

	it('detects bullet lists with asterisk prefix', () => {
		const result = formatSpellText('* Alpha\n* Beta')
		expect(result[0].content).toEqual(['Alpha', 'Beta'])
	})

	it('strips bullet markers from list items', () => {
		const result = formatSpellText('- Keep this text')
		expect(result[0].content[0]).toBe('Keep this text')
	})

	it('merges consecutive list blocks into one', () => {
		const result = formatSpellText('- A\n- B\n\n- C\n- D')
		const lists = result.filter((b) => b.type === 'list')
		expect(lists).toHaveLength(1)
		expect(lists[0].content).toEqual(['A', 'B', 'C', 'D'])
	})

	it('merges consecutive table blocks into one', () => {
		const result = formatSpellText('| A | B |\n| C | D |\n\n| E | F |')
		const tables = result.filter((b) => b.type === 'table')
		expect(tables).toHaveLength(1)
	})

	it('does not merge list followed by table', () => {
		const result = formatSpellText('- Item\n\n| A | B |')
		const lists = result.filter((b) => b.type === 'list')
		const tables = result.filter((b) => b.type === 'table')
		expect(lists).toHaveLength(1)
		expect(tables).toHaveLength(1)
	})

	it('handles mixed content: paragraph + list + table', () => {
		const result = formatSpellText('Intro text.\n\n- Point 1\n- Point 2\n\n| A | B |')
		expect(result.map((b) => b.type)).toEqual(['paragraph', 'list', 'table'])
	})

	it('returns paragraph type for plain text', () => {
		const result = formatSpellText('Plain old text.')
		expect(result[0].type).toBe('paragraph')
	})

	it('handles input with only whitespace lines', () => {
		const result = formatSpellText('   \n\n   ')
		expect(result).toEqual([])
	})
})
