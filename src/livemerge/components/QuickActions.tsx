import { ActionIcon, Stack, Tooltip } from '@mantine/core'
import { IconListNumbers, IconPlus, IconSortAZ, IconX, IconSettings } from '@tabler/icons-react'

import { FloatingActionWrap } from '../styles'

type QuickActionsProps = {
  isOpen: boolean
  isSimpleSortActive: boolean
  isCustomSortActive: boolean
  onToggleOpen: () => void
  onAddStream: () => void
  onToggleSimpleSort: () => void
  onOpenCustomSort: () => void
}

const QuickActions = ({
  isOpen,
  isSimpleSortActive,
  isCustomSortActive,
  onToggleOpen,
  onAddStream,
  onToggleSimpleSort,
  onOpenCustomSort
}: QuickActionsProps) => {
  return (
    <FloatingActionWrap>
      <Stack gap="xs" align="flex-end">
        {isOpen && (
          <>
            <Tooltip label="Add stream" position="left" withArrow>
              <ActionIcon
                size={38}
                radius="xl"
                color="cyan"
                variant="filled"
                onClick={onAddStream}
                aria-label="Add stream"
              >
                <IconPlus size={18} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label={isSimpleSortActive ? 'Reset sort' : 'Sort A-Z'} position="left" withArrow>
              <ActionIcon
                size={38}
                radius="xl"
                color={isSimpleSortActive ? 'cyan' : 'gray'}
                variant={isSimpleSortActive ? 'filled' : 'light'}
                onClick={onToggleSimpleSort}
                aria-label="Sort streams A to Z"
              >
                <IconSortAZ size={18} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Custom sort" position="left" withArrow>
              <ActionIcon
                size={38}
                radius="xl"
                color={isCustomSortActive ? 'cyan' : 'gray'}
                variant={isCustomSortActive ? 'filled' : 'light'}
                onClick={onOpenCustomSort}
                aria-label="Open custom sort"
              >
                <IconListNumbers size={18} />
              </ActionIcon>
            </Tooltip>
          </>
        )}

        <Tooltip label={isOpen ? 'Close quick actions' : 'Open quick actions'} position="left" withArrow>
          <ActionIcon
            size={58}
            radius="xl"
            color="cyan"
            variant="filled"
            onClick={onToggleOpen}
            aria-label={isOpen ? 'Close quick actions' : 'Open quick actions'}
            style={{ boxShadow: '0 14px 30px rgba(0, 0, 0, 0.5)' }}
          >
            {isOpen ? <IconX size={26} /> : <IconSettings size={26} />}
          </ActionIcon>
        </Tooltip>
      </Stack>
    </FloatingActionWrap>
  )
}

export default QuickActions
