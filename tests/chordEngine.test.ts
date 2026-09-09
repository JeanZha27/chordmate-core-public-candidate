import { ChordParseError, parseChordInput } from '../src/chord'

interface AcceptanceCase {
  input: string
  names: string[]
  notes?: string[][]
}

const cases: AcceptanceCase[] = [
  { input: 'C大調 Iadd9', names: ['Cadd9'], notes: [['C', 'E', 'G', 'D']] },
  { input: 'C大調 Iadd2', names: ['Cadd2'], notes: [['C', 'D', 'E', 'G']] },
  { input: 'A小調 iadd2', names: ['Amadd2'], notes: [['A', 'B', 'C', 'E']] },
  { input: 'A小調 iadd9', names: ['Amadd9'], notes: [['A', 'C', 'E', 'B']] },
  { input: 'C大調 Isus2', names: ['Csus2'], notes: [['C', 'D', 'G']] },
  { input: 'G大調 Vsus4', names: ['Dsus4'], notes: [['D', 'G', 'A']] },
  { input: 'G大調 V7sus4', names: ['D7sus4'], notes: [['D', 'G', 'A', 'C']] },
  { input: 'C大調 I9', names: ['C9'], notes: [['C', 'E', 'G', 'Bb', 'D']] },
  { input: 'C大調 Imaj9', names: ['Cmaj9'], notes: [['C', 'E', 'G', 'B', 'D']] },
  { input: 'C大調 vii°7', names: ['Bdim7'], notes: [['B', 'D', 'F', 'Ab']] },
  { input: 'C大調 viiø7', names: ['Bm7b5'], notes: [['B', 'D', 'F', 'A']] },
  { input: 'C大調 viim7b5', names: ['Bm7b5'], notes: [['B', 'D', 'F', 'A']] },
  { input: 'F大調 IV', names: ['Bb'], notes: [['Bb', 'D', 'F']] },
  { input: 'Gb大調 I-IV-V', names: ['Gb', 'Cb', 'Db'] },
  { input: 'A小調 1637', names: ['Am', 'F', 'C', 'G'] },
  { input: 'A小调 V-V7-i', names: ['E', 'E7', 'Am'], notes: [['E', 'G#', 'B'], ['E', 'G#', 'B', 'D'], ['A', 'C', 'E']] },
  { input: 'C大調 1645', names: ['C', 'Am', 'F', 'G'] },
  { input: 'G大調 I-V-vi-IV', names: ['G', 'D', 'Em', 'C'] },
  { input: 'C大调 V/V-V7/ii-I', names: ['D', 'A7', 'C'], notes: [['D', 'F#', 'A'], ['A', 'C#', 'E', 'G'], ['C', 'E', 'G']] },
  { input: 'A小调 V7/iv-i', names: ['A7', 'Am'], notes: [['A', 'C#', 'E', 'G'], ['A', 'C', 'E']] },
  { input: 'C大调 vii°/V-vii°7/V-viiø7/V-V', names: ['F#dim', 'F#dim7', 'F#m7b5', 'G'], notes: [['F#', 'A', 'C'], ['F#', 'A', 'C', 'Eb'], ['F#', 'A', 'C', 'E'], ['G', 'B', 'D']] },
  { input: 'A小调 vii°7/iv-iv', names: ['C#dim7', 'Dm'], notes: [['C#', 'E', 'G', 'Bb'], ['D', 'F', 'A']] },
  { input: 'C大调 i-ii°-bIII-iv-v-bVI-bVII', names: ['Cm', 'Ddim', 'Eb', 'Fm', 'Gm', 'Ab', 'Bb'], notes: [['C', 'Eb', 'G'], ['D', 'F', 'Ab'], ['Eb', 'G', 'Bb'], ['F', 'Ab', 'C'], ['G', 'Bb', 'D'], ['Ab', 'C', 'Eb'], ['Bb', 'D', 'F']] },
  { input: 'C大调 ♭III-♭VI-♭VII', names: ['Eb', 'Ab', 'Bb'] },
]

for (const acceptance of cases) {
  const result = parseChordInput(acceptance.input)
  const actualNames = result.chords.map((chord) => chord.name)
  if (JSON.stringify(actualNames) !== JSON.stringify(acceptance.names)) {
    throw new Error(`${acceptance.input}: expected ${acceptance.names.join('-')}, got ${actualNames.join('-')}`)
  }
  if (acceptance.notes) {
    const actualNotes = result.chords.map((chord) => chord.notes)
    if (JSON.stringify(actualNotes) !== JSON.stringify(acceptance.notes)) {
      throw new Error(`${acceptance.input}: note spelling mismatch`)
    }
  }
}

for (const input of ['', 'C大調', 'H大調 I', 'C大調 I-unknown', 'C大調 viiø', 'C大調 v/V', 'C大調 V9/V', 'C大調 V7/III', 'C大調 V7/bII', 'C大調 V7/V/V', 'C大调 VII°7/V', 'C大调 vii°9/V', 'C大调 vii°7/III', 'C大调 vii°7/bII', 'C大调 vii°7/V/V', 'C大调 V/I', 'A小调 V/i', 'C大调 V/vii°', 'A小调 V/ii°', 'C大调 viiø7/ii', 'A小调 viiø7/iv', 'C大調 I-II-III-IV-V-vi-vii°-I-II-III-IV-V-vi']) {
  let failed = false
  try { parseChordInput(input) } catch { failed = true }
  if (!failed) throw new Error(`invalid input should fail: ${input}`)
}

for (const [input, expectedCode] of [
  ['C大调 V/I', 'APPLIED_SELF_TARGET'],
  ['A小调 V/ii°', 'APPLIED_DIMINISHED_TARGET'],
  ['C大调 viiø7/ii', 'APPLIED_HALF_DIMINISHED_MINOR_TARGET'],
  ['C大调 v/V', 'UNSUPPORTED_APPLIED_SYMBOL'],
  ['C大调 V7/III', 'INVALID_APPLIED_TARGET'],
  ['A小调 I', 'UNSUPPORTED_MINOR_MIXTURE'],
] as const) {
  try {
    parseChordInput(input)
    throw new Error(`${input}: expected ${expectedCode}`)
  } catch (error) {
    if (!(error instanceof ChordParseError) || error.code !== expectedCode) {
      throw new Error(`${input}: expected stable error ${expectedCode}, got ${error instanceof ChordParseError ? error.code : 'non-ChordParseError'}`)
    }
  }
}

for (const [input, token] of [
  ['C大调 v/V', 'v/V'],
  ['C大调 I/V', 'I/V'],
] as const) {
  try {
    parseChordInput(input)
    throw new Error(`${input}: expected wording-only applied-syntax rejection`)
  } catch (error) {
    if (!(error instanceof ChordParseError) || error.code !== 'UNSUPPORTED_APPLIED_SYMBOL') {
      throw new Error(`${input}: rejection behavior or stable code changed`)
    }
    const expectedMessage = `当前产品不支持应用和弦写法“${token}”。这只表示当前语法边界，并不判定该符号在具体音乐语境中无效。`
    if (error.message !== expectedMessage || error.message.includes('副属／副导')) {
      throw new Error(`${input}: product-boundary message is not academically neutral`)
    }
  }
}

console.log(`Core chord parser tests passed (${cases.length} cases).`)
