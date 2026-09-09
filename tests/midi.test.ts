import { createChordFromName, parseChordInput } from '../src/chord'
import { buildMidiFile, MidiValidationError } from '../src/midi'

const result = parseChordInput('C大調 1645')
const bytes = buildMidiFile(result.chords, [4, 4, 4, 4], 96, [{ midi: 60, beat: 0, durationBeats: 1 }])
const signature = String.fromCharCode(...bytes.slice(0, 4))
const trackSignature = String.fromCharCode(...bytes.slice(14, 18))
if (!(bytes instanceof Uint8Array) || signature !== 'MThd' || trackSignature !== 'MTrk' || bytes.length < 80) {
  throw new Error('MIDI structure incorrect')
}

const hasNoteOn = (data: Uint8Array, note: number) =>
  Array.from(data).some((value, index, values) => value === 0x90 && values[index + 1] === note && values[index + 2] === 68)

const add2Bytes = buildMidiFile(parseChordInput('C大調 Iadd2').chords, [4], 96, [])
const add9Bytes = buildMidiFile(parseChordInput('C大調 Iadd9').chords, [4], 96, [])
if (!hasNoteOn(add2Bytes, 62) || hasNoteOn(add2Bytes, 74)) throw new Error('MIDI add2 close voicing failed')
if (!hasNoteOn(add9Bytes, 74) || hasNoteOn(add9Bytes, 62)) throw new Error('MIDI add9 open voicing failed')

const connectedBytes = buildMidiFile(
  parseChordInput('C大調 I-V').chords,
  [2, 8],
  96,
  [],
  [[60, 64, 67], [59, 62, 67]],
)
if (!hasNoteOn(connectedBytes, 59) || hasNoteOn(connectedBytes, 55)) {
  throw new Error('MIDI did not retain supplied voicing')
}

const slashBassBytes = buildMidiFile(
  [createChordFromName('C/D', { degree: 'standalone', degreeNumber: 1 })],
  [4],
  96,
  [],
)
const slashBassNoteOns = Array.from(slashBassBytes).flatMap((value, index, data) => value === 0x90 && data[index + 2] === 68 ? [data[index + 1]!] : [])
if (!slashBassNoteOns.length || slashBassNoteOns.some((midi) => !Number.isInteger(midi) || midi < 0 || midi > 127)) {
  throw new Error('supported slash-bass MIDI must contain only valid MIDI pitches')
}
if (!slashBassNoteOns.includes(50)) {
  throw new Error('C/D MIDI must retain D as the actual lowest sounding note')
}

const metadataBytes = buildMidiFile(
  parseChordInput('C大调 V7/V-V-I').chords,
  [1, 1, 2],
  120,
  [],
  undefined,
  { trackName: 'ChordMate Basic - C major', chordMarkers: ['D7', 'G', 'C'] },
)
const hasSequence = (data: Uint8Array, sequence: number[]) => sequence.every((byte, index) => data[index] === byte)
const hasMetaText = (type: number, value: string) => {
  const text = [...value].map((character) => character.charCodeAt(0))
  const sequence = [0xff, type, text.length, ...text]
  return Array.from(metadataBytes).some((_, index) => hasSequence(metadataBytes.slice(index), sequence))
}
if (!hasMetaText(0x03, 'ChordMate Basic - C major') || !['D7', 'G', 'C'].every((marker) => hasMetaText(0x06, marker))) {
  throw new Error('MIDI metadata must include the requested track name and chord markers')
}
if (Array.from(metadataBytes).some((value, index, data) => value === 0xc1 && data[index + 1] === 0x50)) {
  throw new Error('MIDI must not write an unused melody-channel program change')
}

