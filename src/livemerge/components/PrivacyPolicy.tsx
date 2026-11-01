import { Anchor, Button, Container, List, MantineProvider, Paper, Stack, Text, Title } from '@mantine/core'
import { useState } from 'react'

const PrivacyPolicy = () => {
  const [deletionMessage, setDeletionMessage] = useState('')

  const deleteLocalData = () => {
    Object.keys(localStorage)
      .filter((key) => key.startsWith('livemerge.'))
      .forEach((key) => localStorage.removeItem(key))
    setDeletionMessage('Your local LiveMerge data has been deleted.')
  }

  return (
    <MantineProvider forceColorScheme="dark" theme={{ primaryColor: 'cyan' }}>
      <Container size="sm" py={{ base: 'xl', sm: 64 }}>
        <Stack gap="md">
          <Anchor href="/" w="fit-content">
            ← LiveMerge
          </Anchor>
          <Title order={1}>Privacy Policy</Title>
          <Text c="dimmed">Effective date: November 1, 2026</Text>
          <Text>
            LiveMerge is a browser-based multi-stream viewing tool. This policy explains how LiveMerge uses data when
            you use its features. LiveMerge has no accounts and no sign-in.
          </Text>

          <Title order={2}>YouTube</Title>
          <Text>
            LiveMerge embeds YouTube players and live chats, and checks whether the channels and videos you add are live
            by reading publicly available YouTube pages. It does not use Google sign-in or the YouTube Data API. Your
            use of YouTube is subject to the{' '}
            <Anchor href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer">
              YouTube Terms of Service
            </Anchor>
            .
          </Text>
          <Text>
            Google and YouTube may collect and process information under the{' '}
            <Anchor href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
              Google Privacy Policy
            </Anchor>
            .
          </Text>

          <Title order={2}>Data we access and use</Title>
          <Text>
            When you add a channel or a stream, LiveMerge sends its YouTube channel ID or video ID to a LiveMerge server
            function, which uses it only to:
          </Text>
          <List>
            <List.Item>look up the channel name and whether the channel is currently live; and</List.Item>
            <List.Item>check whether a YouTube video is live so it can configure playback.</List.Item>
          </List>
          <Text>
            The function does not store these requests. Responses may be cached for about a minute so that repeated
            checks do not contact YouTube each time. The hosting provider, Cloudflare, may process standard technical
            request data such as IP addresses under its own policies.
          </Text>

          <Title order={2}>Storage, sharing, and retention</Title>
          <Text>
            LiveMerge stores its settings, added streams and channels, and sort preferences in your browser's local
            storage on this device. It does not keep a database of users or their streams. LiveMerge does not sell or
            share this data with third parties. Embedded YouTube players are provided by Google and are governed by
            Google's policies.
          </Text>

          <Title order={2}>Delete your LiveMerge data</Title>
          <Paper withBorder p="lg" radius="md">
            <Stack align="flex-start">
              <Text>
                You can delete all LiveMerge data stored in this browser, including your saved streams, preferences, and
                channel IDs. This action does not delete your YouTube videos, channel, or any data held by YouTube.
              </Text>
              <Button onClick={deleteLocalData}>Delete my local LiveMerge data</Button>
              {deletionMessage && <Text c="cyan">{deletionMessage}</Text>}
            </Stack>
          </Paper>
          <Text>
            If you signed in with Google in an earlier version of LiveMerge, you can remove its access from{' '}
            <Anchor href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">
              Google Account permissions
            </Anchor>
            . Deleting your local data above also removes any leftover access token stored by that version.
          </Text>

          <Title order={2}>Contact</Title>
          <Text>
            For privacy questions or help deleting data, open a request through the{' '}
            <Anchor
              href="https://github.com/HenriquePassarelli/LiveMerge/issues"
              target="_blank"
              rel="noopener noreferrer"
            >
              LiveMerge issue tracker
            </Anchor>
            .
          </Text>
        </Stack>
      </Container>
    </MantineProvider>
  )
}

export default PrivacyPolicy
