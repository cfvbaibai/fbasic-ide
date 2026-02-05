# Setup script for Windows Scheduled Task
# Run this script with PowerShell as Administrator to create the scheduled task

$TaskName = "FamilyBasic Strategic Agent"
$ScriptPath = "C:\Users\Tony\code\private\fbasic-emu\strategic-turn.bat"
$WorkspaceDir = "C:\Users\Tony\code\private\fbasic-emu"

# Delete existing task if it exists
Write-Host "Checking for existing task..." -ForegroundColor Cyan
schtasks /query /tn "$TaskName" 2>$null
if ($LASTEXITCODE -eq 0) {
    schtasks /delete /tn "$TaskName" /f
    Write-Host "Removed existing task" -ForegroundColor Yellow
} else {
    Write-Host "No existing task to remove" -ForegroundColor Gray
}

# Create the new scheduled task using schtasks command directly
Write-Host "Creating new scheduled task..." -ForegroundColor Cyan
schtasks /create /tn "$TaskName" /tr "cmd.exe /c `"$ScriptPath`"" /sc minute /mo 30 /f

# Verify creation
schtasks /query /tn "$TaskName"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Scheduled task setup complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Task Name: $TaskName"
Write-Host "Interval: Every 30 minutes"
Write-Host "Script: $ScriptPath"
Write-Host "Workspace: $WorkspaceDir"
Write-Host ""
Write-Host "To manage the task:"
Write-Host "  - View:        schtasks /query /tn `"$TaskName`""
Write-Host "  - Run now:     schtasks /run /tn `"$TaskName`""
Write-Host "  - Stop:        schtasks /end /tn `"$TaskName`""
Write-Host "  - Delete:      schtasks /delete /tn `"$TaskName`" /f"
Write-Host "  - View logs:   Check Task Scheduler app or docs/idea/ folder"
Write-Host ""
Write-Host "The agent will start automatically in 30 minutes."
Write-Host "To run immediately, run: schtasks /run /tn `"$TaskName`""
Write-Host ""
