import { useState, useCallback, useRef } from 'react'
import {
	Box,
	Heading,
	Text,
	VStack,
	HStack,
	Button,
	Alert,
	Flex
} from '@chakra-ui/react'
import {
	DialogRoot,
	DialogContent,
	DialogHeader,
	DialogBody,
	DialogTitle
} from '@chakra-ui/react'
import VirtualizedSpellList from '../VirtualizedSpellList'
import CustomSpellForm from '../CustomSpellForm'
import {
	loadCustomSpells,
	addCustomSpell,
	updateCustomSpell,
	deleteCustomSpell,
	exportCustomSpellsJson,
	importCustomSpellsJson
} from '../../utils/customSpells'
import type { Spell } from '../../types'
import { toaster } from '../ui/toaster'

export default function CustomSpellsTab() {
	const [spells, setSpells] = useState<Spell[]>(() => loadCustomSpells())
	const [dialogOpen, setDialogOpen] = useState(false)
	const [editingSpell, setEditingSpell] = useState<Spell | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const refreshSpells = useCallback(() => {
		setSpells(loadCustomSpells())
	}, [])

	const handleCreate = () => {
		setEditingSpell(null)
		setDialogOpen(true)
	}

	const handleEdit = (spell: Spell) => {
		setEditingSpell(spell)
		setDialogOpen(true)
	}

	const handleSave = (spell: Spell) => {
		if (editingSpell) {
			const result = updateCustomSpell(editingSpell.index, spell)
			if (result) {
				refreshSpells()
				toaster.create({
					title: 'Spell Updated',
					description: `"${spell.name}" updated successfully`,
					status: 'success',
					duration: 3000
				})
			} else {
				toaster.create({
					title: 'Error',
					description: 'Failed to update spell',
					status: 'error',
					duration: 3000
				})
			}
		} else {
			const result = addCustomSpell(spell)
			if (result) {
				refreshSpells()
				toaster.create({
					title: 'Spell Created',
					description: `"${spell.name}" created successfully`,
					status: 'success',
					duration: 3000
				})
			} else {
				toaster.create({
					title: 'Error',
					description: 'Failed to create spell. Check for duplicate index or validation errors.',
					status: 'error',
					duration: 3000
				})
			}
		}
		setDialogOpen(false)
		setEditingSpell(null)
	}

	const handleDelete = (spell: Spell) => {
		if (window.confirm(`Delete "${spell.name}"? This cannot be undone.`)) {
			const success = deleteCustomSpell(spell.index)
			if (success) {
				refreshSpells()
				toaster.create({
					title: 'Spell Deleted',
					description: `"${spell.name}" has been deleted`,
					status: 'success',
					duration: 3000
				})
			} else {
				toaster.create({
					title: 'Error',
					description: 'Failed to delete spell',
					status: 'error',
					duration: 3000
				})
			}
		}
	}

	const handleExport = () => {
		const json = exportCustomSpellsJson()
		const blob = new Blob([json], { type: 'application/json' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = `custom-spells-${new Date().toISOString().slice(0, 10)}.json`
		a.click()
		URL.revokeObjectURL(url)
		toaster.create({
			title: 'Exported',
			description: 'Custom spells exported as JSON',
			status: 'success',
			duration: 3000
		})
	}

	const handleImport = () => {
		fileInputRef.current?.click()
	}

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		const reader = new FileReader()
		reader.onload = (event) => {
			const text = event.target?.result
			if (typeof text !== 'string') return

			const result = importCustomSpellsJson(text)
			if (result.imported > 0) {
				refreshSpells()
				toaster.create({
					title: 'Import Successful',
					description: `Imported ${result.imported} spell(s)`,
					status: 'success',
					duration: 3000
				})
			}
			if (result.errors.length > 0) {
				toaster.create({
					title: 'Import Warnings',
					description: result.errors.join('; '),
					status: 'warning',
					duration: 5000
				})
			}
		}
		reader.readAsText(file)

		// Reset file input
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	const handleSpellAction = useCallback(
		(actionType: string, spell: Spell) => {
			switch (actionType) {
				case 'editCustomSpell':
					handleEdit(spell)
					break
				case 'deleteCustomSpell':
					handleDelete(spell)
					break
			}
		},
		[handleEdit, handleDelete]
	)

	return (
		<Box p={4} pt={2}>
			<VStack spacing={6} align="stretch">
				{/* Header */}
				<Flex justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={3}>
					<Box>
						<Heading as="h2" size="lg" mb={2}>
							Custom Spells
						</Heading>
						<Text color="gray.600">
							Create, edit, and manage your own custom spells. Custom spells appear in
							the Spell Library alongside official spells.
						</Text>
					</Box>
				</Flex>

				{/* Action buttons */}
				<HStack gap={2} flexWrap="wrap">
					<Button colorPalette="blue" onClick={handleCreate}>
						+ Create Spell
					</Button>
					<Button variant="outline" onClick={handleExport} disabled={spells.length === 0}>
						Export JSON
					</Button>
					<Button variant="outline" onClick={handleImport}>
						Import JSON
					</Button>
					<input
						ref={fileInputRef}
						type="file"
						accept=".json"
						style={{ display: 'none' }}
						onChange={handleFileChange}
						aria-label="Import custom spells JSON file"
					/>
				</HStack>

				{/* Spell list */}
				{spells.length === 0 ? (
					<Box textAlign="center" py={8}>
						<Text fontSize="lg" color="gray.500" mb={4}>
							No custom spells yet
						</Text>
						<Text color="gray.400" mb={4}>
							Create your first custom spell to get started.
						</Text>
						<Button colorPalette="blue" onClick={handleCreate}>
							+ Create Spell
						</Button>
					</Box>
				) : (
					<VirtualizedSpellList
						spells={spells}
						onAction={handleSpellAction}
						context="custom"
						itemsPerPage={50}
					/>
				)}

				{/* Create/Edit Dialog */}
				<DialogRoot
					open={dialogOpen}
					onOpenChange={(details) => {
						setDialogOpen(details.open)
						if (!details.open) setEditingSpell(null)
					}}
					size="lg"
				>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								{editingSpell ? `Edit: ${editingSpell.name}` : 'Create Custom Spell'}
							</DialogTitle>
						</DialogHeader>
						<DialogBody>
							<CustomSpellForm
								initialSpell={editingSpell}
								onSave={handleSave}
								onCancel={() => {
									setDialogOpen(false)
									setEditingSpell(null)
								}}
							/>
						</DialogBody>
					</DialogContent>
				</DialogRoot>
			</VStack>
		</Box>
	)
}
