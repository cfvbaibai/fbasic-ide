@echo off
REM Strategic Planning Agent - Auto-triggered by Windows Task Scheduler
REM This script invokes Claude Code to run a strategic planning turn

setlocal EnableDelayedExpansion

REM Set the workspace directory
set "WORKSPACE_DIR=C:\Users\Tony\code\private\fbasic-emu"

REM Add common locations for claude to PATH
set "PATH=%PATH%;%USERPROFILE%\AppData\Roaming\npm;C:\Program Files\nodejs;%LOCALAPPDATA%\Claude"

REM Create log directory
if not exist "%WORKSPACE_DIR%\docs\idea" mkdir "%WORKSPACE_DIR%\docs\idea"

REM Create logs directory
if not exist "%WORKSPACE_DIR%\logs" mkdir "%WORKSPACE_DIR%\logs"

REM Get current timestamp for log
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set "TIMESTAMP=%datetime:~0,8%-%datetime:~8,6%"

REM Count existing idea files to determine turn number
set "TURN_COUNT=0"
for /f %%a in ('dir /b "%WORKSPACE_DIR%\docs\idea\*.md" 2^>nul ^| find /c /v ""') do set "TURN_COUNT=%%a"
set /a TURN_NUM=TURN_COUNT+1

REM Log the start of this turn
echo [%date% %time%] Starting Turn #%TURN_NUM% >> "%WORKSPACE_DIR%\logs\strategic-agent.log"

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
echo [%date% %time%] ERROR: Claude executable not found in PATH >> "%WORKSPACE_DIR%\logs\strategic-agent.log"
echo [%date% %time%] PATH=%PATH% >> "%WORKSPACE_DIR%\logs\strategic-agent.log"
exit /b 1

:found_claude
echo [%date% %time%] Using Claude: !CLAUDE_CMD! >> "%WORKSPACE_DIR%\logs\strategic-agent.log"
echo [%date% %time%] USERPROFILE: %USERPROFILE% >> "%WORKSPACE_DIR%\logs\strategic-agent.log"
echo [%date% %time%] Credentials exist: >> "%WORKSPACE_DIR%\logs\strategic-agent.log"
if exist "%USERPROFILE%\.claude\.credentials.json" (
    echo [%date% %time%]   YES - Credentials file found >> "%WORKSPACE_DIR%\logs\strategic-agent.log"
) else (
    echo [%date% %time%]   NO - Credentials file NOT found >> "%WORKSPACE_DIR%\logs\strategic-agent.log"
)

REM Set required environment variables for Claude API
set "ANTHROPIC_BASE_URL=https://open.bigmodel.cn/api/anthropic"
set "ANTHROPIC_DEFAULT_SONNET_MODEL=glm-4.7"
set "ANTHROPIC_DEFAULT_OPUS_MODEL=glm-4.7"
set "ANTHROPIC_AUTH_TOKEN=a1dec76a803c4b3fb92651afcef4edd5.XiodwGrnPotKp0Nu"
echo [%date% %time%] Environment variables set >> "%WORKSPACE_DIR%\logs\strategic-agent.log"

REM Change to workspace directory
cd /d "%WORKSPACE_DIR%" || (
    echo [%date% %time%] ERROR: Cannot change to workspace directory >> "%WORKSPACE_DIR%\logs\strategic-agent.log"
    exit /b 1
)

REM Invoke Claude Code in non-interactive mode
REM Using a temporary file to avoid multi-line string parsing issues
set "PROMPT_FILE=%TEMP%\claude_prompt_%TURN_NUM%_%RANDOM%.txt"

REM Randomly choose idea type: 0-16383 = BIG, 16384-32767 = SMALL
set /a "IDEA_TYPE_RAND=%RANDOM% %% 2"
if %IDEA_TYPE_RAND%==0 (
    set "IDEA_TYPE=BIG"
    set "IDEA_SCOPE=Comprehensive multi-phase initiative spanning 4-6 months"
    set "IDEA_DETAIL=Deep analysis with implementation phases, architecture, infrastructure, and success metrics"
) else (
    set "IDEA_TYPE=SMALL"
    set "IDEA_SCOPE=Focused feature implementable in 1-2 weeks"
    set "IDEA_DETAIL=Concrete implementation with specific files, functions, and clear acceptance criteria"
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
if %IDEA_TYPE_RAND%==0 (
    echo For a BIG idea, create: >> "%PROMPT_FILE%"
    echo - Comprehensive multi-phase initiative (4-6 months) >> "%PROMPT_FILE%"
    echo - Include: problem statement, proposed solution, architecture, implementation phases, success metrics >> "%PROMPT_FILE%"
    echo - Think long-term vision, systemic impact, ecosystem changes >> "%PROMPT_FILE%"
) else (
    echo For a SMALL idea, create: >> "%PROMPT_FILE%"
    echo - Focused feature implementable in 1-2 weeks >> "%PROMPT_FILE%"
    echo - Include: specific files to modify, functions to add, clear acceptance criteria >> "%PROMPT_FILE%"
    echo - Think incremental improvement, quick win, concrete code change >> "%PROMPT_FILE%"
)
echo. >> "%PROMPT_FILE%"
echo Focus areas to consider (rotate through these): >> "%PROMPT_FILE%"
echo - Performance ^& scalability >> "%PROMPT_FILE%"
echo - Architecture ^& code quality >> "%PROMPT_FILE%"
echo - User experience ^& features >> "%PROMPT_FILE%"
echo - Community ^& ecosystem >> "%PROMPT_FILE%"
echo - Testing ^& reliability >> "%PROMPT_FILE%"
echo - Developer experience >> "%PROMPT_FILE%"
echo - Business model ^& sustainability >> "%PROMPT_FILE%"
echo - Integrations ^& extensions >> "%PROMPT_FILE%"
echo. >> "%PROMPT_FILE%"
echo Be strategic, creative, and think about the long-term vision for this project. >> "%PROMPT_FILE%"
echo. >> "%PROMPT_FILE%"
echo Workspace: %WORKSPACE_DIR% >> "%PROMPT_FILE%"

REM Log invocation
echo [%date% %time%] Invoking Claude for Turn #%TURN_NUM% >> "%WORKSPACE_DIR%\logs\strategic-agent.log"

REM Create turn-specific output file
set "TURN_OUTPUT=%WORKSPACE_DIR%\logs\turns\turn-%TURN_NUM%-%TIMESTAMP%.txt"
echo. > "%TURN_OUTPUT%"
echo ======== TURN #%TURN_NUM% OUTPUT ======== >> "%TURN_OUTPUT%"
echo Date: %date% %time% >> "%TURN_OUTPUT%"
echo. >> "%TURN_OUTPUT%"

REM Run Claude with prompt from file
REM Using bypassPermissions mode for non-interactive execution
REM Output goes to turn-specific file, errors go to main log
"!CLAUDE_CMD!" -p @"%PROMPT_FILE%" --add-dir "%WORKSPACE_DIR%" --permission-mode bypassPermissions >> "%TURN_OUTPUT%" 2>&1

REM Clean up prompt file
del "%PROMPT_FILE%" 2>nul

REM Log completion with reference to turn output
echo [%date% %time%] Turn #%TURN_NUM% completed with exit code %errorlevel% >> "%WORKSPACE_DIR%\logs\strategic-agent.log"
echo [%date% %time%]   Output saved to: logs\turns\turn-%TURN_NUM%-%TIMESTAMP%.txt >> "%WORKSPACE_DIR%\logs\strategic-agent.log"

endlocal
