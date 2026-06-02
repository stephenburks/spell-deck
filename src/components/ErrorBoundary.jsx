import React from 'react'
import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react'

interface ErrorBoundaryState {
	hasError: boolean
	error: Error | null
}

export default class ErrorBoundary extends React.Component<
	{ children: React.ReactNode },
	ErrorBoundaryState
> {
	constructor(props: { children: React.ReactNode }) {
		super(props)
		this.state = { hasError: false, error: null }
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error }
	}

	handleRetry = () => {
		this.setState({ hasError: false, error: null })
	}

	render() {
		if (this.state.hasError) {
			return (
				<Box
					display="flex"
					alignItems="center"
					justifyContent="center"
					minH="100vh"
					p={8}
				>
					<VStack gap={4} maxW="400px" textAlign="center">
						<Heading as="h1" size="lg">
							Something went wrong
						</Heading>
						<Text color="fg.muted">
							The app encountered an unexpected error. This usually happens if the spell
							data failed to load.
						</Text>
						<Button onClick={this.handleRetry} size="lg" colorPalette="blue">
							Try Again
						</Button>
					</VStack>
				</Box>
			)
		}

		return this.props.children
	}
}
