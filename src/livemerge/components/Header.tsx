import { Anchor, Badge, Flex, Group, Text, Title } from '@mantine/core'
import { IconBrandGithub } from '@tabler/icons-react'
import styled from 'styled-components'
import GoogleButton from '../ui/GoogleButton'

type HeroPanelProps = {
  token?: string
  streamCount?: number
  channelsCount?: number
  handleGoogleSignIn: () => void
}

const Header = ({ token, streamCount = 0, channelsCount = 0, handleGoogleSignIn }: HeroPanelProps) => {
  const streams = streamCount + channelsCount
  const streamLabel = streams === 1 ? 'stream' : 'streams'

  console.log(token)

  return (
    <Container>
      <Flex
        gap="md"
        justify="space-between"
        direction={{ base: 'column', sm: 'row' }}
        align={{ base: 'stretch', sm: 'flex-start' }}
      >
        <HeaderMeta>
          <Title order={1} size="clamp(1.5rem, 4vw, 2.15rem)">
            LiveMerge
          </Title>
          <Text c="dimmed" size="sm">
            Focus on content with a clean multi-stream wall and persistent setup.
          </Text>
        </HeaderMeta>

        <Group justify="space-between" align="center" wrap="nowrap">
          <Group justify="space-between" align="center" wrap="nowrap">
            {!token && channelsCount > 0 && <GoogleButton onClick={handleGoogleSignIn}>Login</GoogleButton>}
            <Badge variant="light" color="cyan" size="lg">
              {streams} {streamLabel}
            </Badge>
          </Group>

          <Anchor
            c="white"
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/HenriquePassarelli/LiveMerge"
          >
            <IconBrandGithub size={20} />
          </Anchor>
        </Group>
      </Flex>
    </Container>
  )
}

export default Header

export const Container = styled.section`
  margin-bottom: 18px;
  border-radius: 18px;
  border: 1px solid #1f2b44;
  background:
    radial-gradient(circle at 90% 10%, rgba(69, 201, 255, 0.16), transparent 38%),
    linear-gradient(155deg, #0f1c31, #0b1324);
  padding: 22px;

  @media (max-width: 768px) {
    margin-bottom: 14px;
    border-radius: 14px;
    padding: 16px;
  }

  @media (max-width: 480px) {
    border-radius: 12px;
    padding: 14px 12px;
  }
`

export const HeaderMeta = styled.div`
  display: grid;
  gap: 4px;

  @media (max-width: 768px) {
    gap: 2px;
  }
`
