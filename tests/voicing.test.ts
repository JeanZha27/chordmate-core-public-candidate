import { ChordConstructionError, createChordFromName, parseChordInput } from '../src/chord'
import { getPerformancePitchClasses, getVoicingMidiNotes, getVoicingName } from '../src/voicing'

const chord = parseChordInput('C大調 I').chords[0]
const root = getVoicingMidiNotes(chord, 0, 4)
const first = getVoicingMidiNotes(chord, 1, 4)
const second = getVoicingMidiNotes(chord, 2, 4)

if (JSON.stringify(root.map((midi) => midi % 12)) !== JSON.stringify([0, 4, 7])) throw new Error('root voicing incorrect')
if (JSON.stringify(first.map((midi) => midi % 12)) !== JSON.stringify([4, 7, 0])) throw new Error('first inversion incorrect')
if (JSON.stringify(second.map((midi) => midi % 12)) !== JSON.stringify([7, 0, 4])) throw new Error('second inversion incorrect')
if (getVoicingName(chord, 1, 4) !== 'C/E') throw new Error('first inversion name incorrect')
if (getVoicingName(chord, 2, 4) !== 'C/G') throw new Error('second inversion name incorrect')
if (getVoicingMidiNotes(chord, 0, 5)[0] - root[0] !== 12) throw new Error('octave shift incorrect')

const c13 = parseChordInput('C大調 I13').chords[0]
if (JSON.stringify(getPerformancePitchClasses(c13)) !== JSON.stringify([0, 4, 10, 2, 9])) {
  throw new Error('C13 performance pitch classes incorrect')
}

const cadd9 = parseChordInput('C大調 Iadd9').chords[0]
if (JSON.stringify(getVoicingMidiNotes(cadd9, 0, 4)) !== JSON.stringify([60, 64, 67, 74])) {
  throw new Error('Cadd9 root voicing should retain an upper ninth')
}
if (JSON.stringify(getVoicingMidiNotes(cadd9, 3, 4)) !== JSON.stringify([62, 72, 76, 79])) {
  throw new Error('Cadd9 D-bass arrangement must be ascending and use D as its actual lowest note')
}

const cOverE = createChordFromName('C/E', { degree: 'standalone', degreeNumber: 1 })
if (JSON.stringify(getVoicingMidiNotes(cOverE, 0, 4)) !== JSON.stringify([64, 67, 72])) {
  throw new Error('C/E must use E as the actual lowest note')
}

const cOverD = createChordFromName('C/D', { degree: 'standalone', degreeNumber: 1 })
if (JSON.stringify(getVoicingMidiNotes(cOverD, 0, 4)) !== JSON.stringify([50, 60, 64, 67])) {
  throw new Error('C/D must add D beneath the chord as its actual lowest note')
}

const cSharpOverESharp = createChordFromName('C♯/E♯', { degree: 'standalone', degreeNumber: 1 })
if (cSharpOverESharp.name !== 'C#/E#' || cSharpOverESharp.slashBass !== 'E#') {
  throw new Error('Unicode accidental spelling must remain valid in both the chord root and slash bass')
}
const cSharpOverESharpMidi = getVoicingMidiNotes(cSharpOverESharp, 0, 4)
if (!cSharpOverESharpMidi.every((midi, index) => Number.isInteger(midi) && Number.isFinite(midi) && (index === 0 || midi > cSharpOverESharpMidi[index - 1]!))) {
  throw new Error('supported slash-bass voicing must contain finite, ascending MIDI notes')
}

for (const [input, expectedCode] of [
  ['C/', 'INVALID_CHORD_NAME'],
  ['C/E/G', 'INVALID_CHORD_NAME'],
  ['C//E', 'INVALID_CHORD_NAME'],
  ['/E', 'INVALID_CHORD_NAME'],
  ['C/H', 'INVALID_SLASH_BASS'],
  ['C/C##', 'INVALID_SLASH_BASS'],
  ['C/Dbb', 'INVALID_SLASH_BASS'],
] as const) {
  try {
    createChordFromName(input, { degree: 'standalone', degreeNumber: 1 })
    throw new Error(`${input} must reject instead of silently changing the requested chord`)
  } catch (error) {
    if (!(error instanceof ChordConstructionError) || error.code !== expectedCode) {
      throw new Error(`${input}: expected stable ${expectedCode}, got ${error instanceof ChordConstructionError ? error.code : 'unexpected error'}`)
    }
  }
}

for (const input of ['C/C##', 'C/Dbb']) {
  try {
    createChordFromName(input, { degree: 'standalone', degreeNumber: 1 })
    throw new Error(`${input} must reject its unsupported slash-bass spelling`)
  } catch (error) {
    if (!(error instanceof ChordConstructionError) || error.code !== 'INVALID_SLASH_BASS') {
      throw new Error(`${input}: expected stable unsupported-slash-bass rejection`)
    }
    if (!error.message.includes('当前输入语法不支持') || error.message.includes('无效')) {
      throw new Error(`${input}: rejection wording must describe a product grammar boundary, not invalid music theory`)
    }
  }
}

const malformedSlashBassChord = { ...cSharpOverESharp, slashBass: 'C##' }
try {
  getVoicingMidiNotes(malformedSlashBassChord, 0, 4)
  throw new Error('voicing must not coerce an unsupported slash bass into a MIDI pitch')
} catch (error) {
  if (!(error instanceof ChordConstructionError) || error.code !== 'INVALID_SLASH_BASS') {
    throw new Error('voicing must stably reject a malformed slash bass supplied outside the constructor')
  }
}

console.log('Core piano voicing tests passed.')
