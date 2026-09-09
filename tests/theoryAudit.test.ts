import { createChordFromName, degreeTokenForQuality, getDiatonicChords, getVoicingMidiNotes, HARMONY_MAJOR_KEYS, HARMONY_MINOR_KEYS, parseChordInput, type ChordQuality } from '../src/index'

const SOURCE = { degree: 'standalone', degreeNumber: 1 }

const PITCH_CLASSES: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, Fb: 4, 'E#': 5,
  F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11, Cb: 11,
}

const ABSOLUTE_CHORD_AUDIT: ReadonlyArray<readonly [string, string[], number[]]> = [
  ['C', ['C', 'E', 'G'], [0, 4, 7]],
  ['Cm', ['C', 'Eb', 'G'], [0, 3, 7]],
  ['Cdim', ['C', 'Eb', 'Gb'], [0, 3, 6]],
  ['Caug', ['C', 'E', 'G#'], [0, 4, 8]],
  ['C5', ['C', 'G'], [0, 7]],
  ['C6', ['C', 'E', 'G', 'A'], [0, 4, 7, 9]],
  ['Cm6', ['C', 'Eb', 'G', 'A'], [0, 3, 7, 9]],
  ['C7', ['C', 'E', 'G', 'Bb'], [0, 4, 7, 10]],
  ['Cmaj7', ['C', 'E', 'G', 'B'], [0, 4, 7, 11]],
  ['Cm7', ['C', 'Eb', 'G', 'Bb'], [0, 3, 7, 10]],
  ['Cm7b5', ['C', 'Eb', 'Gb', 'Bb'], [0, 3, 6, 10]],
  ['Cdim7', ['C', 'Eb', 'Gb', 'Bbb'], [0, 3, 6, 9]],
  ['Cm(maj7)', ['C', 'Eb', 'G', 'B'], [0, 3, 7, 11]],
  ['Csus2', ['C', 'D', 'G'], [0, 2, 7]],
  ['Csus4', ['C', 'F', 'G'], [0, 5, 7]],
  ['C7sus4', ['C', 'F', 'G', 'Bb'], [0, 5, 7, 10]],
  ['Cadd2', ['C', 'D', 'E', 'G'], [0, 2, 4, 7]],
  ['Cmadd2', ['C', 'D', 'Eb', 'G'], [0, 2, 3, 7]],
  ['Cadd9', ['C', 'E', 'G', 'D'], [0, 4, 7, 2]],
  ['Cmadd9', ['C', 'Eb', 'G', 'D'], [0, 3, 7, 2]],
  ['C9', ['C', 'E', 'G', 'Bb', 'D'], [0, 4, 7, 10, 2]],
  ['Cmaj9', ['C', 'E', 'G', 'B', 'D'], [0, 4, 7, 11, 2]],
  ['Cm9', ['C', 'Eb', 'G', 'Bb', 'D'], [0, 3, 7, 10, 2]],
  ['C11', ['C', 'E', 'G', 'Bb', 'D', 'F'], [0, 4, 7, 10, 2, 5]],
  ['Cm11', ['C', 'Eb', 'G', 'Bb', 'D', 'F'], [0, 3, 7, 10, 2, 5]],
  ['C13', ['C', 'E', 'G', 'Bb', 'D', 'F', 'A'], [0, 4, 7, 10, 2, 5, 9]],
  ['Cmaj13', ['C', 'E', 'G', 'B', 'D', 'F', 'A'], [0, 4, 7, 11, 2, 5, 9]],
  ['Cm13', ['C', 'Eb', 'G', 'Bb', 'D', 'F', 'A'], [0, 3, 7, 10, 2, 5, 9]],
]

for (const [symbol, expectedNotes, expectedPitchClasses] of ABSOLUTE_CHORD_AUDIT) {
  const chord = createChordFromName(symbol, SOURCE)
  if (JSON.stringify(chord.notes) !== JSON.stringify(expectedNotes)) {
    throw new Error(`${symbol}: theoretical note spelling mismatch`)
  }
  if (JSON.stringify(chord.pitchClasses) !== JSON.stringify(expectedPitchClasses)) {
    throw new Error(`${symbol}: root-relative pitch-class structure mismatch`)
  }
}

