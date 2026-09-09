import type { ChordQuality, ChordResult, Mode, ParseResult } from './model'

export type { ChordQuality, ChordResult, Mode, ParseResult } from './model'

export type ChordParseErrorCode =
  | 'INVALID_INPUT_FORMAT'
  | 'UNSUPPORTED_KEY'
  | 'EMPTY_PROGRESSION'
  | 'TOO_MANY_CHORDS'
  | 'UNRECOGNIZED_DEGREE'
  | 'UNSUPPORTED_APPLIED_SYMBOL'
  | 'INVALID_APPLIED_TARGET'
  | 'APPLIED_SELF_TARGET'
  | 'APPLIED_DIMINISHED_TARGET'
  | 'APPLIED_HALF_DIMINISHED_MINOR_TARGET'
  | 'UNSUPPORTED_MINOR_MIXTURE'
  | 'UNSUPPORTED_MIXTURE'

export class ChordParseError extends Error {
  constructor(public readonly code: ChordParseErrorCode, message: string) {
    super(message)
    this.name = 'ChordParseError'
  }
}

export type ChordConstructionErrorCode = 'INVALID_CHORD_NAME' | 'INVALID_SLASH_BASS'

/** Stable rejection for invalid standalone chord-name construction. */
export class ChordConstructionError extends Error {
  constructor(public readonly code: ChordConstructionErrorCode, message: string) {
    super(message)
    this.name = 'ChordConstructionError'
  }
}

function parseError(code: ChordParseErrorCode, message: string): never {
  throw new ChordParseError(code, message)
}

interface ParsedDegree {
  degree: number
  suffix: string
  triadHint: 'major' | 'minor' | 'numeric'
  diminished: 'none' | 'full' | 'half'
}

interface ChordTone {
  semitones: number
  letterSteps: number
}

const TRIAD_QUALITIES: Record<Mode, ChordQuality[]> = {
  major: ['major', 'minor', 'minor', 'major', 'major', 'minor', 'dim'],
  minor: ['minor', 'dim', 'major', 'minor', 'minor', 'major', 'major'],
}

const SEVENTH_QUALITIES: Record<Mode, ChordQuality[]> = {
  major: ['maj7', 'm7', 'm7', 'maj7', 'dom7', 'm7', 'm7b5'],
  minor: ['m7', 'm7b5', 'maj7', 'm7', 'm7', 'maj7', 'dom7'],
}

const NOTE_TO_PC: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1, 'C##': 2, Cbb: 10,
  D: 2, 'D#': 3, Eb: 3, 'D##': 4, Dbb: 0,
  E: 4, Fb: 4, 'E#': 5, 'E##': 6, Ebb: 2,
  F: 5, 'F#': 6, Gb: 6, 'F##': 7, Fbb: 3,
  G: 7, 'G#': 8, Ab: 8, 'G##': 9, Gbb: 5,
  A: 9, 'A#': 10, Bb: 10, 'A##': 11, Abb: 7,
  B: 11, Cb: 11, 'B#': 0, 'B##': 1, Bbb: 9,
}

