import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { Button, Group, Modal, Stack, Switch, Tabs, TextInput } from '@mantine/core'

import type { StreamInput, UserPreferences } from '../types/types'
import { EMPTY_STREAM_INPUT } from '../constants'

type ManageModalProps = {
  opened: boolean
  onClose: () => void
  initialPreferences: UserPreferences
  onSubmitStream: (stream: StreamInput) => void
  onSubmitChannel: (channelIdOrHandle: string) => Promise<boolean>
  onSubmitUser: (preferences: UserPreferences) => void
}

const CHANNEL_ID_REGEX = /UC[\w-]{22}/
// Matches "@name" typed alone or inside a youtube.com/@name URL.
const HANDLE_REGEX = /(?:^|youtube\.com\/)(@[\w.-]{3,30})/

const ManageModal = ({ onClose, onSubmitStream, onSubmitUser, ...props }: ManageModalProps) => {
  const [draftChannelId, setDraftChannelId] = useState<string>('')
  const [isAddingChannel, setIsAddingChannel] = useState(false)
  const [draftStream, setDraftStream] = useState<StreamInput>(EMPTY_STREAM_INPUT)
  const [draftPreferences, setDraftPreferences] = useState<UserPreferences>(props.initialPreferences)

  const handleStreamSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!draftStream?.title?.trim() || !draftStream.originalUrl.trim()) {
      alert('Please provide both a title and an original URL for the stream.')
      return
    }

    onSubmitStream(draftStream)
    setDraftStream(EMPTY_STREAM_INPUT)
  }

  const handleChannelSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()

    // Accepts a channel ID, a youtube.com/channel/UC... URL, an @handle or a youtube.com/@handle URL.
    const input = draftChannelId.trim()
    const channelIdOrHandle = input.match(HANDLE_REGEX)?.[1] ?? input.match(CHANNEL_ID_REGEX)?.[0]

    if (!channelIdOrHandle) {
      alert('Please provide a channel ID (UCxxxxxxxxxxxxxxxxxxxxxx), an @handle, or a YouTube channel URL.')
      return
    }

    setIsAddingChannel(true)
    try {
      const isAdded = await props.onSubmitChannel(channelIdOrHandle)
      if (isAdded) setDraftChannelId('')
    } finally {
      setIsAddingChannel(false)
    }
  }

  const handleUserSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmitUser(draftPreferences)
  }

  return (
    <Modal opened={props.opened} onClose={onClose} title="Manage LiveMerge" centered size="lg">
      <Tabs defaultValue="stream" keepMounted={false}>
        <Tabs.List grow>
          <Tabs.Tab value="stream">Add Stream</Tabs.Tab>
          <Tabs.Tab value="channel">Add Channel</Tabs.Tab>

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

        <Tabs.Panel value="channel" pt="md">
          <form onSubmit={handleChannelSubmit}>
            <Stack>
              <TextInput
                label="Channel ID, @handle or URL"
                placeholder="@handle, UCxxxxxxxxxxxxxxxxxxxxxx or https://www.youtube.com/@handle"
                value={draftChannelId}
                onChange={(event) => setDraftChannelId(event.currentTarget.value)}
                disabled={isAddingChannel}
                required
              />
              <Group justify="flex-end">
                <Button type="submit" loading={isAddingChannel}>
                  Add Channel
                </Button>
              </Group>
            </Stack>
          </form>
        </Tabs.Panel>
      </Tabs>
    </Modal>
  )
}

export default ManageModal