const chord = parseChordInput('C大調 I').chords[0]!
const invalidMidiCases: Array<{
  label: string
  chordBeats?: number[]
  bpm?: number
  melody?: Array<{ midi: number; beat: number; durationBeats: number }>
  chordVoicings?: number[][]
  expectedCode: string
}> = [
  { label: 'zero BPM', bpm: 0, expectedCode: 'INVALID_BPM' },
  { label: 'NaN BPM', bpm: Number.NaN, expectedCode: 'INVALID_BPM' },
  { label: 'too-fast BPM', bpm: 241, expectedCode: 'INVALID_BPM' },
  { label: 'zero chord duration', chordBeats: [0], expectedCode: 'INVALID_CHORD_BEATS' },
  { label: 'negative chord duration', chordBeats: [-1], expectedCode: 'INVALID_CHORD_BEATS' },
  { label: 'non-finite chord duration', chordBeats: [Number.POSITIVE_INFINITY], expectedCode: 'INVALID_CHORD_BEATS' },
  { label: 'out-of-range melody pitch', melody: [{ midi: 128, beat: 0, durationBeats: 1 }], expectedCode: 'INVALID_MELODY_NOTE' },
  { label: 'fractional melody pitch', melody: [{ midi: 60.5, beat: 0, durationBeats: 1 }], expectedCode: 'INVALID_MELODY_NOTE' },
  { label: 'negative melody beat', melody: [{ midi: 60, beat: -1, durationBeats: 1 }], expectedCode: 'INVALID_MELODY_BEAT' },
  { label: 'zero melody duration', melody: [{ midi: 60, beat: 0, durationBeats: 0 }], expectedCode: 'INVALID_MELODY_DURATION' },
  { label: 'out-of-range chord voicing', chordVoicings: [[200, 64, 67]], expectedCode: 'INVALID_CHORD_VOICING' },
]

for (const invalid of invalidMidiCases) {
  try {
    buildMidiFile([chord], invalid.chordBeats ?? [4], invalid.bpm ?? 96, invalid.melody ?? [], invalid.chordVoicings)
    throw new Error(`${invalid.label} must reject before MIDI bytes are written`)
  } catch (error) {
    if (!(error instanceof MidiValidationError) || error.code !== invalid.expectedCode) {
      throw new Error(`${invalid.label}: expected ${invalid.expectedCode}, got ${error instanceof MidiValidationError ? error.code : 'unexpected error'}`)
    }
  }
}

const malformedMidiInputCases: Array<{
  label: string
  call: () => Uint8Array
  expectedCode: string
}> = [
  { label: 'non-array chords', call: () => buildMidiFile(null as unknown as typeof result.chords, [4], 96, []), expectedCode: 'INVALID_MIDI_INPUT' },
  { label: 'malformed chord entry', call: () => buildMidiFile([{}] as unknown as typeof result.chords, [4], 96, []), expectedCode: 'INVALID_MIDI_INPUT' },
  { label: 'non-array chord beats', call: () => buildMidiFile([chord], null as unknown as number[], 96, []), expectedCode: 'INVALID_MIDI_INPUT' },
  { label: 'non-array melody', call: () => buildMidiFile([chord], [4], 96, null as unknown as []), expectedCode: 'INVALID_MIDI_INPUT' },
  { label: 'malformed melody entry', call: () => buildMidiFile([chord], [4], 96, [null] as unknown as []), expectedCode: 'INVALID_MELODY_NOTE' },
  { label: 'melody entry without pitch', call: () => buildMidiFile([chord], [4], 96, [{}] as unknown as []), expectedCode: 'INVALID_MELODY_NOTE' },
  { label: 'non-array chord voicings', call: () => buildMidiFile([chord], [4], 96, [], null as unknown as number[][]), expectedCode: 'INVALID_MIDI_INPUT' },
  { label: 'non-array chord voicing entry', call: () => buildMidiFile([chord], [4], 96, [], [null] as unknown as number[][]), expectedCode: 'INVALID_CHORD_VOICING' },
  { label: 'null metadata', call: () => buildMidiFile([chord], [4], 96, [], undefined, null as unknown as {}), expectedCode: 'INVALID_MIDI_INPUT' },
  { label: 'non-string track name', call: () => buildMidiFile([chord], [4], 96, [], undefined, { trackName: 3 } as unknown as {}), expectedCode: 'INVALID_MIDI_INPUT' },
  { label: 'non-string marker', call: () => buildMidiFile([chord], [4], 96, [], undefined, { chordMarkers: ['C', 3] } as unknown as {}), expectedCode: 'INVALID_MIDI_INPUT' },
]

for (const malformed of malformedMidiInputCases) {
  try {
    malformed.call()
    throw new Error(`${malformed.label} must reject before MIDI bytes are written`)
  } catch (error) {
    if (!(error instanceof MidiValidationError) || error.code !== malformed.expectedCode) {
      throw new Error(`${malformed.label}: expected ${malformed.expectedCode}, got ${error instanceof MidiValidationError ? error.code : 'unexpected error'}`)
    }
  }
}

console.log('Core MIDI builder tests passed.')
