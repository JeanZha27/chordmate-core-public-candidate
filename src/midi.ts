import type { ChordResult, MidiNote } from './model'
import { getVoicingMidiNotes } from './voicing'

const TICKS_PER_BEAT = 480
const MIN_BPM = 30
const MAX_BPM = 240
const MAX_MIDI_TICK = 0x0fff_ffff

export type MidiValidationErrorCode =
  | 'INVALID_MIDI_INPUT'
  | 'INVALID_BPM'
  | 'INVALID_CHORD_BEATS'
  | 'INVALID_MELODY_NOTE'
  | 'INVALID_MELODY_BEAT'
  | 'INVALID_MELODY_DURATION'
  | 'INVALID_CHORD_VOICING'

/** Stable rejection for invalid MIDI-builder input. */
export class MidiValidationError extends Error {
  constructor(public readonly code: MidiValidationErrorCode, message: string) {
    super(message)
    this.name = 'MidiValidationError'
  }
}

interface MidiEvent {
  tick: number
  priority: number
  data: number[]
}

export interface MidiFileMetadata {
  /** A descriptive track title; this does not assert a work title, key or meter. */
  trackName?: string
  /** One plain-text marker per supplied chord, written at that chord's onset. */
  chordMarkers?: string[]
}

function u32(value: number): number[] {
  return [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255]
}

function variableLength(value: number): number[] {
  let buffer = value & 0x7f
  const bytes: number[] = []
  while ((value >>= 7)) {
    buffer <<= 8
    buffer |= (value & 0x7f) | 0x80
  }
  while (true) {
    bytes.push(buffer & 255)
    if (buffer & 0x80) buffer >>= 8
    else break
  }
  return bytes
}

function utf8(value: string): number[] {
  const bytes: number[] = []
  for (const character of value) {
    const codePoint = character.codePointAt(0)!
    if (codePoint <= 0x7f) bytes.push(codePoint)
    else if (codePoint <= 0x7ff) bytes.push(0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f))
    else if (codePoint <= 0xffff) bytes.push(0xe0 | (codePoint >> 12), 0x80 | ((codePoint >> 6) & 0x3f), 0x80 | (codePoint & 0x3f))
    else bytes.push(0xf0 | (codePoint >> 18), 0x80 | ((codePoint >> 12) & 0x3f), 0x80 | ((codePoint >> 6) & 0x3f), 0x80 | (codePoint & 0x3f))
  }
  return bytes
}

function textMetaEvent(type: number, text: string): number[] {
  const bytes = utf8(text)
  return [0xff, type, ...variableLength(bytes.length), ...bytes]
}

