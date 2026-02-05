@echo off
REM Strategic Planning Agent - Auto-triggered by Windows Task Scheduler
REM This script invokes Claude Code to run a strategic planning turn

setlocal

REM Set the workspace directory
set WORKSPACE_DIR=C:\Users\Tony\code\private\fbasic-emu

REM Get current date for log filename
set DATE stamp=%date:~10,4%%date:~4,2%%date:~7,2%

REM Create log directory if not exists
if not exist "%WORKSPACE_DIR%\docs\idea" mkdir "%WORKSPACE_DIR%\docs\idea"

REM Count existing idea files to determine turn number
set TURN_COUNT=0
for /f %%a in ('dir /b "%WORKSPACE_DIR%\docs\idea\*.md" 2^>nul ^| find /c /v ""') do set TURN_COUNT=%%a
set /a TURN_NUM=%TURN_COUNT%+1

REM Invoke Claude Code in non-interactive mode
claude -p "This is strategic planning turn #%TURN_NUM% for the Family Basic IDE workspace.

Your task:
1. Explore the codebase to understand its current state
2. Brainstorm strategic improvements, thinking big picture with creativity and vision
3. Look at different angles than previous ideas (check docs/idea/ for existing ideas)
4. Write a new idea log to docs/idea/ with filename format: YYYYMMDD-###-title.md

Focus areas to consider (rotate through these):
- Performance & scalability
- Architecture & code quality
- User experience & features
- Community & ecosystem
- Testing & reliability
- Developer experience
- Business model & sustainability
- Integrations & extensions

Be strategic, creative, and think about the long-term vision for this project.

Workspace: %WORKSPACE_DIR%" --add-dir "%WORKSPACE_DIR%"

endlocal
