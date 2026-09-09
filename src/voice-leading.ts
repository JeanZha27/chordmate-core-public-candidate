import type { ChordResult } from './model'
import { getMaximumInversion, getVoicingMidiNotes } from './voicing'
import type { PianoOctave } from './voicing'

export type VoicingStyle = '平稳' | '开阔' | '戏剧性'

export interface VoiceLeadingMetrics {
  totalMovement: number
  maximumLeap: number
  commonTones: number
  bassMovement: number
  octaveJump: boolean
}

export interface SmoothVoicing {
  inversion: number
  midiNotes: number[]
  metrics: VoiceLeadingMetrics
  style: VoicingStyle
}

function pitchClass(note: number): number { return ((note % 12) + 12) % 12 }

export function evaluateVoiceLeading(previous: number[], current: number[]): VoiceLeadingMetrics {
  if (!previous.length || !current.length) return { totalMovement: 0, maximumLeap: 0, commonTones: 0, bassMovement: 0, octaveJump: false }
  const movements = current.map((note) => Math.min(...previous.map((previousNote) => Math.abs(previousNote - note))))
  const previousPcs = new Set(previous.map(pitchClass))
  const currentPcs = new Set(current.map(pitchClass))
  const commonTones = [...currentPcs].filter((pc) => previousPcs.has(pc)).length
  const bassMovement = Math.abs(previous[0] - current[0])
  return {
    totalMovement: movements.reduce((sum, value) => sum + value, 0),
    maximumLeap: Math.max(...movements),
    commonTones,
    bassMovement,
    octaveJump: bassMovement >= 12 || movements.some((value) => value >= 12),
  }
}

function styleVoicing(notes: number[], style: VoicingStyle): number[] {
  const sorted = [...notes].sort((a, b) => a - b)
  if (style === '平稳' || sorted.length < 3) return sorted
  if (style === '开阔') {
    return sorted.map((note, index) => index > 0 && note - sorted[0] < 7 ? note + 12 : note).sort((a, b) => a - b)
  }
  return sorted.map((note, index) => index === sorted.length - 1 ? note + 12 : note).sort((a, b) => a - b)
}

function candidates(chord: ChordResult, octave: PianoOctave, style: VoicingStyle): Array<Pick<SmoothVoicing, 'inversion' | 'midiNotes'>> {
  const result: Array<Pick<SmoothVoicing, 'inversion' | 'midiNotes'>> = []
  for (let inversion = 0; inversion <= getMaximumInversion(chord); inversion += 1) {
    const base = getVoicingMidiNotes(chord, inversion, octave)
    for (const shift of [-12, 0, 12]) {
      const shifted = base.map((note) => note + shift)
      result.push({ inversion, midiNotes: styleVoicing(shifted, style) })
    }
  }
  return result
}

function candidateCost(previous: number[], current: number[], style: VoicingStyle): number {
  const metrics = evaluateVoiceLeading(previous, current)
  const range = current[current.length - 1] - current[0]
  const registerPenalty = current.reduce((sum, note) => sum + Math.max(0, 43 - note) * 2 + Math.max(0, note - 88) * 2, 0)
  if (style === '开阔') {
    return metrics.totalMovement * .5 + metrics.bassMovement * .38 + metrics.maximumLeap * .4 + Math.max(0, 15 - range) * 2.2 + registerPenalty - metrics.commonTones * 3
  }
  if (style === '戏剧性') {
    return metrics.totalMovement * .38 + Math.abs(metrics.bassMovement - 7) * .45 + Math.max(0, 12 - range) + registerPenalty - metrics.commonTones * 1.5
  }
  return metrics.totalMovement + metrics.bassMovement * .72 + metrics.maximumLeap * .9 + (metrics.octaveJump ? 24 : 0) + registerPenalty - metrics.commonTones * 6
}

export function createConnectedVoicings(chords: ChordResult[], octave: PianoOctave, style: VoicingStyle = '平稳'): SmoothVoicing[] {
  if (!chords.length) return []
  const firstNotes = styleVoicing(getVoicingMidiNotes(chords[0], 0, octave), style)
  const first: SmoothVoicing = { inversion: 0, midiNotes: firstNotes, metrics: evaluateVoiceLeading([], firstNotes), style }
  return chords.slice(1).reduce<SmoothVoicing[]>((voicings, chord) => {
    const previous = voicings[voicings.length - 1].midiNotes
    const options = candidates(chord, octave, style)
    const next = options.reduce((best, candidate) => candidateCost(previous, candidate.midiNotes, style) < candidateCost(previous, best.midiNotes, style) ? candidate : best)
    return [...voicings, { ...next, metrics: evaluateVoiceLeading(previous, next.midiNotes), style }]
  }, [first])
}

export function createSmoothVoicings(chords: ChordResult[], octave: PianoOctave): SmoothVoicing[] {
  return createConnectedVoicings(chords, octave, '平稳')
}

export function getVoicingNameFromMidi(chord: ChordResult, midiNotes: number[]): string {
  if (!midiNotes.length || midiNotes[0] % 12 === chord.pitchClasses[0]) return chord.name
  const bassPitchClass = midiNotes[0] % 12
  const bassIndex = chord.pitchClasses.findIndex((pitchClass) => pitchClass === bassPitchClass)
  return `${chord.name}/${chord.notes[bassIndex] ?? chord.notes[0]}`
}
