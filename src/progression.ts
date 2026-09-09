import { parseChordInput } from './chord'
import type { Mode, ParseResult } from './model'

export const MAJOR_TRANSPOSE_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'] as const
export const MINOR_TRANSPOSE_KEYS = ['A', 'E', 'B', 'F#', 'C#', 'G#', 'D', 'G', 'C', 'F', 'Bb', 'Eb'] as const

export function buildProgressionInput(result: ParseResult, key: string, mode: Mode): string {
  const modeLabel = mode === 'major' ? '大调' : '小调'
  return `${key}${modeLabel} ${result.chords.map((chord) => chord.degree).join('-')}`
}

export function transposeProgression(result: ParseResult, key: string, mode: Mode): ParseResult {
  return parseChordInput(buildProgressionInput(result, key, mode))
}
