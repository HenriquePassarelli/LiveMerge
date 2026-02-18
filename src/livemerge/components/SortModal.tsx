import { useEffect, useMemo, useState } from 'react'
import { ActionIcon, Button, Group, Modal, Stack, Text } from '@mantine/core'
import { IconArrowDown, IconArrowUp } from '@tabler/icons-react'

import type { Stream } from '../types'

type SortModalProps = {
  opened: boolean
  streams: Stream[]
  initialOrder: string[]
  onClose: () => void
  onApply: (nextOrder: string[]) => void
}

const resolveOrder = (streams: Stream[], order: string[]) => {
  const streamMap = new Map(streams.map((stream) => [stream.id, stream]))
  const orderedById = order.map((id) => streamMap.get(id)).filter((stream): stream is Stream => Boolean(stream))
  const remaining = streams.filter((stream) => !order.includes(stream.id))

  return [...orderedById, ...remaining]
}

const SortModal = ({ opened, streams, initialOrder, onClose, onApply }: SortModalProps) => {
  const [draftOrder, setDraftOrder] = useState<string[]>([])

  useEffect(() => {
    if (!opened) return

    const initial = resolveOrder(streams, initialOrder).map((stream) => stream.id)
    setDraftOrder(initial)
  }, [initialOrder, opened, streams])

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
    onApply(draftOrder)
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Custom sort" centered size="md">
      <Stack>
        {orderedStreams.map((stream, index) => (
          <Group key={stream.id} justify="space-between" align="center" wrap="nowrap">
            <Text fw={500} truncate>
              {stream.title}
            </Text>

            <Group gap="xs" wrap="nowrap">
              <ActionIcon
                variant="light"
                aria-label={`Move ${stream.title} up`}
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                <IconArrowUp size={16} />
              </ActionIcon>
              <ActionIcon
                variant="light"
                aria-label={`Move ${stream.title} down`}
                disabled={index === orderedStreams.length - 1}
                onClick={() => move(index, 1)}
              >
                <IconArrowDown size={16} />
              </ActionIcon>
            </Group>
          </Group>
        ))}

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply order</Button>
        </Group>
      </Stack>
    </Modal>
  )
}

export default SortModal
