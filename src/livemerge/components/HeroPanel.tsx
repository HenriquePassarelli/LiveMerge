import { Badge, Group, Text, Title } from '@mantine/core'
import { HeaderMeta, Hero } from '../styles'

type HeroPanelProps = {
  streamCount: number
}

const HeroPanel = ({ streamCount }: HeroPanelProps) => {
  return (
    <Hero>
      <Group justify="space-between" align="flex-start" gap="md">
        <HeaderMeta>
          <Title order={1}>LiveMerge</Title>
          <Text c="dimmed" size="sm">
            Focus on content with a clean multi-stream wall and persistent setup.
          </Text>
        </HeaderMeta>

        <Group gap="xs">
          <Badge variant="light" color="cyan">
            {streamCount} streams
          </Badge>
        </Group>
      </Group>

      {/* <Group mt="md" gap="xs">
        <Badge color="gray" variant="dot">
          {activeUser}
        </Badge>
        <Badge color="gray" variant="dot">
          {category}
        </Badge>
        {autoJoin && (
          <Badge color="teal" variant="filled">
            Auto-join enabled
          </Badge>
        )}
      </Group> */}
    </Hero>
  )
}

export default HeroPanel
