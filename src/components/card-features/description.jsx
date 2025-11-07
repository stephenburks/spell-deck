import { formatSpellText } from './formatSpellText'

export function Description({ spell }) {
	const renderFormatted = (block, index, prefix) => {
		switch (block.type) {
			case 'list':
				return (
					<ul key={`${prefix}-${index}`} className="spell-list-content">
						{block.content.map((item, i) => (
							<li key={`${prefix}-${index}-${i}`}>{item}</li>
						))}
					</ul>
				)

			case 'table':
				return (
					<div key={`${prefix}-${index}`} className="spell-table-content">
						{block.content.map((row, i) => (
							<div key={`${prefix}-${index}-${i}`} className="table-row">
								{row.map((cell, j) => (
									<span key={`${prefix}-${index}-${i}-${j}`} className="table-cell">
										{cell}
									</span>
								))}
							</div>
						))}
					</div>
				)

			default:
				return <p key={`${prefix}-${index}`}>{block.content}</p>
		}
	}

	return (
		<div className="description">
			<div className="description-copy">
				<strong>Description: </strong>
				{spell.desc.map((descSection, sectionIndex) => (
					<div key={`section-${sectionIndex}`} className="description-section">
						{formatSpellText(descSection).map((block, index) => renderFormatted(block, index, `desc-${sectionIndex}`))}
					</div>
				))}
			</div>

			{spell.higher_level.length > 0 && (
				<div className="spell-higher-level">
					<strong>At Higher Levels: </strong>
					{formatSpellText(spell.higher_level).map((block, index) => renderFormatted(block, index, 'higher'))}
				</div>
			)}
		</div>
	)
}
