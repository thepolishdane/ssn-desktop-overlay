$ws = New-Object -ComObject WScript.Shell
$desktop = [Environment]::GetFolderPath('Desktop')
$shortcut = $ws.CreateShortcut("$desktop\SSN Overlay.lnk")
$shortcut.TargetPath = 'D:\Projects\ssn-desktop-overlay\SSN Overlay.bat'
$shortcut.WorkingDirectory = 'D:\Projects\ssn-desktop-overlay'
$shortcut.WindowStyle = 7
$shortcut.Description = 'SSN chat + activity feed desktop overlay'
$shortcut.Save()
Write-Host "Shortcut created at $desktop\SSN Overlay.lnk"
