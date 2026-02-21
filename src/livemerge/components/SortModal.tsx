import { useEffect, useMemo, useState } from 'react'
import { ActionIcon, Button, Divider, Group, Modal, Radio, Stack, Text, ThemeIcon } from '@mantine/core'
import { IconArrowDown, IconArrowUp, IconSortAscending, IconSortDescending, IconHash } from '@tabler/icons-react'

import type { SortMode, Stream } from '../types/types'

type SortModalProps = {
  opened: boolean
  streams: Stream[]
  initialOrder: string[]
  initialSortMode: SortMode
  onClose: () => void
  onApply: (nextOrder: string[], sortMode: SortMode) => void
}

const resolveOrder = (streams: Stream[], order: string[]) => {
  const streamMap = new Map(streams.map((stream) => [stream.id, stream]))
  const orderedById = order.map((id) => streamMap.get(id)).filter((stream): stream is Stream => Boolean(stream))
  const remaining = streams.filter((stream) => !order.includes(stream.id))

  return [...orderedById, ...remaining]
}

const SortModal = ({ opened, streams, initialOrder, initialSortMode, onClose, onApply }: SortModalProps) => {
  const [draftOrder, setDraftOrder] = useState<string[]>([])
  const [draftSortMode, setDraftSortMode] = useState<SortMode>(initialSortMode)

  useEffect(() => {
    if (!opened) return

    const initial = resolveOrder(streams, initialOrder).map((stream) => stream.id)
    setDraftOrder(initial)
    setDraftSortMode(initialSortMode)
  }, [initialOrder, initialSortMode, opened, streams])

  const orderedStreams = useMemo(() => resolveOrder(streams, draftOrder), [draftOrder, streams])

  const move = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= draftOrder.length) return

    setDraftOrder((current) => {
      const next = [...current]
      const [item] = next.splice(index, 1)
      next.splice(targetIndex, 0, item)
      return next
    })
  }

  const handleApply = () => {
    onApply(draftOrder, draftSortMode)
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Sort streams" centered size="md">
      <Stack gap="lg">
        {/* Sort Mode Selection */}
        <Stack gap="md">
          <Text fw={600} size="sm" c="dimmed" tt="uppercase">
            Sort mode
          </Text>
          <Radio.Group value={draftSortMode} onChange={(value) => setDraftSortMode(value as SortMode)}>
            <Stack gap="sm" pl="md">
              <Group gap="md" wrap="nowrap">
                <Radio value="default" />
                <Stack gap={0}>
                  <Group gap="xs" align="center">
                    <ThemeIcon variant="light" size="sm" color="cyan">
                      <IconHash size={14} />
                    </ThemeIcon>
                    <Text fw={500}>Custom order</Text>
                  </Group>
                  <Text size="xs" c="dimmed" ml="xl">
                    Arrange streams in your preferred order
                  </Text>
                </Stack>
              </Group>

              <Group gap="md" wrap="nowrap">
                <Radio value="title-asc" />
                <Stack gap={0}>
                  <Group gap="xs" align="center">
                    <ThemeIcon variant="light" size="sm" color="cyan">
                      <IconSortAscending size={14} />
                    </ThemeIcon>
                    <Text fw={500}>Alphabetical (A-Z)</Text>
                  </Group>
                  <Text size="xs" c="dimmed" ml="xl">
                    Sort streams by title in ascending order
                  </Text>
                </Stack>
              </Group>

              <Group gap="md" wrap="nowrap">
                <Radio value="title-desc" />
                <Stack gap={0}>
                  <Group gap="xs" align="center">
                    <ThemeIcon variant="light" size="sm" color="cyan">
                      <IconSortDescending size={14} />
                    </ThemeIcon>
                    <Text fw={500}>Alphabetical (Z-A)</Text>
                  </Group>
                  <Text size="xs" c="dimmed" ml="xl">
                    Sort streams by title in descending order
                  </Text>
                </Stack>
              </Group>
            </Stack>
          </Radio.Group>
        </Stack>

        {/* Custom Order Editor - only show for custom mode */}
        {draftSortMode === 'default' && (
          <>
            <Divider />
            <Stack gap="md">
              <Text fw={600} size="sm" c="dimmed" tt="uppercase">
                Custom order
              </Text>
              <Stack gap="sm">
                {orderedStreams.length === 0 ? (
                  <Text size="sm" c="dimmed" ta="center" py="md">
                    No streams to sort
                  </Text>
                ) : (
                  orderedStreams.map((stream, index) => (
                    <Group
                      key={stream.id}
                      justify="space-between"
                      align="center"
                      wrap="nowrap"
                      p="sm"
                      style={{ borderRadius: '6px', backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
                    >
                      <Group gap="sm" wrap="nowrap" flex={1}>
                        <ThemeIcon variant="light" size="sm" color="cyan" style={{ cursor: 'default' }}>
                          <Text size="xs" fw={600}>
                            {index + 1}
                          </Text>
                        </ThemeIcon>
                        <Text fw={500} truncate size="sm">
                          {stream.title}
                        </Text>
                      </Group>

                      <Group gap="xs" wrap="nowrap">
                        <ActionIcon
                          size="sm"
                          variant="default"
                          aria-label={`Move ${stream.title} up`}
                          disabled={index === 0}
                          onClick={() => move(index, -1)}
                        >
                          <IconArrowUp size={14} />
                        </ActionIcon>
                        <ActionIcon
                          size="sm"
                          variant="default"
                          aria-label={`Move ${stream.title} down`}
                          disabled={index === orderedStreams.length - 1}
                          onClick={() => move(index, 1)}
                        >
                          <IconArrowDown size={14} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  ))
                )}
              </Stack>
            </Stack>
          </>
        )}

        <Divider />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply</Button>
        </Group>
      </Stack>
    </Modal>
  )
}

export default SortModal
