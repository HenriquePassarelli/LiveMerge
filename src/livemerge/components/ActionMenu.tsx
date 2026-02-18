import { useState } from 'react'
import styled from 'styled-components'
import { ActionIcon, Stack, Tooltip } from '@mantine/core'
import { IconListNumbers, IconPlus, IconSettings, IconSortAZ, IconX } from '@tabler/icons-react'
import type { SortMode } from '../types'

type Props = {
  sortMode: SortMode
  openModal: () => void
  handleSetSortMode: (mode: 'default' | 'title-asc') => void
  handleOpenSortModal: () => void
}

const ActionMenu = (props: Props) => {
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false)

  const { openModal, handleSetSortMode, sortMode, handleOpenSortModal } = props

  const handleToggleQuickActions = () => {
    setIsQuickActionsOpen((current) => !current)
  }

  return (
    <Container onClick={handleToggleQuickActions}>
      <Stack gap="xs" align="center">
        {isQuickActionsOpen && (
          <>
            <Tooltip label="Add stream" position="left" withArrow>
              <ActionIcon
                size={38}
                radius="xl"
                color="cyan"
                variant="filled"
                onClick={openModal}
                aria-label="Add stream"
              >
                <IconPlus size={18} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label={sortMode === 'title-asc' ? 'Reset sort' : 'Sort A-Z'} position="left" withArrow>
              <ActionIcon
                size={38}
                radius="xl"
                color={sortMode === 'title-asc' ? 'cyan' : 'gray'}
                variant={sortMode === 'title-asc' ? 'filled' : 'light'}
                onClick={() => handleSetSortMode(sortMode === 'title-asc' ? 'default' : 'title-asc')}
                aria-label="Sort streams A to Z"
              >
                <IconSortAZ size={18} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Custom sort" position="left" withArrow>
              <ActionIcon
                size={38}
                radius="xl"
                color={sortMode === 'custom' ? 'cyan' : 'gray'}
                variant={sortMode === 'custom' ? 'filled' : 'light'}
                onClick={handleOpenSortModal}
                aria-label="Open custom sort"
              >
                <IconListNumbers size={18} />
              </ActionIcon>
            </Tooltip>
          </>
        )}

        <Tooltip label={isQuickActionsOpen ? 'Close quick actions' : 'Open quick actions'} position="left" withArrow>
          <ActionIcon
            size={58}
            radius="xl"
            color="cyan"
            variant="filled"
            aria-label={isQuickActionsOpen ? 'Close quick actions' : 'Open quick actions'}
            style={{ boxShadow: '0 14px 30px rgba(0, 0, 0, 0.5)' }}
          >
            {isQuickActionsOpen ? <IconX size={26} /> : <IconSettings size={26} />}
          </ActionIcon>
        </Tooltip>
      </Stack>
    </Container>
  )
}

export default ActionMenu

export const Container = styled.div`
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 220;
`
