const dieFaces = Array.from({ length: 20 }, (_, index) => <div key={index} className={`die-face die-face-${index + 1}`}></div>)
const loadText = 'LOADING'
const loadArray = [...loadText]

export default function Loading() {
	return (
		<div className="loading-container">
			<div className="d20">{dieFaces}</div>
			<div className="loading">
				{loadArray.map((letter, index) => (
					<span key={index}>{letter}</span>
				))}
			</div>
		</div>
	)
}
