import * as React from 'react'
import { Box, Text } from '../../ink.js'

export type ClawdPose = 'default' | 'arms-up' | 'look-left' | 'look-right'

type Props = {
  pose?: ClawdPose
}

function HeartLines({ pose = 'default' }: Props) {
  const top =
    pose === 'arms-up'
      ? ' ♥   ♥ '
      : pose === 'look-left'
        ? '♥♥  ♥  '
        : pose === 'look-right'
          ? '  ♥  ♥♥'
          : ' ♥♥ ♥♥ '

  return (
    <Box flexDirection="column">
      <Text color="blueBright" bold>
        {top}
      </Text>
      <Text color="blueBright" bold>
        {'♥♥♥♥♥♥♥'}
      </Text>
      <Text color="blueBright" bold>
        {' ♥♥♥♥♥ '}
      </Text>
      <Text color="blueBright" bold>
        {'  ♥♥♥  '}
      </Text>
      <Text color="blueBright" bold>
        {'   ♥   '}
      </Text>
    </Box>
  )
}

export function Clawd({ pose = 'default' }: Props) {
  return <HeartLines pose={pose} />
}
