# Caveman Core Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the Caveman core skill to this project only.

**Architecture:** Store the skill under `.opencode/skills/` so opencode discovers it locally. Register that directory in the project `opencode.json` via `skills.paths`, leaving all other config unchanged.

**Tech Stack:** opencode config JSON, markdown skill file.

---

### Task 1: Add local Caveman skill

**Files:**
- Create: `.opencode/skills/caveman/SKILL.md`

- [ ] **Step 1: Write the skill file**

```markdown
---
name: caveman
description: >
  Ultra-compressed communication mode. Cuts token usage ~75% by speaking like caveman
  while keeping full technical accuracy. Supports intensity levels: lite, full (default), ultra,
  wenyan-lite, wenyan-full, wenyan-ultra.
  Use when user says "caveman mode", "talk like caveman", "use caveman", "less tokens",
  "be brief", or invokes /caveman. Also auto-triggers when token efficiency is requested.
---

Respond terse like smart caveman. All technical substance stay. Only fluff die.
```

- [ ] **Step 2: Verify file exists in the expected path**

Run: `Test-Path -LiteralPath ".opencode/skills/caveman/SKILL.md"`
Expected: `True`

### Task 2: Register local skills path

**Files:**
- Modify: `opencode.json`

- [ ] **Step 1: Add the local skills path**

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["superpowers@git+https://github.com/obra/superpowers.git"],
  "skills": {
    "paths": [".opencode/skills"]
  },
  "mcp": {
    "supabase": {
      "type": "local",
      "command": [
        "cmd",
        "/c",
        "npx",
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        "sbp_c63b3c5c01e54c52dfc6b4ab20f1c6af2e368270"
      ],
      "enabled": true
    }
  }
}
```

- [ ] **Step 2: Verify JSON stays valid**

Run: `node -e "JSON.parse(require('fs').readFileSync('opencode.json','utf8')); console.log('ok')"`
Expected: `ok`

### Task 3: Confirm discovery

**Files:**
- Verify: `.opencode/skills/caveman/SKILL.md`
- Verify: `opencode.json`

- [ ] **Step 1: Confirm opencode can see the local skill path**

Run: `Test-Path -LiteralPath ".opencode/skills"`
Expected: `True`

- [ ] **Step 2: Tell the user to restart opencode**

Expected: opencode must be restarted to load the new project config and skill files.
