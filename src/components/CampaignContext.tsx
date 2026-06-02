import { createContext, useContext, useState, useEffect } from 'react'
import {
	getActiveCampaign,
	setActiveCampaign,
	getCampaigns,
	createCampaign,
	deleteCampaign,
	type Campaign
} from '../utils/localStorage.ts'

interface CampaignContextValue {
	activeCampaign: string
	campaigns: Campaign[]
	switchCampaign: (id: string) => void
	addCampaign: (name: string) => Campaign
	removeCampaign: (id: string) => void
}

const CampaignContext = createContext<CampaignContextValue | null>(null)

export function CampaignProvider({ children }: { children: React.ReactNode }) {
	const [activeCampaign, setActive] = useState(getActiveCampaign)
	const [campaigns, setCampaigns] = useState<Campaign[]>(getCampaigns)

	useEffect(() => {
		const handleStorage = (e: StorageEvent) => {
			if (e.key === 'spell-deck-campaigns') setCampaigns(getCampaigns())
			if (e.key === 'spell-deck-active-campaign') setActive(getActiveCampaign())
		}
		window.addEventListener('storage', handleStorage)
		return () => window.removeEventListener('storage', handleStorage)
	}, [])

	const switchCampaign = (id: string) => {
		setActiveCampaign(id)
		setActive(id)
		window.dispatchEvent(
			new CustomEvent('spell-deck:campaign-changed', { detail: { campaignId: id } })
		)
	}

	const addCampaign = (name: string) => {
		const campaign = createCampaign(name)
		setCampaigns(getCampaigns())
		return campaign
	}

	const removeCampaign = (id: string) => {
		deleteCampaign(id)
		setCampaigns(getCampaigns())
		setActive(getActiveCampaign())
	}

	return (
		<CampaignContext.Provider
			value={{ activeCampaign, campaigns, switchCampaign, addCampaign, removeCampaign }}>
			{children}
		</CampaignContext.Provider>
	)
}

export function useCampaign() {
	const ctx = useContext(CampaignContext)
	if (!ctx) throw new Error('useCampaign must be used within CampaignProvider')
	return ctx
}