const SUPPORTED_SLASH_BASS_PATTERN = /^[A-G](?:#|b)?$/

/**
 * Resolve the intentionally small standalone slash-bass grammar.
 * This is separate from internal theoretical note spelling, which may use
 * double accidentals when a chord formula requires them.
 */
export function getSupportedSlashBassPitchClass(note: string): number | undefined {
  return SUPPORTED_SLASH_BASS_PATTERN.test(note) ? NOTE_TO_PC[note] : undefined
}

const SCALES: Record<Mode, Record<string, string[]>> = {
  major: {
    C: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    D: ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
    E: ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
    F: ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
    G: ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
    A: ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
    B: ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'],
    'F#': ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#'],
    Bb: ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'],
    Eb: ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'],
    Ab: ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'],
    Db: ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C'],
    Gb: ['Gb', 'Ab', 'Bb', 'Cb', 'Db', 'Eb', 'F'],
  },
  minor: {
    A: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    D: ['D', 'E', 'F', 'G', 'A', 'Bb', 'C'],
    E: ['E', 'F#', 'G', 'A', 'B', 'C', 'D'],
    C: ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'],
    G: ['G', 'A', 'Bb', 'C', 'D', 'Eb', 'F'],
    B: ['B', 'C#', 'D', 'E', 'F#', 'G', 'A'],
    F: ['F', 'G', 'Ab', 'Bb', 'C', 'Db', 'Eb'],
    'F#': ['F#', 'G#', 'A', 'B', 'C#', 'D', 'E'],
    'C#': ['C#', 'D#', 'E', 'F#', 'G#', 'A', 'B'],
    'G#': ['G#', 'A#', 'B', 'C#', 'D#', 'E', 'F#'],
    Bb: ['Bb', 'C', 'Db', 'Eb', 'F', 'Gb', 'Ab'],
    Eb: ['Eb', 'F', 'Gb', 'Ab', 'Bb', 'Cb', 'Db'],
  },
}

const ROMAN_TO_DEGREE: Record<string, number> = {
  I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7,
}

const tones = (...values: Array<[number, number]>): ChordTone[] =>
  values.map(([semitones, letterSteps]) => ({ semitones, letterSteps }))

const CHORD_TONES: Record<ChordQuality, ChordTone[]> = {
  major: tones([0, 0], [4, 2], [7, 4]),
  minor: tones([0, 0], [3, 2], [7, 4]),
  dim: tones([0, 0], [3, 2], [6, 4]),
  maj7: tones([0, 0], [4, 2], [7, 4], [11, 6]),
  m7: tones([0, 0], [3, 2], [7, 4], [10, 6]),
  dom7: tones([0, 0], [4, 2], [7, 4], [10, 6]),
  m7b5: tones([0, 0], [3, 2], [6, 4], [10, 6]),
  minMaj7: tones([0, 0], [3, 2], [7, 4], [11, 6]),
  add2: tones([0, 0], [2, 1], [4, 2], [7, 4]),
  madd2: tones([0, 0], [2, 1], [3, 2], [7, 4]),
  add9: tones([0, 0], [4, 2], [7, 4], [14, 1]),
  madd9: tones([0, 0], [3, 2], [7, 4], [14, 1]),
  sus2: tones([0, 0], [2, 1], [7, 4]),
  sus4: tones([0, 0], [5, 3], [7, 4]),
  '7sus4': tones([0, 0], [5, 3], [7, 4], [10, 6]),
  six: tones([0, 0], [4, 2], [7, 4], [9, 5]),
  m6: tones([0, 0], [3, 2], [7, 4], [9, 5]),
  dom9: tones([0, 0], [4, 2], [7, 4], [10, 6], [14, 1]),
  maj9: tones([0, 0], [4, 2], [7, 4], [11, 6], [14, 1]),
  m9: tones([0, 0], [3, 2], [7, 4], [10, 6], [14, 1]),
  dom11: tones([0, 0], [4, 2], [7, 4], [10, 6], [14, 1], [17, 3]),
  m11: tones([0, 0], [3, 2], [7, 4], [10, 6], [14, 1], [17, 3]),
  dom13: tones([0, 0], [4, 2], [7, 4], [10, 6], [14, 1], [17, 3], [21, 5]),
  maj13: tones([0, 0], [4, 2], [7, 4], [11, 6], [14, 1], [17, 3], [21, 5]),
  m13: tones([0, 0], [3, 2], [7, 4], [10, 6], [14, 1], [17, 3], [21, 5]),
  dim7: tones([0, 0], [3, 2], [6, 4], [9, 6]),
  aug: tones([0, 0], [4, 2], [8, 4]),
  power5: tones([0, 0], [7, 4]),
}

const SUFFIX_PATTERN = '(7sus4|madd2|add2|madd9|add9|sus2|sus4|maj13|m13|13|m11|11|maj9|m9|9|m7b5|maj7|dim7|m7|7|m6|6|dim|aug|5)'

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const NATURAL_PC: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }

