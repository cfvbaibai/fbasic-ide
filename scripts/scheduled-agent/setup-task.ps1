# Setup script for Windows Scheduled Task
# Run this script with PowerShell as Administrator to create the scheduled task
#
# Usage:
#   .\setup-task.ps1 [-IntervalMinutes 30] [-TaskName "FamilyBasic Strategic Agent"]
#
# Parameters:
#   -IntervalMinutes  - How often to run (default: 30)
#   -TaskName         - Name for the scheduled task (default: "FamilyBasic Strategic Agent")
#
# Required environment variables (set before running):
#   ANTHROPIC_AUTH_TOKEN - Your API key for the LLM service

param(
    [int]$IntervalMinutes = 30,
    [string]$TaskName = "FamilyBasic Strategic Agent"
)

$ErrorActionPreference = "Stop"

# Get script directory and derive workspace path
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$WorkspaceDir = Split-Path -Parent (Split-Path -Parent $ScriptDir)
$ScriptPath = Join-Path $ScriptDir "run-turn.bat"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Strategic Agent Task Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Workspace: $WorkspaceDir"
Write-Host "Script: $ScriptPath"
Write-Host "Interval: Every $IntervalMinutes minutes"
Write-Host ""

# Verify script exists
if (-not (Test-Path $ScriptPath)) {
    Write-Host "ERROR: Script not found: $ScriptPath" -ForegroundColor Red
    exit 1
}

# Check for API token
if ([string]::IsNullOrEmpty($env:ANTHROPIC_AUTH_TOKEN)) {
    Write-Host "WARNING: ANTHROPIC_AUTH_TOKEN is not set." -ForegroundColor Yellow
    Write-Host "The scheduled task will fail without this environment variable." -ForegroundColor Yellow
    Write-Host "Set it in your system environment variables before the task runs." -ForegroundColor Yellow
    Write-Host ""
}

# Delete existing task if it exists
Write-Host "Checking for existing task..." -ForegroundColor Cyan
$existingTask = schtasks /query /tn "$TaskName" 2>$null
if ($LASTEXITCODE -eq 0) {
    schtasks /delete /tn "$TaskName" /f | Out-Null
    Write-Host "Removed existing task" -ForegroundColor Yellow
} else {
    Write-Host "No existing task to remove" -ForegroundColor Gray
}

# Create the new scheduled task
Write-Host "Creating new scheduled task..." -ForegroundColor Cyan
schtasks /create /tn "$TaskName" /tr "cmd.exe /c `"$ScriptPath`"" /sc minute /mo $IntervalMinutes /f | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to create scheduled task" -ForegroundColor Red
    exit 1
}

# Verify creation
schtasks /query /tn "$TaskName" | Out-Null

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Scheduled task setup complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Task Name: $TaskName"
Write-Host "Interval: Every $IntervalMinutes minutes"
Write-Host "Script: $ScriptPath"
Write-Host "Workspace: $WorkspaceDir"
Write-Host ""
Write-Host "Log files will be written to:" -ForegroundColor White
Write-Host "  $WorkspaceDir\logs\scheduled-agent\"
Write-Host ""
Write-Host "To manage the task:"
Write-Host "  - View:        schtasks /query /tn `"$TaskName`""
Write-Host "  - Run now:     schtasks /run /tn `"$TaskName`""
Write-Host "  - Stop:        schtasks /end /tn `"$TaskName`""
Write-Host "  - Delete:      schtasks /delete /tn `"$TaskName`" /f"
Write-Host ""
Write-Host "The agent will start automatically in $IntervalMinutes minutes."
Write-Host "To run immediately: schtasks /run /tn `"$TaskName`""
Write-Host ""
