import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { Button, Group, Modal, Stack, Switch, Tabs, TextInput } from '@mantine/core'

import type { StreamInput, UserPreferences } from '../types'
import { EMPTY_STREAM_INPUT } from '../constants'

type ManageModalProps = {
  opened: boolean
  onClose: () => void
  initialPreferences: UserPreferences
  onSubmitStream: (stream: StreamInput) => void
  onSubmitUser: (preferences: UserPreferences) => void
}

const ManageModal = ({ opened, onClose, initialPreferences, onSubmitStream, onSubmitUser }: ManageModalProps) => {
  const [draftStream, setDraftStream] = useState<StreamInput>(EMPTY_STREAM_INPUT)
  const [draftPreferences, setDraftPreferences] = useState<UserPreferences>(initialPreferences)

  const handleStreamSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!draftStream?.title?.trim() || !draftStream.originalUrl.trim()) {
      alert('Please provide both a title and an original URL for the stream.')
      return
    }

    onSubmitStream(draftStream)
    setDraftStream(EMPTY_STREAM_INPUT)
  }

  const handleUserSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmitUser(draftPreferences)
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Manage LiveMerge" centered size="lg">
      <Tabs defaultValue="stream" keepMounted={false}>
        <Tabs.List grow>
          <Tabs.Tab value="stream">Add Stream</Tabs.Tab>
          {/* <Tabs.Tab value="user">User Setup</Tabs.Tab> */}
        </Tabs.List>

        <Tabs.Panel value="stream" pt="md">
          <form onSubmit={handleStreamSubmit}>
            <Stack>
              <TextInput
                label="Stream title"
                placeholder="Event name"
                value={draftStream.title}
                onChange={(event) =>
                  setDraftStream({
                    ...draftStream,
                    title: event.currentTarget.value
                  })
                }
                required
              />
              <TextInput
                label="Original URL"
                placeholder="https://www.youtube.com/watch?v=..."
                value={draftStream.originalUrl}
                onChange={(event) =>
                  setDraftStream({
                    ...draftStream,
                    originalUrl: event.currentTarget.value
                  })
                }
                required
              />
              <Group justify="flex-end">
                <Button type="submit">Add Stream</Button>
              </Group>
            </Stack>
          </form>
        </Tabs.Panel>

        <Tabs.Panel value="user" pt="md">
          <form onSubmit={handleUserSubmit}>
            <Stack>
              <TextInput
                label="Display name"
                placeholder="How should we label your profile?"
                value={draftPreferences.displayName}
                onChange={(event) =>
                  setDraftPreferences({
                    ...draftPreferences,
                    displayName: event.currentTarget.value
                  })
                }
              />
              <TextInput
                label="Favorite category"
                placeholder="Gaming, Music, News..."
                value={draftPreferences.favoriteCategory}
                onChange={(event) =>
                  setDraftPreferences({
                    ...draftPreferences,
                    favoriteCategory: event.currentTarget.value
                  })
                }
              />
              <Switch
                label="Auto-join all streams"
                checked={draftPreferences.autoJoin}
                onChange={(event) =>
                  setDraftPreferences({
                    ...draftPreferences,
                    autoJoin: event.currentTarget.checked
                  })
                }
              />
              <Group justify="flex-end">
                <Button type="submit">Save Setup</Button>
              </Group>
            </Stack>
          </form>
        </Tabs.Panel>
      </Tabs>
    </Modal>
  )
}

export default ManageModal
