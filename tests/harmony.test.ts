import { getDiatonicChords } from '../src/harmony'

const cases = [
  ['C', 'major', ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim']],
  ['A', 'minor', ['Am', 'Bdim', 'C', 'Dm', 'Em', 'F', 'G']],
  ['Bb', 'major', ['Bb', 'Cm', 'Dm', 'Eb', 'F', 'Gm', 'Adim']],
  ['F#', 'minor', ['F#m', 'G#dim', 'A', 'Bm', 'C#m', 'D', 'E']],
] as const

for (const [key, mode, expected] of cases) {
  const actual = getDiatonicChords(key, mode).map((chord) => chord.name)
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${key} ${mode} harmony mismatch: ${actual.join(' ')}`)
  }
}

console.log('Core diatonic harmony tests passed.')
