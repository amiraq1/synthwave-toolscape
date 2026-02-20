# Tools Audit Report

- Generated At: 2026-02-20T20:39:06.722Z
- Mode: apply
- Strictness: balanced
- Source: `public/data/tools.json`

## Executive Summary

| Metric | Value |
| --- | ---: |
| Source Total | 10103 |
| Cleaned Total | 5090 |
| Removed Total | 5013 |
| Removed Fake | 5002 |
| Removed Missing | 0 |
| Removed Invalid URL | 0 |
| Removed Duplicate URL | 2 |
| Removed Duplicate Title | 9 |
| Suspicious Ratio | 0.0000% |
| Valid URL Ratio | 100.00% |

## Acceptance Checks

- Suspicious ratio < 1%: PASS
- Valid URLs = 100%: PASS

## Output Targets

- Cleaned JSON: `public/data/tools.cleaned.json`
- Metrics JSON: `reports/tools-audit-metrics.json`
- Removed JSONL: `reports/tools-removed.jsonl`