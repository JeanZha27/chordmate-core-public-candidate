# Security Policy

## Current status

ChordMate Core `0.1.5` is published as source code in this GitHub repository. The npm package remains unpublished, and `package.json` keeps `private: true`. The project has no hosted service, account system, external API, published security team, public security email address, or response SLA.

No formal security audit has been completed.

## Scope

The planned review scope includes:

- Core source, tests, configuration, and generated `dist/` output
- Dependency lockfile and build tooling
- Accidental inclusion of secrets, personal information, or third-party materials

ChordMate Core does not currently provide a server, user-data storage, authentication flow, or browser download adapter.

## Reporting a vulnerability

Use GitHub private vulnerability reporting from this repository's **Security** page. Do not post secrets, private keys, personal information, proof-of-concept exploits, or other sensitive vulnerability details in a public Issue, Discussion, pull request, or comment.

If the private reporting entry is unavailable, do not disclose the vulnerability publicly. Wait until the project owner restores or confirms a private reporting channel. No personal email address, telephone number, physical address, private chat account, or location information is designated for public security reporting.

## Release and change gate

Before a tagged release, package publication, or materially changed public candidate, the project must repeat the relevant dependency review, secret and privacy scan, third-party material audit, and reproducible clean-environment verification. This document does not make a support or response-time commitment.
