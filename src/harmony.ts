import { parseChordInput } from './chord'
import type { Mode, ParseResult } from './model'

export const HARMONY_MAJOR_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'] as const
export const HARMONY_MINOR_KEYS = ['A', 'E', 'B', 'F#', 'C#', 'G#', 'D', 'G', 'C', 'F', 'Bb', 'Eb'] as const

const DEGREE_PATTERNS: Record<Mode, string> = {
  major: 'I-ii-iii-IV-V-vi-vii°',
  minor: 'i-ii°-III-iv-v-VI-VII',
}

export function modeInput(key: string, mode: Mode, pattern = DEGREE_PATTERNS[mode]): string {
  return `${key}${mode === 'major' ? '大调' : '小调'} ${pattern}`
}

export function buildScale(key: string, mode: Mode): ParseResult {
  return parseChordInput(modeInput(key, mode))
}

export function getDiatonicChords(key: string, mode: Mode): ParseResult['chords'] {
  return buildScale(key, mode).chords
}
