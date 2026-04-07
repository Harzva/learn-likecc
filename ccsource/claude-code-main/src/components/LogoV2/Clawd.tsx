import * as React from 'react'
import { Box, Text } from '../../ink.js'

export type ClawdPose = 'default' | 'arms-up' | 'look-left' | 'look-right'

type Props = {
  pose?: ClawdPose
}

const LIKECODE_BLUE = 'rgb(88,166,255)'

type AnimalFrame = {
  top: string
  face: string
  body: string
  arms: string
  feet: string
}

const ANIMALS: Record<string, Record<ClawdPose, AnimalFrame>> = {
  bunny: {
    default: {
      top: '  /\\  /\\\\ ',
      face: ' ( •••• )',
      body: ' /|     |\\\\',
      arms: '( |  v  | )',
      feet: '  ^^   ^^ ',
    },
    'arms-up': {
      top: ' \\\\    // ',
      face: ' ( •••• )',
      body: ' /|  ^  |\\\\',
      arms: '  /  |  \\\\ ',
      feet: '  ^^   ^^ ',
    },
    'look-left': {
      top: '  /\\  /\\\\ ',
      face: ' ( • •• )',
      body: ' /|     |\\\\',
      arms: '( |  v  | )',
      feet: '  ^^   ^^ ',
    },
    'look-right': {
      top: '  /\\  /\\\\ ',
      face: ' ( •• • )',
      body: ' /|     |\\\\',
      arms: '( |  v  | )',
      feet: '  ^^   ^^ ',
    },
  },
  kitty: {
    default: {
      top: ' /\\_/\\\\  ',
      face: '( •• •• )',
      body: '(  =^=  )',
      arms: '(  /_\\\\  )',
      feet: '  /   \\\\  ',
    },
    'arms-up': {
      top: ' /\\_/\\\\  ',
      face: '( •• •• )',
      body: '(  =^=  )',
      arms: ' \\\\  |  // ',
      feet: '  /   \\\\  ',
    },
    'look-left': {
      top: ' /\\_/\\\\  ',
      face: '( •  •• )',
      body: '(  =^=  )',
      arms: '(  /_\\\\  )',
      feet: '  /   \\\\  ',
    },
    'look-right': {
      top: ' /\\_/\\\\  ',
      face: '( ••  • )',
      body: '(  =^=  )',
      arms: '(  /_\\\\  )',
      feet: '  /   \\\\  ',
    },
  },
  octo: {
    default: {
      top: '  .-^^-.  ',
      face: ' ( •• •• )',
      body: ' /  ___  \\\\',
      arms: '(_/|___|\\\\_)',
      feet: '  ~ ~ ~ ~ ',
    },
    'arms-up': {
      top: '  .-^^-.  ',
      face: ' ( •• •• )',
      body: ' /  ___  \\\\',
      arms: ' \\\\ |___| // ',
      feet: '  ~ ~ ~ ~ ',
    },
    'look-left': {
      top: '  .-^^-.  ',
      face: ' ( •  •• )',
      body: ' /  ___  \\\\',
      arms: '(_/|___|\\\\_)',
      feet: '  ~ ~ ~ ~ ',
    },
    'look-right': {
      top: '  .-^^-.  ',
      face: ' ( ••  • )',
      body: ' /  ___  \\\\',
      arms: '(_/|___|\\\\_)',
      feet: '  ~ ~ ~ ~ ',
    },
  },
}

function ClawdLines({
  pose = 'default',
  animal,
}: Props & { animal: keyof typeof ANIMALS }) {
  const frame = ANIMALS[animal][pose]

  return (
    <Box flexDirection="column">
      <Text color={LIKECODE_BLUE} bold>
        {frame.top}
      </Text>
      <Text color={LIKECODE_BLUE} bold>
        {frame.face}
      </Text>
      <Text color={LIKECODE_BLUE} bold>
        {frame.body}
      </Text>
      <Text color={LIKECODE_BLUE} bold>
        {frame.arms}
      </Text>
      <Text color={LIKECODE_BLUE} bold>
        {frame.feet}
      </Text>
    </Box>
  )
}

export function Clawd({ pose = 'default' }: Props) {
  const animal = React.useMemo(() => {
    const names = Object.keys(ANIMALS) as Array<keyof typeof ANIMALS>
    return names[Math.floor(Math.random() * names.length)]!
  }, [])

  return <ClawdLines pose={pose} animal={animal} />
}
