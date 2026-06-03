import { List, Table } from '@chakra-ui/react'
import ReactMarkdown from 'react-markdown'
import { formatSpellText } from './formatSpellText'
import type { Spell } from '../../types'

interface TextBlock {
	type: string
	content: string | string[]
}

export function Description({ spell }: { spell: Spell }) {
	const renderFormatted = (block: TextBlock, index: number, prefix: string) => {
		switch (block.type) {
			case 'list':
				return (
					<List.Root key={`${prefix}-${index}`} className="content-text">
						{block.content.map((item, i) => (
							<List.Item key={`${prefix}-${index}-${i}`} _marker={{ color: 'black' }}>
								<ReactMarkdown components={{ p: 'span' }}>{item}</ReactMarkdown>
							</List.Item>
						))}
					</List.Root>
				)

			case 'table':
				return (
					<Table.Root key={`${prefix}-${index}`} className="content-text">
						<Table.Body>
							{block.content.map((row, i) => (
								<Table.Row key={`${prefix}-${index}-${i}`}>
									{row.map((cell, j) => (
										<Table.Cell key={`${prefix}-${index}-${i}-${j}`}>
											<ReactMarkdown components={{ p: 'span' }}>{cell}</ReactMarkdown>
										</Table.Cell>
									))}
								</Table.Row>
							))}
						</Table.Body>
					</Table.Root>
				)

			default:
				return (
					<div className="content-text" key={`${prefix}-${index}`}>
						<ReactMarkdown>{block.content}</ReactMarkdown>
					</div>
				)
		}
	}

	return (
		<div
			className={`spell-card__description ${spell.higher_level && spell.higher_level.length > 0 ? 'has-higher-level' : ''}`}>
			<div className="spell-info__header-container">
				<span className="spell-info__header">
					<strong>Description</strong>
				</span>
			</div>
			<div className="scrollable-content">
				<div className="content-text">
					{formatSpellText(spell.desc).map((block, index) =>
						renderFormatted(block, index, 'desc')
					)}
				</div>
			</div>

			{spell.higher_level && spell.higher_level.length > 0 && (
				<>
					<div className="spell-info__header-container higher-level">
						<span className="spell-info__header">
							<strong>At Higher Levels</strong>
						</span>
					</div>
					<div className="scrollable-content">
						<div className="content-text">
							{formatSpellText(spell.higher_level).map((block, index) =>
								renderFormatted(block, index, 'higher')
							)}
						</div>
					</div>
				</>
			)}
		</div>
	)
}