const AUDIT_ROOTS = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'] as const
const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const
const LETTER_STEPS: Record<string, number[]> = {
  C: [0, 2, 4], Cm: [0, 2, 4], Cdim: [0, 2, 4], Caug: [0, 2, 4], C5: [0, 4],
  C6: [0, 2, 4, 5], Cm6: [0, 2, 4, 5],
  C7: [0, 2, 4, 6], Cmaj7: [0, 2, 4, 6], Cm7: [0, 2, 4, 6], Cm7b5: [0, 2, 4, 6], Cdim7: [0, 2, 4, 6], 'Cm(maj7)': [0, 2, 4, 6],
  Csus2: [0, 1, 4], Csus4: [0, 3, 4], C7sus4: [0, 3, 4, 6],
  Cadd2: [0, 1, 2, 4], Cmadd2: [0, 1, 2, 4], Cadd9: [0, 2, 4, 1], Cmadd9: [0, 2, 4, 1],
  C9: [0, 2, 4, 6, 1], Cmaj9: [0, 2, 4, 6, 1], Cm9: [0, 2, 4, 6, 1],
  C11: [0, 2, 4, 6, 1, 3], Cm11: [0, 2, 4, 6, 1, 3],
  C13: [0, 2, 4, 6, 1, 3, 5], Cmaj13: [0, 2, 4, 6, 1, 3, 5], Cm13: [0, 2, 4, 6, 1, 3, 5],
}
for (const root of AUDIT_ROOTS) {
  for (const [cSymbol, , relativePitchClasses] of ABSOLUTE_CHORD_AUDIT) {
    const symbol = `${root}${cSymbol.slice(1)}`
    const chord = createChordFromName(symbol, SOURCE)
    const expected = relativePitchClasses.map((pitchClass) => (PITCH_CLASSES[root] + pitchClass) % 12)
    if (JSON.stringify(chord.pitchClasses) !== JSON.stringify(expected)) {
      throw new Error(`${symbol}: transposed chord structure mismatch`)
    }
    const rootLetterIndex = LETTERS.indexOf(root[0] as typeof LETTERS[number])
    const expectedLetters = (LETTER_STEPS[cSymbol] ?? []).map((step) => LETTERS[(rootLetterIndex + step) % LETTERS.length])
    if (JSON.stringify(chord.notes.map((note) => note[0])) !== JSON.stringify(expectedLetters)) {
      throw new Error(`${symbol}: theoretical letter spelling mismatch`)
    }
  }
}

const DIATONIC_QUALITIES: Record<'major' | 'minor', ChordQuality[]> = {
  major: ['major', 'minor', 'minor', 'major', 'major', 'minor', 'dim'],
  minor: ['minor', 'dim', 'major', 'minor', 'minor', 'major', 'major'],
}

for (const key of HARMONY_MAJOR_KEYS) {
  const chords = getDiatonicChords(key, 'major')
  if (chords.length !== 7 || JSON.stringify(chords.map((chord) => chord.quality)) !== JSON.stringify(DIATONIC_QUALITIES.major)) {
    throw new Error(`${key} major: diatonic triad audit failed`)
  }
  const numeric = parseChordInput(`${key}大调 1234567`).chords.map((chord) => chord.name)
  if (JSON.stringify(numeric) !== JSON.stringify(chords.map((chord) => chord.name))) {
    throw new Error(`${key} major: numeric progression order disagrees with the diatonic scale`)
  }
}

for (const key of HARMONY_MINOR_KEYS) {
  const chords = getDiatonicChords(key, 'minor')
  if (chords.length !== 7 || JSON.stringify(chords.map((chord) => chord.quality)) !== JSON.stringify(DIATONIC_QUALITIES.minor)) {
    throw new Error(`${key} natural minor: diatonic triad audit failed`)
  }
  const numeric = parseChordInput(`${key}小调 1234567`).chords.map((chord) => chord.name)
  if (JSON.stringify(numeric) !== JSON.stringify(chords.map((chord) => chord.name))) {
    throw new Error(`${key} natural minor: numeric progression order disagrees with the diatonic scale`)
  }
}

