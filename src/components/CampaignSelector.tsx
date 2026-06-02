import { useState } from 'react'
import {
	Box,
	Button,
	HStack,
	Input,
	PopoverRoot,
	PopoverTrigger,
	PopoverContent,
	PopoverBody,
	PopoverArrow,
	VStack,
	Text,
	IconButton,
	createListCollection,
	Select
} from '@chakra-ui/react'
import { useCampaign } from './CampaignContext'

export default function CampaignSelector() {
	const { activeCampaign, campaigns, switchCampaign, addCampaign, removeCampaign } =
		useCampaign()
	const [newName, setNewName] = useState('')
	const [open, setOpen] = useState(false)

	const onCreate = () => {
		const trimmed = newName.trim()
		if (!trimmed) return
		const campaign = addCampaign(trimmed)
		switchCampaign(campaign.id)
		setNewName('')
		setOpen(false)
	}

	const activeName =
		activeCampaign === 'default' ? 'Default' : campaigns.find((c) => c.id === activeCampaign)?.name || 'Unknown'

	return (
		<PopoverRoot open={open} onOpenChange={(e) => setOpen(e.open)}>
			<PopoverTrigger asChild>
				<Button size="xs" variant="outline">
					{activeName}
				</Button>
			</PopoverTrigger>
			<PopoverContent>
				<PopoverArrow />
				<PopoverBody>
					<VStack gap={2} align="stretch">
						<Text fontSize="sm" fontWeight="semibold">
							Campaigns
						</Text>

						{campaigns.map((campaign) => (
							<HStack key={campaign.id} justifyContent="space-between">
								<Button
									size="xs"
									variant={activeCampaign === campaign.id ? 'solid' : 'ghost'}
									colorPalette="blue"
									onClick={() => {
										switchCampaign(campaign.id)
										setOpen(false)
									}}
									flex="1"
									justifyContent="flex-start">
									{campaign.name}
								</Button>
								<IconButton
									size="2xs"
									variant="ghost"
									colorPalette="red"
									aria-label={`Delete ${campaign.name}`}
									onClick={() => removeCampaign(campaign.id)}>
									✕
								</IconButton>
							</HStack>
						))}

						<Button
							size="xs"
							variant="ghost"
							onClick={() => switchCampaign('default')}
							colorPalette={activeCampaign === 'default' ? 'blue' : undefined}>
							Default
						</Button>

						<HStack gap={1}>
							<Input
								size="xs"
								placeholder="New campaign name..."
								value={newName}
								onChange={(e) => setNewName(e.target.value)}
								onKeyDown={(e) => e.key === 'Enter' && onCreate()}
							/>
							<Button size="xs" onClick={onCreate} colorPalette="blue">
								Create
							</Button>
						</HStack>
					</VStack>
				</PopoverBody>
			</PopoverContent>
		</PopoverRoot>
	)
}
