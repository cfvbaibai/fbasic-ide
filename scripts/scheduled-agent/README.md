# Strategic Agent Automation

Automated strategic planning agent that periodically generates project improvement ideas using Claude Code.

## Overview

This system uses Windows Task Scheduler to automatically invoke Claude Code at regular intervals. Claude explores the codebase and generates new feature/improvement ideas, saving them to `docs/idea/`.

## Files

| File | Purpose |
|------|---------|
| `setup-task.ps1` | Creates the Windows Scheduled Task (run as Administrator) |
| `run-turn.bat` | Invokes Claude Code to generate a new idea |

## Setup

### 1. Set Environment Variables

The agent requires API credentials to function. Set these environment variables:

```powershell
# Option A: Set for current session
$env:ANTHROPIC_AUTH_TOKEN = "your-api-token-here"

# Option B: Set permanently (recommended)
[System.Environment]::SetEnvironmentVariable("ANTHROPIC_AUTH_TOKEN", "your-api-token-here", "User")

# Optional: Custom API endpoint (if using a proxy)
[System.Environment]::SetEnvironmentVariable("ANTHROPIC_BASE_URL", "https://api.anthropic.com", "User")
```

### 2. Create the Scheduled Task

Run PowerShell as Administrator and execute:

```powershell
cd C:\Users\Tony\code\private\fbasic-emu\scripts\scheduled-agent
.\setup-task.ps1
```

Custom options:

```powershell
.\setup-task.ps1 -IntervalMinutes 60 -TaskName "My Custom Agent"
```

### 3. Verify Setup

```powershell
# Check task exists
schtasks /query /tn "FamilyBasic Strategic Agent"

# Run immediately to test
schtasks /run /tn "FamilyBasic Strategic Agent"
```

## Output

| Location | Description |
|----------|-------------|
| `docs/idea/*.md` | Generated idea documents |
| `logs/scheduled-agent/agent.log` | Execution log |
| `logs/scheduled-agent/turns/*.txt` | Full output from each turn |

## Managing the Task

```powershell
# View task status
schtasks /query /tn "FamilyBasic Strategic Agent"

# Run immediately
schtasks /run /tn "FamilyBasic Strategic Agent"

# Stop running task
schtasks /end /tn "FamilyBasic Strategic Agent"

# Delete task
schtasks /delete /tn "FamilyBasic Strategic Agent" /f
```

## How It Works

1. Windows Task Scheduler triggers `run-turn.bat` at the configured interval
2. The script counts existing ideas in `docs/idea/` to determine the turn number
3. Claude Code is invoked in non-interactive mode (`bypassPermissions`)
4. Claude explores the codebase and writes a new idea file
5. Output is logged to `logs/scheduled-agent/turns/`

## Idea Types

Each turn randomly chooses between:

- **BIG** — Comprehensive multi-phase initiatives (4-6 months)
- **SMALL** — Focused features implementable in 1-2 weeks

## Security Notes

- API tokens are read from environment variables, not hardcoded
- The task runs with `bypassPermissions` mode — Claude can modify files without prompting
- Consider reviewing generated ideas before acting on them

## Troubleshooting

**Task fails to run:**
- Verify `ANTHROPIC_AUTH_TOKEN` is set in the environment
- Check `logs/scheduled-agent/agent.log` for errors
- Ensure Claude Code CLI is installed and in PATH

**No ideas generated:**
- Check `logs/scheduled-agent/turns/` for Claude's output
- Verify the workspace path is correct
- Ensure `docs/idea/` directory exists
