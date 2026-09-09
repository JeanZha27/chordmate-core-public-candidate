import type { ChordResult } from './model'
import { ChordConstructionError, getSupportedSlashBassPitchClass } from './chord'

export type PianoOctave = 3 | 4 | 5

export interface PerformanceVoicing {
  theoreticalNotes: string[]
  performedNotes: string[]
  performedPitchClasses: number[]
  omittedNotes: string[]
  explanation: string
}

const PERFORMANCE_TONE_INDEXES: Partial<Record<ChordResult['quality'], number[]>> = {
  dom9: [0, 1, 3, 4],
  maj9: [0, 1, 3, 4],
  m9: [0, 1, 3, 4],
  dom11: [0, 3, 4, 5],
  m11: [0, 1, 3, 4, 5],
  dom13: [0, 1, 3, 4, 6],
  maj13: [0, 1, 3, 4, 6],
  m13: [0, 1, 3, 4, 6],
}

function omissionExplanation(chord: ChordResult, omitted: string[]): string {
  if (!omitted.length) return '保留完整和弦音'
  if (chord.quality === 'dom11') return `实奏省略 ${omitted.join('、')}，避免三音与十一音拥挤`
  if (['dom13', 'maj13', 'm13'].includes(chord.quality)) return `实奏省略 ${omitted.join('、')}，突出七音、九音与十三音`
  if (['dom9', 'maj9', 'm9'].includes(chord.quality)) return `实奏省略 ${omitted.join('、')}，让九音更清晰`
  return `实奏省略 ${omitted.join('、')}，保持声部清楚`
}

export function getPerformanceVoicing(chord: ChordResult): PerformanceVoicing {
  const indexes = PERFORMANCE_TONE_INDEXES[chord.quality] ?? chord.pitchClasses.map((_, index) => index)
  const performedNotes = indexes.map((index) => chord.notes[index]).filter((note): note is string => Boolean(note))
  const performedPitchClasses = indexes.map((index) => chord.pitchClasses[index]).filter((pc): pc is number => pc !== undefined)
  const omittedNotes = chord.notes.filter((_, index) => !indexes.includes(index))
  return {
    theoreticalNotes: [...chord.notes],
    performedNotes,
    performedPitchClasses,
    omittedNotes,
    explanation: omissionExplanation(chord, omittedNotes),
  }
}

export function getPerformancePitchClasses(chord: ChordResult): number[] {
  return [...new Set(getPerformanceVoicing(chord).performedPitchClasses)]
}

export function getMaximumInversion(chord: ChordResult): number {
  if (chord.slashBass) return 0
  return Math.min(3, getPerformancePitchClasses(chord).length - 1)
}

function performanceIntervals(chord: ChordResult): number[] {
  const rootPitchClass = chord.pitchClasses[0]
  if (chord.quality === 'add9' || chord.quality === 'madd9') {
    return getPerformancePitchClasses(chord).map((pitchClass, index) => {
      const interval = (pitchClass - rootPitchClass + 12) % 12
      return index === getPerformancePitchClasses(chord).length - 1 ? interval + 12 : interval
    })
  }
  return [...new Set(getPerformancePitchClasses(chord).map((pitchClass) =>
    (pitchClass - rootPitchClass + 12) % 12))].sort((a, b) => a - b)
}

function ascendingFromBass(pitchClasses: number[], bassPitchClass: number, bassMidi: number): number[] {
  const bassIndex = pitchClasses.indexOf(bassPitchClass)
  const orderedPitchClasses = bassIndex < 0
    ? [bassPitchClass, ...pitchClasses]
    : [...pitchClasses.slice(bassIndex), ...pitchClasses.slice(0, bassIndex)]
  let previousDistance = -1
  return orderedPitchClasses.map((pitchClass) => {
    let distance = (pitchClass - bassPitchClass + 12) % 12
    while (distance <= previousDistance) distance += 12
    previousDistance = distance
    return bassMidi + distance
  })
}

export function getVoicingMidiNotes(chord: ChordResult, inversion: number, octave: PianoOctave): number[] {
  const performancePitchClasses = getPerformancePitchClasses(chord)
  if (!performancePitchClasses.length) return []
  const rootPitchClass = chord.pitchClasses[0]
  const rootMidi = (octave + 1) * 12 + rootPitchClass

  if (chord.slashBass) {
    const bassPitchClass = getSupportedSlashBassPitchClass(chord.slashBass)
    if (bassPitchClass === undefined) {
      throw new ChordConstructionError('INVALID_SLASH_BASS', `当前输入语法不支持斜线低音“${chord.slashBass}”。`)
    }
    const rootPosition = performanceIntervals(chord).map((interval) => rootMidi + interval).sort((left, right) => left - right)
    if (performancePitchClasses.includes(bassPitchClass)) {
      const bassMidi = rootMidi + (bassPitchClass - rootPitchClass + 12) % 12
      return ascendingFromBass(performancePitchClasses, bassPitchClass, bassMidi)
    }
    const bassAtOrAboveRoot = rootMidi + (bassPitchClass - rootPitchClass + 12) % 12
    const bassMidi = bassAtOrAboveRoot >= rootPosition[0] ? bassAtOrAboveRoot - 12 : bassAtOrAboveRoot
    return [bassMidi, ...rootPosition]
  }

  const safeInversion = Math.max(0, Math.min(inversion, getMaximumInversion(chord)))
  if (safeInversion === 0) {
    return performanceIntervals(chord).map((interval) => rootMidi + interval).sort((left, right) => left - right)
  }

  const bassPitchClass = performancePitchClasses[safeInversion] ?? rootPitchClass
  const bassMidi = rootMidi + (bassPitchClass - rootPitchClass + 12) % 12
  return ascendingFromBass(performancePitchClasses, bassPitchClass, bassMidi)
}

export function getVoicingName(chord: ChordResult, inversion: number, octave: PianoOctave): string {
  if (chord.slashBass) return chord.name
  const midiNotes = getVoicingMidiNotes(chord, inversion, octave)
  if (!midiNotes.length || inversion === 0) return chord.name
  const bassPitchClass = midiNotes[0] % 12
  const bassIndex = chord.pitchClasses.findIndex((pitchClass) => pitchClass === bassPitchClass)
  const bassName = chord.notes[bassIndex] ?? chord.notes[0]
  return `${chord.name}/${bassName}`
}
