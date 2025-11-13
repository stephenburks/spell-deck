const dieFaces = Array.from({ length: 20 }, (_, index) => <div key={index} className="dice-face"></div>)
const loadText = 'LOADING'
const loadArray = [...loadText]

export default function Loading() {
	return (
		<div className="loading-container">
			<div className="dice-d20">{dieFaces}</div>
			<div className="loading-text">
				{loadArray.map((letter, index) => (
					<span key={index}>{letter}</span>
				))}
			</div>
		</div>
	)
}
