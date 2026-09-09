import { parseChordInput } from '../src/chord'
import { buildProgressionInput, transposeProgression } from '../src/progression'

const source = parseChordInput('C大調 I-V-vi-IV')
const transposed = transposeProgression(source, 'G', 'major')
if (transposed.chords.map((chord) => chord.name).join('-') !== 'G-D-Em-C') {
  throw new Error('major progression transpose failed')
}

const minor = parseChordInput('A小調 i-VI-III-VII')
const minorTransposed = transposeProgression(minor, 'F#', 'minor')
if (minorTransposed.chords.map((chord) => chord.name).join('-') !== 'F#m-D-A-E') {
  throw new Error('minor progression transpose failed')
}

if (source.chords.map((chord) => chord.name).join('-') !== 'C-G-Am-F') {
  throw new Error('transpose mutated source result')
}

if (buildProgressionInput(source, 'G', 'major') !== 'G大调 I-V-vi-IV') {
  throw new Error('progression input should use the public simplified-Chinese mode label')
}

console.log('Core progression transformation tests passed.')