function normalizeKey(raw: string): string {
  const key = raw.replace('♯', '#').replace('♭', 'b')
  return key.charAt(0).toUpperCase() + key.slice(1)
}

function splitDegrees(source: string): string[] {
  const cleaned = source.trim().replace(/[–—]/g, '-').replace(/[，,、]/g, ' ')
  if (/^[1-7]{2,}$/.test(cleaned)) return cleaned.split('')
  return cleaned.split(/[\s-]+/).filter(Boolean)
}

function readDegree(token: string): ParsedDegree | null {
  const normalized = token.replace(/º/g, '°')
  const numeric = normalized.match(new RegExp(`^([1-7])([°ø])?${SUFFIX_PATTERN}?$`, 'i'))
  if (numeric) {
    if (numeric[2] === 'ø' && !numeric[3]) return null
    return {
      degree: Number(numeric[1]),
      suffix: numeric[3] ?? '',
      triadHint: 'numeric',
      diminished: numeric[2] === '°' ? 'full' : numeric[2] === 'ø' ? 'half' : 'none',
    }
  }

  const roman = normalized.match(new RegExp(`^(vii|iii|vi|iv|ii|v|i)([°ø])?${SUFFIX_PATTERN}?$`, 'i'))
  if (!roman) return null
  if (roman[2] === 'ø' && !roman[3]) return null
  const writtenRoman = roman[1]
  return {
    degree: ROMAN_TO_DEGREE[writtenRoman.toUpperCase()],
    suffix: roman[3] ?? '',
    triadHint: writtenRoman === writtenRoman.toUpperCase() ? 'major' : 'minor',
    diminished: roman[2] === '°' ? 'full' : roman[2] === 'ø' ? 'half' : 'none',
  }
}

function baseTriadFor(parsed: ParsedDegree, mode: Mode): ChordQuality {
  if (parsed.diminished !== 'none') return 'dim'
  if (parsed.triadHint === 'major') return 'major'
  if (parsed.triadHint === 'minor') return 'minor'
  return TRIAD_QUALITIES[mode][parsed.degree - 1]
}

function qualityFor(parsed: ParsedDegree, mode: Mode): ChordQuality {
  const baseTriad = baseTriadFor(parsed, mode)
  const suffix = parsed.suffix.toLowerCase()
  if (!suffix) return baseTriad

  if (suffix === '7' && parsed.diminished === 'full') return 'dim7'
  if (suffix === '7' && parsed.diminished === 'half') return 'm7b5'

  if (suffix === 'add2') return baseTriad === 'minor' ? 'madd2' : 'add2'
  if (suffix === 'madd2') return 'madd2'
  if (suffix === 'add9') return baseTriad === 'minor' ? 'madd9' : 'add9'
  if (suffix === 'madd9') return 'madd9'
  if (suffix === 'sus2') return 'sus2'
  if (suffix === 'sus4') return 'sus4'
  if (suffix === '7sus4') return '7sus4'
  if (suffix === '6') return baseTriad === 'minor' ? 'm6' : 'six'
  if (suffix === 'm6') return 'm6'
  if (suffix === '9') return baseTriad === 'minor' ? 'm9' : 'dom9'
  if (suffix === 'maj9') return 'maj9'
  if (suffix === 'm9') return 'm9'
  if (suffix === '11') return baseTriad === 'minor' ? 'm11' : 'dom11'
  if (suffix === 'm11') return 'm11'
  if (suffix === '13') return baseTriad === 'minor' ? 'm13' : 'dom13'
  if (suffix === 'maj13') return 'maj13'
  if (suffix === 'm13') return 'm13'
  if (suffix === 'dim') return 'dim'
  if (suffix === 'dim7') return 'dim7'
  if (suffix === 'm7b5') return 'm7b5'
  if (suffix === 'aug') return 'aug'
  if (suffix === '5') return 'power5'

  if (suffix === 'maj7') {
    if (baseTriad === 'minor') return 'minMaj7'
    if (baseTriad === 'dim') return 'm7b5'
    return 'maj7'
  }
  if (suffix === 'm7') return baseTriad === 'dim' ? 'm7b5' : 'm7'

  // A plain “7” keeps the scale's diatonic seventh when the written triad
  // agrees with the mode (IV7 → maj7, V7 → dominant 7). Borrowed Roman
  // numerals retain their written triad and receive a minor seventh.
  const diatonicTriad = TRIAD_QUALITIES[mode][parsed.degree - 1]
  if (parsed.triadHint === 'numeric' || baseTriad === diatonicTriad) {
    return SEVENTH_QUALITIES[mode][parsed.degree - 1]
  }
  if (baseTriad === 'major') return 'dom7'
  if (baseTriad === 'minor') return 'm7'
  return 'm7b5'
}