const c1645 = parseChordInput('C大调 1645').chords.map((chord) => chord.name)
if (JSON.stringify(c1645) !== JSON.stringify(['C', 'Am', 'F', 'G'])) throw new Error('1645 must preserve written degree order')

const diminishedCases: ReadonlyArray<readonly [string, string, string[]]> = [
  ['C大调 vii°7', 'Bdim7', ['B', 'D', 'F', 'Ab']],
  ['C大调 viiø7', 'Bm7b5', ['B', 'D', 'F', 'A']],
  ['C大调 viim7b5', 'Bm7b5', ['B', 'D', 'F', 'A']],
]
for (const [input, name, notes] of diminishedCases) {
  const [chord] = parseChordInput(input).chords
  if (chord?.name !== name || JSON.stringify(chord.notes) !== JSON.stringify(notes)) {
    throw new Error(`${input}: diminished-seventh symbol audit failed`)
  }
}

const [cMajorFullyDiminished] = parseChordInput('C大调 vii°7').chords
const [cMajorHalfDiminished] = parseChordInput('C大调 viiø7').chords
const [aMinorFullyDiminished] = parseChordInput('A小调 vii°7').chords
const aMinorDominant = parseChordInput('A小调 V-V7').chords
if (cMajorFullyDiminished?.harmonicSource !== 'functional-chromatic') {
  throw new Error('C major vii°7 must be classified as functional-chromatic rather than diatonic')
}
if (cMajorHalfDiminished?.harmonicSource !== 'diatonic') {
  throw new Error('C major viiø7 must remain the diatonic seventh chord')
}
if (
  aMinorFullyDiminished?.harmonicSource !== 'functional-chromatic'
  || aMinorFullyDiminished.name !== 'G#dim7'
  || JSON.stringify(aMinorFullyDiminished.notes) !== JSON.stringify(['G#', 'B', 'D', 'F'])
) {
  throw new Error('A minor vii°7 must use the raised leading tone and be classified as functional-chromatic')
}
if (
  JSON.stringify(aMinorDominant.map((chord) => chord.notes)) !== JSON.stringify([['E', 'G#', 'B'], ['E', 'G#', 'B', 'D']])
  || aMinorDominant.some((chord) => chord.harmonicSource !== 'functional-chromatic')
) {
  throw new Error('A minor V and V7 must use the raised leading tone and be classified as functional-chromatic')
}

const appliedDominant = parseChordInput('C大调 V/V-V7/ii').chords
if (JSON.stringify(appliedDominant.map((chord) => chord.name)) !== JSON.stringify(['D', 'A7'])) {
  throw new Error('applied-dominant audit failed')
}

const appliedLeadingTone = parseChordInput('C大调 vii°7/V-viiø7/V').chords
if (JSON.stringify(appliedLeadingTone.map((chord) => chord.notes)) !== JSON.stringify([['F#', 'A', 'C', 'Eb'], ['F#', 'A', 'C', 'E']])) {
  throw new Error('applied-leading-tone audit failed')
}

const mixture = parseChordInput('C大调 i-ii°-bIII-iv-v-bVI-bVII').chords
if (mixture.some((chord) => chord.harmonicSource !== 'parallel-minor-mixture')) {
  throw new Error('parallel-minor mixture chords must expose their harmonic source')
}

const unicodeMixture = parseChordInput('C大调 ♭III-♭VI-♭VII').chords
if (JSON.stringify(unicodeMixture.map((chord) => chord.notes)) !== JSON.stringify([['Eb', 'G', 'Bb'], ['Ab', 'C', 'Eb'], ['Bb', 'D', 'F']])) {
  throw new Error('unicode-flat mixture symbols must match ASCII-flat spellings')
}

