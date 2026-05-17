@echo off
cd /d "%~dp0"
start "SSN Overlay" /min cmd /c "node launch.js"
exit
