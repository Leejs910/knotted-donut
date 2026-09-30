$json = [Console]::In.ReadToEnd()
try { $obj = $json | ConvertFrom-Json } catch { exit 0 }
$toolName = $obj.tool_name

function Test-RmRf($command) {
    $segments = [regex]::Matches($command, '\brm\b[^;&|]*')
    foreach ($seg in $segments) {
        $s = $seg.Value
        $hasRecursive = ($s -match '(^|\s)-[a-zA-Z]*[rR][a-zA-Z]*(\s|$)') -or ($s -match '--recursive\b')
        $hasForce = ($s -match '(^|\s)-[a-zA-Z]*f[a-zA-Z]*(\s|$)') -or ($s -match '--force\b')
        if ($hasRecursive -and $hasForce) { return $true }
    }
    return $false
}

function Test-GitForcePush($command) {
    $segments = [regex]::Matches($command, '\bgit\s+push\b[^;&|]*')
    foreach ($seg in $segments) {
        $s = $seg.Value
        if (($s -match '--force(\s|$)') -or ($s -match '(^|\s)-f(\s|$)')) { return $true }
    }
    return $false
}

function Test-GitResetHard($command) {
    $segments = [regex]::Matches($command, '\bgit\s+reset\b[^;&|]*')
    foreach ($seg in $segments) {
        if ($seg.Value -match '--hard\b') { return $true }
    }
    return $false
}

function Test-ProtectedConfigPath($path) {
    if (-not $path) { return $false }
    $n = $path -replace '\\', '/'
    return ($n -match '(^|/)\.claude/settings(\.local)?\.json$') -or ($n -match '(^|/)\.claude/hooks/')
}

$deny = $null

if ($toolName -eq 'Bash' -or $toolName -eq 'PowerShell') {
    $cmd = $obj.tool_input.command
    if ($cmd) {
        $normalizedCmd = $cmd -replace '\\', '/'
        if ($cmd -match '(curl|wget)[^|;&]*\|\s*(sudo\s+)?(sh|bash|zsh)(\.exe)?(\s|$)') {
            $deny = "Blocked by policy: piping a curl/wget-downloaded script directly into a shell (sh/bash/zsh) is not allowed."
        }
        elseif (Test-RmRf $cmd) {
            $deny = "Blocked by policy: 'rm -rf' (recursive force delete) is not allowed."
        }
        elseif ($cmd -match '(^|[;&|]\s*)sudo\b') {
            $deny = "Blocked by policy: 'sudo' is not allowed."
        }
        elseif ($cmd -match '\bchmod\s+(-\S+\s+)*777\b') {
            $deny = "Blocked by policy: 'chmod 777' is not allowed."
        }
        elseif (Test-GitForcePush $cmd) {
            $deny = "Blocked by policy: 'git push --force' (or -f) is not allowed."
        }
        elseif (Test-GitResetHard $cmd) {
            $deny = "Blocked by policy: 'git reset --hard' is not allowed."
        }
        elseif (($normalizedCmd -match '\.claude/(settings(\.local)?\.json|hooks/)') -and
                ($cmd -match '(>{1,2}|\btee\b|\bcp\b|\bmv\b|\bsed\s+-i\b|Set-Content|Add-Content|Out-File|Remove-Item|\bdel\b|\brm\b)')) {
            $deny = "Blocked by policy: modifying the Claude Code permission/hook configuration files via shell is not allowed."
        }
    }
}
elseif ($toolName -eq 'Edit' -or $toolName -eq 'Write') {
    $path = $obj.tool_input.file_path
    if (Test-ProtectedConfigPath $path) {
        $deny = "Blocked by policy: editing the Claude Code permission/hook configuration files (.claude/settings*.json, .claude/hooks/*) is not allowed."
    }
}

if ($deny) {
    $result = @{
        hookSpecificOutput = @{
            hookEventName            = "PreToolUse"
            permissionDecision       = "deny"
            permissionDecisionReason = $deny
        }
    }
    $result | ConvertTo-Json -Depth 5 -Compress
}