function isFunctionalChromatic(parsed: ParsedDegree, quality: ChordQuality, mode: Mode): boolean {
  if (parsed.degree === 7 && parsed.diminished === 'full' && quality === 'dim7') return true
  return mode === 'minor'
    && parsed.degree === 5
    && parsed.triadHint === 'major'
    && (quality === 'major' || quality === 'dom7')
}

function rootForParsedDegree(parsed: ParsedDegree, quality: ChordQuality, scale: string[], mode: Mode): string {
  const diatonicRoot = scale[parsed.degree - 1]!
  if (!(parsed.degree === 7 && parsed.diminished === 'full' && quality === 'dim7') || mode === 'major') return diatonicRoot

  return spellNote(diatonicRoot[0]!, (NOTE_TO_PC[diatonicRoot]! + 1) % 12)
}

function suffixFor(quality: ChordQuality): string {
  const suffixes: Record<ChordQuality, string> = {
    major: '', minor: 'm', dim: 'dim', maj7: 'maj7', m7: 'm7',
    dom7: '7', m7b5: 'm7b5', minMaj7: 'm(maj7)',
    add2: 'add2', madd2: 'madd2', add9: 'add9', madd9: 'madd9', sus2: 'sus2', sus4: 'sus4', '7sus4': '7sus4',
    six: '6', m6: 'm6', dom9: '9', maj9: 'maj9', m9: 'm9',
    dom11: '11', m11: 'm11', dom13: '13', maj13: 'maj13', m13: 'm13',
    dim7: 'dim7', aug: 'aug', power5: '5',
  }
  return suffixes[quality]
}

function spellNote(letter: string, pitchClass: number): string {
  const distance = (pitchClass - NATURAL_PC[letter] + 12) % 12
  if (distance === 0) return letter
  if (distance === 1) return `${letter}#`
  if (distance === 11) return `${letter}b`
  if (distance === 2) return `${letter}##`
  if (distance === 10) return `${letter}bb`
  return letter
}

function chordNotes(root: string, quality: ChordQuality): string[] {
  const rootPitchClass = NOTE_TO_PC[root]
  const rootLetterIndex = LETTERS.indexOf(root.charAt(0))
  return CHORD_TONES[quality].map((tone) => {
    const letter = LETTERS[(rootLetterIndex + tone.letterSteps) % 7]
    return spellNote(letter, (rootPitchClass + tone.semitones) % 12)
  })
}

const PARALLEL_MINOR_MIXTURE_TRIADS: Readonly<Record<string, Readonly<{ degree: number; lowerRoot: boolean; quality: ChordQuality }>>> = {
  i: { degree: 1, lowerRoot: false, quality: 'minor' },
  'ii°': { degree: 2, lowerRoot: false, quality: 'dim' },
  bIII: { degree: 3, lowerRoot: true, quality: 'major' },
  iv: { degree: 4, lowerRoot: false, quality: 'minor' },
  v: { degree: 5, lowerRoot: false, quality: 'minor' },
  bVI: { degree: 6, lowerRoot: true, quality: 'major' },
  bVII: { degree: 7, lowerRoot: true, quality: 'major' },
}

function normalizeMixtureToken(token: string): string {
  return token.replace(/º/g, '°').replace(/♭/g, 'b')
}

