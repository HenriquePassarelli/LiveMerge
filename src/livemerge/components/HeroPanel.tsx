import { Anchor, Badge, Flex, Group, Text, Title } from '@mantine/core'
import { IconBrandGithub } from '@tabler/icons-react'
import { HeaderMeta, Hero } from '../styles'

type HeroPanelProps = {
  streamCount: number
}

const HeroPanel = ({ streamCount }: HeroPanelProps) => {
  return (
    <Hero>
      <Flex direction={{ base: 'column', sm: 'row' }} justify="space-between" align={{ base: 'stretch', sm: 'flex-start' }} gap="md">
        <HeaderMeta>
          <Title order={1} size="clamp(1.5rem, 4vw, 2.15rem)">
            LiveMerge
          </Title>
          <Text c="dimmed" size="sm">
            Focus on content with a clean multi-stream wall and persistent setup.
          </Text>
        </HeaderMeta>

        <Group justify="space-between" align="center" wrap="nowrap">
          <Badge variant="light" color="cyan" size="lg">
            {streamCount} streams
          </Badge>

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
    </Hero>
  )
}

export default HeroPanel
