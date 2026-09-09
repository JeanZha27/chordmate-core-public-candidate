export type Mode = 'major' | 'minor'

export type HarmonicSource = 'diatonic' | 'parallel-minor-mixture' | 'applied' | 'functional-chromatic' | 'standalone'

export type ChordQuality =
  | 'major' | 'minor' | 'dim' | 'maj7' | 'm7' | 'dom7' | 'm7b5' | 'minMaj7'
  | 'add2' | 'madd2' | 'add9' | 'madd9' | 'sus2' | 'sus4' | '7sus4' | 'six' | 'm6'
  | 'dom9' | 'maj9' | 'm9' | 'dom11' | 'm11' | 'dom13' | 'maj13' | 'm13'
  | 'dim7' | 'aug' | 'power5'

export interface ChordResult {
  degree: string
  degreeNumber: number
  name: string
  notes: string[]
  pitchClasses: number[]
  quality: ChordQuality
  harmonicSource: HarmonicSource
  slashBass?: string
}

export interface ParseResult {
  key: string
  mode: Mode
  modeLabel: string
  progressionText: string
  chords: ChordResult[]
}

export interface MidiNote {
  midi: number
  beat: number
  durationBeats: number
}
