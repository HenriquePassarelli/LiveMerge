import { Button, Group, Modal, Text } from '@mantine/core'
import type { Stream } from '../types'

type Props = {
  stream: Stream
  opened: boolean
  onClose: () => void
  onRemove: (streamId: string) => void
}

const RemoveModal = ({ stream, opened, onClose, onRemove }: Props) => {
  const handleConfirmRemove = () => {
    onRemove(stream.id)
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Remove stream?" centered size="sm">
      <Text size="sm" mb="md">
        This will remove "{stream.title}" from your list.
      </Text>
      <Group justify="flex-end">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button color="red" onClick={handleConfirmRemove}>
          Remove
        </Button>
      </Group>
    </Modal>
  )
}

export default RemoveModal
