# Phase 62 — Standalone Installer Package

## Goal

Make `installer/` a genuinely deployable customer bootstrap package.

## Customer flow

1. Customer uploads only `installer/`.
2. Visiting the domain enters the installer automatically.
3. Installer validates server requirements.
4. Installer verifies the license with AniFuze licensing infrastructure.
5. Installer collects database and initial owner configuration.
6. Installer requests an authorized release from AniFuze release infrastructure.
7. Installer downloads and verifies the release artifact.
8. Installer installs the `system/` application atomically.
9. Installer runs migrations and finalizes configuration.
10. Installer writes the installation lock and hands control to the installed system.

## Requirements

- Installer must not depend on source files being uploaded beside it.
- Customer package must not contain the full development system.
- Release artifacts must be integrity-checked and eventually signature-verified.
- Failed installation must leave the site recoverable.
- Installer endpoints remain available only until installation completes.
- Existing installations must boot directly into the system.
- CI must build and test the installer independently from the system.

## Work

- [ ] Standalone installer bootstrap runtime
- [ ] Installer-only frontend entry
- [ ] Installer configuration/bootstrap environment
- [ ] Release manifest protocol
- [ ] Release download and integrity verification
- [ ] Atomic system extraction/activation
- [ ] Installer-to-system handoff
- [ ] Rollback/recovery verification
- [ ] Customer installer package build
- [ ] CI package validation
- [ ] End-to-end clean-install test

## Completion criteria

A clean customer environment can receive only the installer package, visit its domain, complete licensing/setup, download the authorized AniFuze release, install it, and then boot the installed system without requiring the Git repository.
