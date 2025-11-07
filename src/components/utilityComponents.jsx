import React from 'react'
import { Text } from '@chakra-ui/react'

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

export const RangeIcon = (props) => (
	<>
		<svg width="1rem" height="1rem" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" {...props}>
			<path
				fill="#000000"
				d="M8 0q.552.001 1.09.074c.337.047.499.424.324.716L9.4.814a.52.52 0 0 1-.517.243A6.995 6.995 0 0 0 1.003 8c0 3.87 3.13 7 7 7a6.995 6.995 0 0 0 6.944-7.88a.52.52 0 0 1 .243-.517l.022-.014c.292-.175.67-.013.716.324q.075.532.075 1.09c0 4.42-3.58 8-8 8s-8-3.58-8-8s3.58-8 8-8z"
			></path>
			<path
				fill="#000000"
				d="M8 4c.177 0 .253.211.128.336l-.592.592a.7.7 0 0 1-.312.173a3 3 0 0 0-2.22 2.9c0 1.66 1.34 3 3 3c1.39 0 2.56-.944 2.9-2.22a.7.7 0 0 1 .173-.312l.592-.592c.126-.126.337-.05.337.128c0 2.21-1.79 4-4 4s-4-1.79-4-4s1.79-4 4-4z"
			></path>
			<path
				fill="#000000"
				d="M12.6.008a.5.5 0 0 1 .405.395l.435 2.17l2.17.435a.5.5 0 0 1 .159.919l-2.5 1.5a.5.5 0 0 1-.257.071h-1.79l-2.35 2.35a.5.5 0 0 1-.707-.707l2.35-2.35v-1.79l.005-.067a.5.5 0 0 1 .066-.19l1.5-2.5l.044-.062A.5.5 0 0 1 12.6.01z"
			></path>
			<title>Range</title>
		</svg>
	</>
)

export const DurationIcon = (props) => (
	<>
		<svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 1024 1472" {...props}>
			<path
				fill="#000000"
				d="M86 192H32q-14 0-23-9t-9-23V96q0-14 9-23t23-9h960q14 0 23 9t9 23v64q0 14-9 23t-23 9h-54q-8 201-77.5 332.5T668 698v148q121 42 190.5 171.5T938 1344h54q14 0 23 9t9 23v64q0 14-9 23t-23 9H32q-14 0-23-9t-9-23v-64q0-14 9-23t23-9h54q10-197 79.5-326.5T356 846V698q-123-42-192.5-173.5T86 192zm784 0H154q3 75 15.5 141.5t39 131.5t75 111T398 639l26 6v254l-26 7q-65 17-113 61.5T210.5 1076T171 1205t-17 139h87l271-271l271 271h87q-4-74-17-139t-39.5-129T739 967.5T626 906l-26-7V645l26-6q66-17 114.5-63t75-111t39-131.5T870 192zM363 502h298L512 650z"
			></path>
			<title>Duration</title>
		</svg>
	</>
)

export const ComponentIcon = (props) => (
	<>
		<svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 20 20" {...props}>
			<path
				fill="#000000"
				d="M18.62 3.448h-3.448a3.448 3.448 0 0 0-6.896 0H4.828a1.38 1.38 0 0 0-1.38 1.38v3.448a3.448 3.448 0 1 0 0 6.896v3.449A1.38 1.38 0 0 0 4.828 20h4.827v-1.38a2.069 2.069 0 1 1 4.138 0V20h4.828A1.38 1.38 0 0 0 20 18.62v-4.827h-1.38a2.069 2.069 0 1 1 0-4.138H20V4.828a1.38 1.38 0 0 0-1.38-1.38Zm-3.448 8.276a3.448 3.448 0 0 0 3.449 3.448v3.449h-3.449a3.448 3.448 0 1 0-6.896 0H4.828v-4.828h-1.38a2.069 2.069 0 1 1 0-4.138h1.38V4.828h4.827v-1.38a2.069 2.069 0 1 1 4.138 0v1.38h4.828v3.448a3.448 3.448 0 0 0-3.449 3.448Z"
			></path>
			<title>Components</title>
		</svg>
	</>
)

export const CastingTimeIcon = (props) => (
	<>
		<svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 16 16" {...props}>
			<path
				fill="#000000"
				d="M4 3L2 1H1v1l2 2zm1-3h1v2H5zm4 5h2v1H9zm1-3V1H9L7 3l1 1zM0 5h2v1H0zm5 4h1v2H5zM1 9v1h1l2-2l-1-1zm14.781 4.781L5.842 3.842a.752.752 0 0 0-1.061 0l-.939.939a.752.752 0 0 0 0 1.061l9.939 9.939a.752.752 0 0 0 1.061 0l.939-.939a.752.752 0 0 0 0-1.061zM7.5 8.5l-3-3l1-1l3 3l-1 1z"
			></path>
			<title>Casting Time</title>
		</svg>
	</>
)

export const ConcentrationIcon = (props) => (
	// <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16" {...props}>
	// 	<path fill="#171923" d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0ZM8.146 4.992c.961 0 1.641.633 1.729 1.512h1.295v-.088c-.094-1.518-1.348-2.572-3.03-2.572c-2.068 0-3.269 1.377-3.269 3.638v1.073c0 2.267 1.178 3.603 3.27 3.603c1.675 0 2.93-1.02 3.029-2.467v-.093H9.875c-.088.832-.75 1.418-1.729 1.418c-1.224 0-1.927-.891-1.927-2.461v-1.06c0-1.583.715-2.503 1.927-2.503Z"></path>
	// </svg>
	<>
		<Text as="b">C</Text>
	</>
)
