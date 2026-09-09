# ChordMate Core

ChordMate Core is a pure TypeScript music-theory library for chord parsing, scales, diatonic chords, transposition, piano voicings, voice leading, and MIDI file construction.

## Status

- Version: `0.1.5`
- Package status: `private: true`
- Repository status: private GitHub release candidate; not public
- npm publication status: not published
- Build target: bundler ESM
- License for Core source code: MPL-2.0

This repository is not a hosted product and does not include an online demo or real user data.

## Verified capabilities

- Chord parsing and note spelling
- Major and natural-minor scales and diatonic chords
- Degree-based progression transposition
- Basic inversions, performance voicings, and add2/add9 voicings
- Voice-leading metrics and three voicing styles
- Pure MIDI file construction that returns `Uint8Array`

The Core package does not include React, browser DOM APIs, Web Audio, LocalStorage, download adapters, Studio logic, BGM logic, guitar data, or `chordFunction`.

## Verification status

The `0.1.5` pre-publication candidate is verified from a clean checkout with the Node.js and pnpm versions declared in `package.json` by running:

```bash
pnpm test
pnpm typecheck
pnpm build
```

The checks cover all 9 Core test suites, including 476 absolute chord structures and 25 supported key-system audits. The build emits 8 JavaScript files and 8 TypeScript declaration files. Release evidence is point-in-time evidence for this exact candidate; any source, dependency, lockfile, or build-configuration change requires a new verification run.

## Local use

This package is still private. For local work, install dependencies and build before consuming the generated output:

The reproducible build baseline is Node.js `24.19.0` and pnpm `11.19.0`. The same versions are declared in `package.json`; use a compatible Node 24 release and the declared pnpm version when reproducing a release check.

```bash
pnpm install
pnpm build
```

`dist/` is intentionally not committed. Consumers working from a clone must run `pnpm build` themselves.

## Module compatibility

The generated output is intended for ESM-aware bundlers. It does not currently promise direct execution by native Node ESM because internal relative imports retain extensionless specifiers.

See [API.md](./API.md) for the 40 explicit public exports. This repository contains only the reusable, deterministic theory and MIDI-construction library. Browser UI, audio playback, downloads, user accounts, hosted services, analytics, and the private ChordMate Basic application are outside this repository.

## Security and licensing status

Core source code is licensed under the Mozilla Public License 2.0; see [LICENSE](./LICENSE). A point-in-time dependency, privacy, credential, packaging, and clean-build review has been completed for this private candidate; this is not a guarantee that the software is free of defects or vulnerabilities. No public GitHub release or npm release has been made. See [SECURITY.md](./SECURITY.md) and [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).