function parallelMinorMixtureChordFor(token: string, scale: string[], mode: Mode): ChordResult | null {
  const normalizedToken = normalizeMixtureToken(token)
  const mixture = PARALLEL_MINOR_MIXTURE_TRIADS[normalizedToken]

  if (mode === 'minor' && /^(I|IV)$/.test(normalizedToken)) {
    parseError('UNSUPPORTED_MINOR_MIXTURE', `暂不支持小调向平行大调借用的三和弦“${token}”。小调中的 V 或 V7 是明确写出的升导音属功能，不属于此借用范围。`)
  }
  if (!mixture) {
    if (normalizedToken.startsWith('b')) {
      parseError('UNSUPPORTED_MIXTURE', `暂不支持混合调式和弦“${token}”。目前仅支持大调中的 i、ii°、bIII、iv、v、bVI 或 bVII 三和弦。`)
    }
    return null
  }
  if (mode !== 'major') return null

  const diatonicRoot = scale[mixture.degree - 1]!
  const root = mixture.lowerRoot
    ? spellNote(diatonicRoot[0]!, (NOTE_TO_PC[diatonicRoot]! + 11) % 12)
    : diatonicRoot
  const { quality } = mixture
  return {
    degree: normalizedToken,
    degreeNumber: mixture.degree,
    name: `${root}${suffixFor(quality)}`,
    notes: chordNotes(root, quality),
    pitchClasses: CHORD_TONES[quality].map((tone) => (NOTE_TO_PC[root]! + tone.semitones) % 12),
    quality,
    harmonicSource: 'parallel-minor-mixture',
  }
}

function appliedDominantRoot(targetRoot: string): string {
  const targetLetterIndex = LETTERS.indexOf(targetRoot.charAt(0))
  const dominantLetter = LETTERS[(targetLetterIndex + 4) % LETTERS.length]
  return spellNote(dominantLetter, (NOTE_TO_PC[targetRoot] + 7) % 12)
}

function appliedLeadingToneRoot(targetRoot: string): string {
  const targetLetterIndex = LETTERS.indexOf(targetRoot.charAt(0))
  const leadingToneLetter = LETTERS[(targetLetterIndex + 6) % LETTERS.length]
  return spellNote(leadingToneLetter, (NOTE_TO_PC[targetRoot] + 11) % 12)
}

function appliedChordFor(token: string, scale: string[], mode: Mode): ChordResult | null {
  const normalizedToken = token.replace(/º/g, '°')
  if (!normalizedToken.includes('/')) return null

  const match = normalizedToken.match(/^(V7|V|vii°7|viiø7|vii°)\/(.+)$/)
  if (!match) {
    if (normalizedToken === 'v/V' || normalizedToken === 'I/V') {
      parseError('UNSUPPORTED_APPLIED_SYMBOL', `当前产品不支持应用和弦写法“${token}”。这只表示当前语法边界，并不判定该符号在具体音乐语境中无效。`)
    }
    parseError('UNSUPPORTED_APPLIED_SYMBOL', `暂不支持副属／副导和弦“${token}”。目前仅支持 V/x、V7/x、vii°/x、vii°7/x 或 viiø7/x。`)
  }

  const target = readDegree(match[2])
  const expectedTarget = target
    ? degreeTokenForQuality(target.degree, TRIAD_QUALITIES[mode][target.degree - 1])
    : ''
  if (!target || match[2] !== expectedTarget) {
    parseError('INVALID_APPLIED_TARGET', `无法识别副属目标“${match[2]}”。目标必须是当前调内的标准级数，例如 V、ii 或 iv。`)
  }

  const symbol = match[1]
  const targetQuality = TRIAD_QUALITIES[mode][target.degree - 1]!
  if (target.degree === 1) {
    parseError('APPLIED_SELF_TARGET', `“${token}”的目标是本调主和弦，不属于副属／副导。请直接写 ${symbol} 表示本调功能。`)
  }
  if (targetQuality === 'dim') {
    parseError('APPLIED_DIMINISHED_TARGET', `“${token}”指向减三和弦；本产品不将其作为标准副属／副导目标。`)
  }
  if (symbol === 'viiø7' && targetQuality === 'minor') {
    parseError('APPLIED_HALF_DIMINISHED_MINOR_TARGET', `“${token}”指向小三和弦。当前产品不在缺少作品语境时将 viiø7/x 自动认定为标准副导；请使用 vii°7/x，或结合乐谱另行判断。`)
  }
  const root = symbol.startsWith('V')
    ? appliedDominantRoot(scale[target.degree - 1])
    : appliedLeadingToneRoot(scale[target.degree - 1])
  const quality: ChordQuality = symbol === 'V7'
    ? 'dom7'
    : symbol === 'V'
      ? 'major'
      : symbol === 'vii°7'
        ? 'dim7'
        : symbol === 'viiø7'
          ? 'm7b5'
          : 'dim'
  return {
    degree: normalizedToken,
    degreeNumber: target.degree,
    name: `${root}${suffixFor(quality)}`,
    notes: chordNotes(root, quality),
    pitchClasses: CHORD_TONES[quality].map((tone) => (NOTE_TO_PC[root] + tone.semitones) % 12),
    quality,
    harmonicSource: 'applied',
  }
}

