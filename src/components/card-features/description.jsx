import { List, Table } from '@chakra-ui/react'
import { formatSpellText } from './formatSpellText'

export function Description({ spell }) {
	const renderFormatted = (block, index, prefix) => {
		switch (block.type) {
			case 'list':
				return (
					<List.Root key={`${prefix}-${index}`} className="spell-list-content">
						{block.content.map((item, i) => (
							<List.Item key={`${prefix}-${index}-${i}`} _marker={{ color: 'black' }}>
								<span dangerouslySetInnerHTML={{ __html: item }} />
							</List.Item>
						))}
					</List.Root>
				)

			case 'table':
				return (
					<Table.Root key={`${prefix}-${index}`} className="spell-table-content">
						{block.content.map((row, i) => (
							<Table.Row key={`${prefix}-${index}-${i}`} className="table-row">
								{row.map((cell, j) => (
									<Table.Cell
										key={`${prefix}-${index}-${i}-${j}`}
										className="table-cell">
										<span dangerouslySetInnerHTML={{ __html: cell }} />
									</Table.Cell>
								))}
							</Table.Row>
						))}
					</Table.Root>
				)

			default:
				return (
					<p
						key={`${prefix}-${index}`}
						dangerouslySetInnerHTML={{ __html: block.content }}
					/>
				)
		}
	}

	return (
		<div className="description">
			<div className="description-copy">
				<strong>Description: </strong>
				<div className="description-section">
					{formatSpellText(spell.desc).map((block, index) =>
						renderFormatted(block, index, 'desc')
					)}
				</div>
			</div>

			{spell.higher_level && spell.higher_level.length > 0 && (
				<div className="spell-higher-level">
					<strong>At Higher Levels: </strong>
					{formatSpellText(spell.higher_level).map((block, index) =>
						renderFormatted(block, index, 'higher')
					)}
				</div>
			)}
		</div>
	)
}
