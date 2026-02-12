@echo off
REM Strategic Planning Agent - Auto-triggered by Windows Task Scheduler
REM This script invokes Claude Code to run a strategic planning turn
REM
REM Usage: run-turn.bat
REM   Typically called by Windows Task Scheduler via setup-task.ps1
REM
REM Required environment variables:
REM   ANTHROPIC_BASE_URL      - API endpoint (or uses default Anthropic)
REM   ANTHROPIC_AUTH_TOKEN    - Your API key

setlocal EnableDelayedExpansion

REM Get script directory and derive workspace (parent of scripts/scheduled-agent)
set "SCRIPT_DIR=%~dp0"
set "WORKSPACE_DIR=%SCRIPT_DIR%..\.."

REM Resolve to absolute path
for %%I in ("%WORKSPACE_DIR%") do set "WORKSPACE_DIR=%%~fI"

REM Add common locations for claude to PATH
set "PATH=%PATH%;%USERPROFILE%\AppData\Roaming\npm;C:\Program Files\nodejs;%LOCALAPPDATA%\Claude"

REM Create log directory
if not exist "%WORKSPACE_DIR%\logs\scheduled-agent" mkdir "%WORKSPACE_DIR%\logs\scheduled-agent"

REM Get current timestamp for log
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set "TIMESTAMP=%datetime:~0,8%-%datetime:~8,6%"

REM Count existing idea files to determine turn number
set "TURN_COUNT=0"
for /f %%a in ('dir /b "%WORKSPACE_DIR%\docs\idea\*.md" 2^>nul ^| find /c /v ""') do set "TURN_COUNT=%%a"
set /a TURN_NUM=TURN_COUNT+1

REM Log the start of this turn
echo [%date% %time%] Starting Turn #%TURN_NUM% >> "%WORKSPACE_DIR%\logs\scheduled-agent\agent.log"

REM Find claude executable
set "CLAUDE_CMD="
where claude >nul 2>&1
if %errorlevel% equ 0 (
    set "CLAUDE_CMD=claude"
    goto :found_claude
)

REM Try alternative locations
if exist "%USERPROFILE%\AppData\Roaming\npm\claude.cmd" (
    set "CLAUDE_CMD=%USERPROFILE%\AppData\Roaming\npm\claude.cmd"
    goto :found_claude
)

if exist "%LOCALAPPDATA%\Claude\claude.exe" (
    set "CLAUDE_CMD=%LOCALAPPDATA%\Claude\claude.exe"
    goto :found_claude
)

REM Claude not found
echo [%date% %time%] ERROR: Claude executable not found in PATH >> "%WORKSPACE_DIR%\logs\scheduled-agent\agent.log"
exit /b 1

:found_claude
echo [%date% %time%] Using Claude: !CLAUDE_CMD! >> "%WORKSPACE_DIR%\logs\scheduled-agent\agent.log"

REM Check for required API credentials
if "%ANTHROPIC_AUTH_TOKEN%"=="" (
    echo [%date% %time%] ERROR: ANTHROPIC_AUTH_TOKEN not set >> "%WORKSPACE_DIR%\logs\scheduled-agent\agent.log"
    echo [%date% %time%] Please set ANTHROPIC_AUTH_TOKEN environment variable >> "%WORKSPACE_DIR%\logs\scheduled-agent\agent.log"
    exit /b 1
)

REM Change to workspace directory
cd /d "%WORKSPACE_DIR%" || (
    echo [%date% %time%] ERROR: Cannot change to workspace directory >> "%WORKSPACE_DIR%\logs\scheduled-agent\agent.log"
    exit /b 1
)

REM Create prompt file
set "PROMPT_FILE=%TEMP%\claude_prompt_%TURN_NUM%_%RANDOM%.txt"

REM Randomly choose idea type
set /a "IDEA_TYPE_RAND=%RANDOM% %% 2"
if %IDEA_TYPE_RAND%==0 (
    set "IDEA_TYPE=BIG"
    set "IDEA_SCOPE=Comprehensive multi-phase initiative spanning 4-6 months"
) else (
    set "IDEA_TYPE=SMALL"
    set "IDEA_SCOPE=Focused feature implementable in 1-2 weeks"
)

echo This is strategic planning turn #%TURN_NUM% for the Family Basic IDE workspace. > "%PROMPT_FILE%"
echo. >> "%PROMPT_FILE%"
echo IDEA TYPE: %IDEA_TYPE% >> "%PROMPT_FILE%"
echo SCOPE: %IDEA_SCOPE% >> "%PROMPT_FILE%"
echo. >> "%PROMPT_FILE%"
echo Your task: >> "%PROMPT_FILE%"
echo 1. Explore the codebase to understand its current state >> "%PROMPT_FILE%"
echo 2. Look at different angles than previous ideas (check docs/idea/ for existing ideas) >> "%PROMPT_FILE%"
echo 3. Write a new idea log to docs/idea/ with filename format: YYYYMMDD-###-title.md >> "%PROMPT_FILE%"
echo. >> "%PROMPT_FILE%"
echo Focus areas to consider (rotate through these): >> "%PROMPT_FILE%"
echo - Performance ^& scalability >> "%PROMPT_FILE%"
echo - Architecture ^& code quality >> "%PROMPT_FILE%"
echo - User experience ^& features >> "%PROMPT_FILE%"
echo - Testing ^& reliability >> "%PROMPT_FILE%"
echo - Developer experience >> "%PROMPT_FILE%"
echo. >> "%PROMPT_FILE%"
echo Workspace: %WORKSPACE_DIR% >> "%PROMPT_FILE%"

REM Log invocation
echo [%date% %time%] Invoking Claude for Turn #%TURN_NUM% >> "%WORKSPACE_DIR%\logs\scheduled-agent\agent.log"

REM Create turn-specific output file
set "TURN_OUTPUT=%WORKSPACE_DIR%\logs\scheduled-agent\turns\turn-%TURN_NUM%-%TIMESTAMP%.txt"
if not exist "%WORKSPACE_DIR%\logs\scheduled-agent\turns" mkdir "%WORKSPACE_DIR%\logs\scheduled-agent\turns"
echo ======== TURN #%TURN_NUM% OUTPUT ======== >> "%TURN_OUTPUT%"
echo Date: %date% %time% >> "%TURN_OUTPUT%"
echo. >> "%TURN_OUTPUT%"

REM Run Claude with prompt from file
"!CLAUDE_CMD!" -p @"%PROMPT_FILE%" --add-dir "%WORKSPACE_DIR%" --permission-mode bypassPermissions >> "%TURN_OUTPUT%" 2>&1

REM Clean up prompt file
del "%PROMPT_FILE%" 2>nul

REM Log completion
echo [%date% %time%] Turn #%TURN_NUM% completed with exit code %errorlevel% >> "%WORKSPACE_DIR%\logs\scheduled-agent\agent.log"

endlocal
