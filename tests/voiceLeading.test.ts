import { createChordFromName, parseChordInput } from '../src/chord'
import { createConnectedVoicings, evaluateVoiceLeading } from '../src/voice-leading'

const progression = parseChordInput('C大調 I-V-vi-IV')
const smooth = createConnectedVoicings(progression.chords, 4, '平稳')
if (smooth.length !== 4) throw new Error('connected voicing count changed')
if (smooth.some((item) => item.midiNotes.length === 0)) throw new Error('connected voicing cannot be empty')
if (smooth.slice(1).some((item) => item.metrics.maximumLeap >= 12)) throw new Error('平稳 voice leading has octave leap')

const slash = createChordFromName('C/E', { degree: 'I', degreeNumber: 1 })
for (const style of ['平稳', '开阔', '戏剧性'] as const) {
  if (createConnectedVoicings([slash], 4, style)[0].midiNotes[0] % 12 !== 4) {
    throw new Error(`${style} lost slash bass`)
  }
}

const styleOutputs = (['平稳', '开阔', '戏剧性'] as const).map((style) =>
  createConnectedVoicings(progression.chords, 4, style).map((item) => item.midiNotes.join(',')).join('|'),
)
if (new Set(styleOutputs).size !== 3) throw new Error('voice-leading styles should differ')

const metrics = evaluateVoiceLeading([60, 64, 67], [57, 60, 64])
if (metrics.commonTones !== 2 || metrics.totalMovement < 0 || metrics.bassMovement !== 3) {
  throw new Error('voice-leading metrics incorrect')
}

console.log('Core voice-leading tests passed.')
