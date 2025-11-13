import { List, Table } from '@chakra-ui/react'
import { formatSpellText } from './formatSpellText'

export function Description({ spell }) {
	const renderFormatted = (block, index, prefix) => {
		switch (block.type) {
			case 'list':
				return (
					<List.Root key={`${prefix}-${index}`} className="content-text">
						{block.content.map((item, i) => (
							<List.Item key={`${prefix}-${index}-${i}`} _marker={{ color: 'black' }}>
								<span dangerouslySetInnerHTML={{ __html: item }} />
							</List.Item>
						))}
					</List.Root>
				)

			case 'table':
				return (
					<Table.Root key={`${prefix}-${index}`} className="content-text">
						{block.content.map((row, i) => (
							<Table.Row key={`${prefix}-${index}-${i}`}>
								{row.map((cell, j) => (
									<Table.Cell
										key={`${prefix}-${index}-${i}-${j}`} >
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
		<div className={`spell-card__description ${spell.higher_level && spell.higher_level.length > 0 ? 'has-higher-level' : ''}`}>
			<div className="scrollable-content">
				<strong>Description: </strong>
				<div className="content-text">
					{formatSpellText(spell.desc).map((block, index) =>
						renderFormatted(block, index, 'desc')
					)}
				</div>
			</div>

			{spell.higher_level && spell.higher_level.length > 0 && (
				<div className="scrollable-content">
					<strong>At Higher Levels: </strong>
					{formatSpellText(spell.higher_level).map((block, index) =>
						renderFormatted(block, index, 'higher')
					)}
				</div>
			)}
		</div>
	)
}
