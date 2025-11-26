import {
	RangeIcon,
	DurationIcon,
	ComponentIcon,
	CastingTimeIcon,
	ConcentrationIcon
} from './icons'

export const renderIcon = (name, props = {}) => {
	switch (name) {
		case 'RangeIcon':
			return <RangeIcon {...props} />
		case 'DurationIcon':
			return <DurationIcon {...props} />
		case 'ComponentIcon':
			return <ComponentIcon {...props} />
		case 'CastingTimeIcon':
			return <CastingTimeIcon {...props} />
		case 'ConcentrationIcon':
			return <ConcentrationIcon {...props} />
		default:
			return null
	}
}