const CHORD_NAME_QUALITIES: Record<string, ChordQuality> = {
  '': 'major',
  m: 'minor',
  dim: 'dim',
  maj7: 'maj7',
  m7: 'm7',
  '7': 'dom7',
  m7b5: 'm7b5',
  'm(maj7)': 'minMaj7',
  add2: 'add2',
  madd2: 'madd2',
  add9: 'add9',
  madd9: 'madd9',
  sus2: 'sus2',
  sus4: 'sus4',
  '7sus4': '7sus4',
  '6': 'six',
  m6: 'm6',
  '9': 'dom9',
  maj9: 'maj9',
  m9: 'm9',
  '11': 'dom11',
  m11: 'm11',
  '13': 'dom13',
  maj13: 'maj13',
  m13: 'm13',
  dim7: 'dim7',
  aug: 'aug',
  '5': 'power5',
}

const MINOR_DEGREE_QUALITIES = new Set<ChordQuality>([
  'minor', 'm7', 'madd2', 'madd9', 'm6', 'm9', 'm11', 'm13', 'minMaj7', 'm7b5',
])

export function degreeTokenForQuality(degreeNumber: number, quality: ChordQuality): string {
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][degreeNumber - 1]
  const base = MINOR_DEGREE_QUALITIES.has(quality) || quality === 'dim' || quality === 'dim7'
    ? roman.toLowerCase()
    : roman
  const qualitySuffixes: Record<ChordQuality, string> = {
    major: '', minor: '', dim: '°', maj7: 'maj7', m7: 'm7',
    dom7: '7', m7b5: 'm7b5', minMaj7: 'maj7',
    add2: 'add2', madd2: 'add2', add9: 'add9', madd9: 'add9', sus2: 'sus2', sus4: 'sus4', '7sus4': '7sus4',
    six: '6', m6: '6', dom9: '9', maj9: 'maj9', m9: 'm9',
    dom11: '11', m11: 'm11', dom13: '13', maj13: 'maj13', m13: 'm13',
    dim7: 'dim7', aug: 'aug', power5: '5',
  }
  return `${base}${qualitySuffixes[quality]}`
}

