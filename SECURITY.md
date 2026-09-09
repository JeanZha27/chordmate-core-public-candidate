# Security Policy

## Current status

ChordMate Core is a private pre-publication package currently hosted in a private GitHub repository. It has no published security team, security email address, response SLA, hosted service, account system, or external API.

No formal security audit has been completed.

## Scope

The planned review scope includes:

- Core source, tests, configuration, and generated `dist/` output
- Dependency lockfile and build tooling
- Accidental inclusion of secrets, personal information, or third-party materials

ChordMate Core does not currently provide a server, user-data storage, authentication flow, or browser download adapter.

## Reporting before publication

No public vulnerability-reporting channel is enabled yet. Do not post secrets, private keys, or exploitable details in a public location. The project owner has selected GitHub private vulnerability reporting. Because GitHub provides this setting only after a repository is public, the owner must enable and verify it immediately after the final authorized visibility change and before sharing or announcing the repository link. If the setting is unavailable, stop distribution and keep the repository private until the owner makes a new decision. No personal private email address or chat account is designated for public security reporting.

## Planned release gate

Before a public release, the project must complete a dependency review, secret and privacy scan, third-party material audit, and reproducible clean-environment verification. This document does not make a support or response-time commitment.
