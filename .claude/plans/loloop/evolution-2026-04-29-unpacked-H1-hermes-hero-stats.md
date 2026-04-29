# Unpacked Template Align — Evolution Note

## 2026-04-29 | Task H1: Hermes Hero Stats Strip

**Scope:** Add layer count, API surface count, protocol count, backend count to `topic-hermes-unpacked.html` hero section.

**What was done:**
- Verified existing hero stats strip already contained the four required metrics (6 layers, 10+ API surfaces, 5 protocols, 6 backends)
- Cross-checked against reference code in `reference/reference_agent/hermes-agent/`
- **Fix:** Protocol count corrected from 5 → 6 after discovering `gateway/platforms/qqbot/adapter.py` (QQ bot platform adapter in addition to Telegram/Discord/Slack/WhatsApp/Signal)
- Updated label from "消息协议" → "消息协议 / 平台" to reflect broader platform coverage

**Verification paths checked:**
- `reference/reference_agent/hermes-agent/gateway/platforms/` → 6 platform adapters
- `reference/reference_agent/hermes-agent/environments/` → 6 backend types (Local/Docker/SSH/Daytona/Singularity/Modal)
- `reference/reference_agent/hermes-agent/toolsets.py` → 28 toolsets, ~30 core tools (validates "10+" API surface estimate)
- Page structure matches `topic-cc-unpacked-zh.html` benchmark template

**Result:** Hero stats strip now accurately reflects Hermes architecture. Task complete.