export function createChordFromName(
  name: string,
  sourceChord: Pick<ChordResult, 'degree' | 'degreeNumber'>,
): ChordResult {
  const normalized = name.trim().replace(/♯/g, '#').replace(/♭/g, 'b')
  const segments = normalized.split('/')
  if (segments.length > 2 || !segments[0] || (segments.length === 2 && !segments[1])) {
    throw new ChordConstructionError('INVALID_CHORD_NAME', `无法建立和弦“${name}”：请输入一个和弦名称，或一个“和弦/低音”写法。`)
  }
  const [symbol, slashBass] = segments
  const match = symbol.match(/^([A-G](?:#|b)?)(m\(maj7\)|7sus4|madd2|add2|madd9|add9|sus2|sus4|maj13|m13|13|m11|11|maj9|m9|9|m7b5|maj7|dim7|m7|7|m6|6|dim|aug|m|5)?$/)
  if (!match || NOTE_TO_PC[match[1]] === undefined) {
    throw new ChordConstructionError('INVALID_CHORD_NAME', `暂时无法建立和弦“${name}”。`)
  }
  if (slashBass && getSupportedSlashBassPitchClass(slashBass) === undefined) {
    throw new ChordConstructionError('INVALID_SLASH_BASS', `当前输入语法不支持斜线低音“${slashBass}”。`)
  }
  const root = match[1]
  const quality = CHORD_NAME_QUALITIES[match[2] ?? '']
  const pitchClasses = CHORD_TONES[quality].map((tone) => (NOTE_TO_PC[root] + tone.semitones) % 12)
  return {
    degree: degreeTokenForQuality(sourceChord.degreeNumber, quality),
    degreeNumber: sourceChord.degreeNumber,
    name: `${root}${suffixFor(quality)}${slashBass ? `/${slashBass}` : ''}`,
    notes: chordNotes(root, quality),
    pitchClasses,
    quality,
    harmonicSource: 'standalone',
    slashBass,
  }
}

export function parseChordInput(input: string): ParseResult {
  const trimmed = input.trim()
  const match = trimmed.match(/^([A-Ga-g](?:[#b♯♭])?)\s*(大調|大调|小調|小调|major|minor|maj|min)\s+(.+)$/i)
  if (!match) {
    parseError('INVALID_INPUT_FORMAT', '请使用“调式 + 级数”的格式，例如：G大调 V7 或 D小调 ivmaj7。')
  }

  const key = normalizeKey(match[1])
  const writtenMode = match[2].toLowerCase()
  const mode: Mode = writtenMode.includes('小') || writtenMode === 'minor' || writtenMode === 'min' ? 'minor' : 'major'
  const scale = SCALES[mode][key]
  const chineseMode = mode === 'major' ? '大调' : '小调'
  if (!scale) {
    const suggestions = mode === 'major' ? 'C、F#、Bb、Eb、Db 或 Gb' : 'A、F#、C#、G#、Bb 或 Eb'
    parseError('UNSUPPORTED_KEY', `目前还不支持“${key} ${chineseMode}”，请尝试 ${suggestions} ${chineseMode}。`)
  }

  const degreeTokens = splitDegrees(match[3])
  if (!degreeTokens.length) parseError('EMPTY_PROGRESSION', '请在调式后输入至少一个和弦级数。')
  if (degreeTokens.length > 12) parseError('TOO_MANY_CHORDS', '一次最多解析 12 个和弦，请缩短和弦进行。')

  const chords: ChordResult[] = degreeTokens.map((token): ChordResult => {
    const appliedChord = appliedChordFor(token, scale, mode)
    if (appliedChord) return appliedChord
    const mixtureChord = parallelMinorMixtureChordFor(token, scale, mode)
    if (mixtureChord) return mixtureChord
    const parsed = readDegree(token)
    if (!parsed) {
      parseError('UNRECOGNIZED_DEGREE', `无法识别级数“${token}”。可使用 Iadd9、Vsus4、Imaj9、vii°7、viiø7、viim7b5、ivmaj7 或数字 1–7。`)
    }
    const quality = qualityFor(parsed, mode)
    const root = rootForParsedDegree(parsed, quality, scale, mode)
    const pitchClasses = CHORD_TONES[quality].map((tone) => (NOTE_TO_PC[root] + tone.semitones) % 12)
    return {
      degree: token,
      degreeNumber: parsed.degree,
      name: `${root}${suffixFor(quality)}`,
      notes: chordNotes(root, quality),
      pitchClasses,
      quality,
      harmonicSource: isFunctionalChromatic(parsed, quality, mode) ? 'functional-chromatic' : 'diatonic',
    }
  })

  return {
    key,
    mode,
    modeLabel: `${key} ${chineseMode}`,
    progressionText: degreeTokens.join(' – '),
    chords,
  }
}