const MIXTURE_DEGREES: ReadonlyArray<readonly [string, number, boolean]> = [
  ['i', 1, false], ['ii°', 2, false], ['bIII', 3, true], ['iv', 4, false], ['v', 5, false], ['bVI', 6, true], ['bVII', 7, true],
]
for (const key of HARMONY_MAJOR_KEYS) {
  const diatonic = getDiatonicChords(key, 'major')
  const mixtureChords = parseChordInput(`${key}大调 ${MIXTURE_DEGREES.map(([token]) => token).join('-')}`).chords
  for (const [index, chord] of mixtureChords.entries()) {
    const [, expectedDegree, lowersRoot] = MIXTURE_DEGREES[index]!
    const diatonicRoot = diatonic[expectedDegree - 1]!.notes[0]!
    const expectedPitchClass = (PITCH_CLASSES[diatonicRoot]! - (lowersRoot ? 1 : 0) + 12) % 12
    if (chord.harmonicSource !== 'parallel-minor-mixture' || chord.notes[0]?.[0] !== diatonicRoot[0] || chord.pitchClasses[0] !== expectedPitchClass) {
      throw new Error(`${key} major ${MIXTURE_DEGREES[index]![0]}: parallel-minor mixture spelling audit failed`)
    }
  }
}

for (const [key, mode, modeLabel] of [
  ...HARMONY_MAJOR_KEYS.map((majorKey) => [majorKey, 'major', '大调'] as const),
  ...HARMONY_MINOR_KEYS.map((minorKey) => [minorKey, 'minor', '小调'] as const),
] as const) {
  const targets = getDiatonicChords(key, mode)
  for (const [index, target] of targets.entries()) {
    if (index === 0 || target.quality === 'dim') continue
    const targetToken = degreeTokenForQuality(index + 1, target.quality)
    const [applied] = parseChordInput(`${key}${modeLabel} vii°7/${targetToken}`).chords
    const targetRoot = target.notes[0]!
    const expectedRootPitchClass = (PITCH_CLASSES[targetRoot]! + 11) % 12
    const expectedRootLetter = LETTERS[(LETTERS.indexOf(targetRoot[0] as typeof LETTERS[number]) + 6) % LETTERS.length]
    if (applied?.quality !== 'dim7' || applied.pitchClasses[0] !== expectedRootPitchClass || applied.notes[0]?.[0] !== expectedRootLetter) {
      throw new Error(`${key} ${mode}: vii°7/${targetToken} spelling audit failed; target ${targetRoot}, applied ${applied?.notes.join('-')}, expected root pc ${expectedRootPitchClass} and letter ${expectedRootLetter}`)
    }
  }
}

for (const input of ['C大调 viiø', 'C大调 vii#7', 'C大调 v/V', 'C大调 V7/III', 'C大调 V7/V/V', 'C大调 VII°7/V', 'C大调 vii°7/III', 'C大调 vii°7/V/V', 'A小调 I', 'A小调 IV', 'C大调 bII', 'C大调 bVII7', 'C大调 V7/bVI', 'C大调 V/I', 'A小调 V/i', 'C大调 V/vii°', 'A小调 V/ii°', 'C大调 viiø7/ii', 'A小调 viiø7/iv']) {
  let failed = false
  try { parseChordInput(input) } catch { failed = true }
  if (!failed) throw new Error(`${input}: unsupported syntax must fail explicitly`)
}

for (const [symbol, expectedBass] of [['C/E', 'E'], ['C/D', 'D']] as const) {
  const chord = createChordFromName(symbol, SOURCE)
  const midi = getVoicingMidiNotes(chord, 0, 4)
  if (!midi.every((note, index) => index === 0 || note > (midi[index - 1] ?? -Infinity))) {
    throw new Error(`${symbol}: sounding MIDI notes must be strictly ascending`)
  }
  const actualBass = Object.entries(PITCH_CLASSES).find(([, pitchClass]) => pitchClass === midi[0]! % 12)?.[0]
  if (actualBass !== expectedBass) throw new Error(`${symbol}: slash bass is not the actual lowest MIDI note`)
}

console.log(`Core theory audit passed (${ABSOLUTE_CHORD_AUDIT.length * AUDIT_ROOTS.length} absolute structures; ${HARMONY_MAJOR_KEYS.length + HARMONY_MINOR_KEYS.length} diatonic key systems).`)
