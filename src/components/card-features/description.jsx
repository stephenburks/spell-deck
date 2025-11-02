export function Description({ spell }) {
	return (
		<div className="description">
			<div className="description-copy">
				<p>
					<strong>Description: </strong>
					{spell.desc.map((paragraph, index) => (
						<span key={index}>{paragraph}</span>
					))}
				</p>
			</div>

			{spell.higher_level.length > 0 && (
				<div className="spell-higher-level">
					<p>
						<strong>At Higher Levels: </strong>
						{spell.higher_level}
					</p>
				</div>
			)}
		</div>
	)
}