function midiError(code: MidiValidationErrorCode, message: string): never {
  throw new MidiValidationError(code, message)
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isValidMidiNote(value: unknown): value is number {
  return isFiniteNumber(value) && Number.isInteger(value) && value >= 0 && value <= 127
}

function isPositiveMidiBeat(value: unknown): value is number {
  return isFiniteNumber(value) && value > 0
}

function canRepresentBeat(value: number): boolean {
  return Math.round(value * TICKS_PER_BEAT) <= MAX_MIDI_TICK
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isMidiChord(value: unknown): value is ChordResult {
  return isRecord(value)
    && Array.isArray(value.notes)
    && value.notes.length > 0
    && value.notes.every((note) => typeof note === 'string')
    && Array.isArray(value.pitchClasses)
    && value.pitchClasses.length === value.notes.length
    && value.pitchClasses.every((pitchClass) => Number.isInteger(pitchClass) && pitchClass >= 0 && pitchClass <= 11)
    && typeof value.quality === 'string'
    && (value.slashBass === undefined || typeof value.slashBass === 'string')
}

function validateMetadata(metadata: unknown): asserts metadata is MidiFileMetadata | undefined {
  if (metadata === undefined) return
  if (!isRecord(metadata)) {
    midiError('INVALID_MIDI_INPUT', 'MIDI 元数据必须是对象。')
  }
  if (metadata.trackName !== undefined && typeof metadata.trackName !== 'string') {
    midiError('INVALID_MIDI_INPUT', 'MIDI 轨道名称必须是字符串。')
  }
  if (metadata.chordMarkers !== undefined
    && (!Array.isArray(metadata.chordMarkers) || !metadata.chordMarkers.every((marker) => typeof marker === 'string'))) {
    midiError('INVALID_MIDI_INPUT', 'MIDI 和弦标记必须是字符串数组。')
  }
}

function validateMidiInput(
  chords: ChordResult[],
  chordBeats: number[],
  bpm: number,
  melody: MidiNote[],
  chordVoicings?: number[][],
): number[] {
  if (!Array.isArray(chords)) {
    midiError('INVALID_MIDI_INPUT', 'MIDI 和弦列表必须是数组。')
  }
  if (!chords.every(isMidiChord)) {
    midiError('INVALID_MIDI_INPUT', 'MIDI 和弦条目缺少可生成声位的有效结构。')
  }
  if (!Array.isArray(chordBeats)) {
    midiError('INVALID_MIDI_INPUT', 'MIDI 和弦时值列表必须是数组。')
  }
  if (!Array.isArray(melody)) {
    midiError('INVALID_MIDI_INPUT', 'MIDI 旋律列表必须是数组。')
  }
  if (chordVoicings !== undefined && !Array.isArray(chordVoicings)) {
    midiError('INVALID_MIDI_INPUT', 'MIDI 和弦声位列表必须是数组。')
  }

  if (!Number.isInteger(bpm) || bpm < MIN_BPM || bpm > MAX_BPM) {
    midiError('INVALID_BPM', `BPM 必须是 ${MIN_BPM}–${MAX_BPM} 之间的有限整数。`)
  }

  let totalBeats = 0
  const durations = chords.map((_, index) => {
    const duration = chordBeats[index] ?? 4
    if (!isPositiveMidiBeat(duration)) {
      midiError('INVALID_CHORD_BEATS', `第 ${index + 1} 个和弦时值必须是有限正数。`)
    }
    totalBeats += duration
    if (!canRepresentBeat(totalBeats)) {
      midiError('INVALID_CHORD_BEATS', '和弦总时值超出标准 MIDI 可表示范围。')
    }
    return duration
  })

  melody.forEach((note, index) => {
    if (!isRecord(note)) {
      midiError('INVALID_MELODY_NOTE', `第 ${index + 1} 个旋律音必须是对象。`)
    }
    if (!isValidMidiNote(note.midi)) {
      midiError('INVALID_MELODY_NOTE', `第 ${index + 1} 个旋律音必须是 0–127 的整数 MIDI 音高。`)
    }
    if (!Number.isFinite(note.beat) || note.beat < 0 || !canRepresentBeat(note.beat)) {
      midiError('INVALID_MELODY_BEAT', `第 ${index + 1} 个旋律起始拍必须是可表示的非负有限数。`)
    }
    if (!isPositiveMidiBeat(note.durationBeats) || !canRepresentBeat(note.beat + note.durationBeats)) {
      midiError('INVALID_MELODY_DURATION', `第 ${index + 1} 个旋律时值必须是可表示的有限正数。`)
    }
  })

  chordVoicings?.forEach((voicing, chordIndex) => {
    if (!Array.isArray(voicing)) {
      midiError('INVALID_CHORD_VOICING', `第 ${chordIndex + 1} 个和弦声位必须是数组。`)
    }
    if (!voicing.length) return
    voicing.forEach((midi) => {
      if (!isValidMidiNote(midi)) {
        midiError('INVALID_CHORD_VOICING', `第 ${chordIndex + 1} 个和弦声位必须只包含 0–127 的整数 MIDI 音高。`)
      }
    })
  })

  return durations
}

export function buildMidiFile(
  chords: ChordResult[],
  chordBeats: number[],
  bpm: number,
  melody: MidiNote[],
  chordVoicings?: number[][],
  metadata?: MidiFileMetadata,
): Uint8Array {
  validateMetadata(metadata)
  const durations = validateMidiInput(chords, chordBeats, bpm, melody, chordVoicings)
  const events: MidiEvent[] = []
  const microseconds = Math.round(60_000_000 / bpm)
  events.push({ tick: 0, priority: 0, data: [0xff, 0x51, 0x03, (microseconds >> 16) & 255, (microseconds >> 8) & 255, microseconds & 255] })
  events.push({ tick: 0, priority: 0, data: [0xc0, 0x04] })
  if (metadata?.trackName) events.push({ tick: 0, priority: 0, data: textMetaEvent(0x03, metadata.trackName) })
  if (melody.length) events.push({ tick: 0, priority: 0, data: [0xc1, 0x50] })

  let beatCursor = 0
  chords.forEach((chord, index) => {
    const startTick = Math.round(beatCursor * TICKS_PER_BEAT)
    const duration = durations[index]!
    const endTick = Math.round((beatCursor + duration) * TICKS_PER_BEAT)
    const midiNotes = chordVoicings?.[index]?.length ? chordVoicings[index] : getVoicingMidiNotes(chord, 0, 4)
    const marker = metadata?.chordMarkers?.[index]
    if (marker) events.push({ tick: startTick, priority: 0, data: textMetaEvent(0x06, marker) })
    midiNotes.forEach((midi) => {
      events.push({ tick: startTick, priority: 2, data: [0x90, midi, 68] })
      events.push({ tick: endTick, priority: 1, data: [0x80, midi, 0] })
    })
    beatCursor += duration
  })

  melody.forEach((note) => {
    const startTick = Math.round(note.beat * TICKS_PER_BEAT)
    const endTick = Math.round((note.beat + note.durationBeats) * TICKS_PER_BEAT)
    events.push({ tick: startTick, priority: 2, data: [0x91, note.midi, 88] })
    events.push({ tick: endTick, priority: 1, data: [0x81, note.midi, 0] })
  })

  events.sort((left, right) => left.tick - right.tick || left.priority - right.priority)
  const track: number[] = []
  let previousTick = 0
  events.forEach((event) => {
    track.push(...variableLength(event.tick - previousTick), ...event.data)
    previousTick = event.tick
  })
  track.push(0x00, 0xff, 0x2f, 0x00)

  return new Uint8Array([
    0x4d, 0x54, 0x68, 0x64, ...u32(6), 0x00, 0x00, 0x00, 0x01, (TICKS_PER_BEAT >> 8) & 255, TICKS_PER_BEAT & 255,
    0x4d, 0x54, 0x72, 0x6b, ...u32(track.length), ...track,
  ])
}
