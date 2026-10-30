# Google Analytics MCP for Cursor — KRIVA GA4 property 552202890
# If gcloud login shows "This app is blocked", use method 1 (service account).

$ErrorActionPreference = "Stop"

$GcloudCandidates = @(
  "$env:LOCALAPPDATA\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd",
  "$env:ProgramFiles\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd",
  "$env:ProgramFiles(x86)\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"
)
$Gcloud = $GcloudCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1

$RepoRoot = Split-Path $PSScriptRoot -Parent
$mcpPath = Join-Path $RepoRoot ".cursor\mcp.json"
$credDir = Join-Path $RepoRoot ".cursor\secrets"
$defaultKey = Join-Path $credDir "ga-mcp-service-account.json"

if (-not (Test-Path $mcpPath)) {
  Write-Host "Missing $mcpPath"
  exit 1
}

Write-Host ""
Write-Host "Choose auth method:"
Write-Host "  1 = Service account (recommended; avoids 'This app is blocked')"
Write-Host "  2 = Your own OAuth desktop client + gcloud ADC"
Write-Host "  3 = Default gcloud ADC (often blocked by Google)"
$method = Read-Host "Enter 1, 2, or 3"

$ProjectId = Read-Host "Google Cloud project ID (same project where APIs are enabled)"
if ([string]::IsNullOrWhiteSpace($ProjectId)) { exit 1 }

if (-not $Gcloud) {
  Write-Host "Install Google Cloud SDK: winget install Google.CloudSDK"
  exit 1
}

Write-Host "Enabling Analytics Admin + Data APIs on $ProjectId ..."
& $Gcloud services enable analyticsadmin.googleapis.com analyticsdata.googleapis.com --project=$ProjectId

$credPath = $null

switch ($method) {
  "1" {
    New-Item -ItemType Directory -Force -Path $credDir | Out-Null
    Write-Host ""
    Write-Host "=== Service account steps (Console) ==="
    Write-Host "1. https://console.cloud.google.com/iam-admin/serviceaccounts?project=$ProjectId"
    Write-Host "   Create service account (any name) -> Keys -> Add key -> JSON"
    Write-Host "2. Save the JSON as:"
    Write-Host "   $defaultKey"
    Write-Host "3. GA4 Admin -> Property access management -> Add user"
    Write-Host "   Email: SERVICE_ACCOUNT@$ProjectId.iam.gserviceaccount.com"
    Write-Host "   Role: Viewer"
    Write-Host ""
    Read-Host "Press Enter after the JSON file is saved and GA4 Viewer is granted"

    if (-not (Test-Path $defaultKey)) {
      $custom = Read-Host "Path to service account JSON (if not default location)"
      if (-not (Test-Path $custom)) {
        Write-Host "File not found: $custom"
        exit 1
      }
      $credPath = (Resolve-Path $custom).Path
    } else {
      $credPath = (Resolve-Path $defaultKey).Path
    }
  }
  "2" {
    $clientFile = Read-Host "Full path to OAuth Desktop client JSON from Cloud Console"
    if (-not (Test-Path $clientFile)) { exit 1 }
    Write-Host ""
    Write-Host "OAuth consent screen must be Testing with YOUR email as a test user."
    Write-Host "Opening browser for sign-in..."
    & $Gcloud auth application-default login `
      --client-id-file="$clientFile" `
      --scopes="https://www.googleapis.com/auth/analytics.readonly,https://www.googleapis.com/auth/cloud-platform"
    & $Gcloud auth application-default set-quota-project $ProjectId
    $credPath = "$env:APPDATA\gcloud\application_default_credentials.json"
  }
  "3" {
    Write-Host "Opening browser (may show 'This app is blocked')..."
    & $Gcloud auth application-default login `
      --scopes="https://www.googleapis.com/auth/analytics.readonly,https://www.googleapis.com/auth/cloud-platform"
    & $Gcloud auth application-default set-quota-project $ProjectId
    $credPath = "$env:APPDATA\gcloud\application_default_credentials.json"
  }
  default { Write-Host "Invalid choice"; exit 1 }
}

$json = Get-Content $mcpPath -Raw | ConvertFrom-Json
$json.mcpServers."google-analytics-mcp".env.GOOGLE_CLOUD_PROJECT = $ProjectId
$json.mcpServers."google-analytics-mcp".env.GOOGLE_APPLICATION_CREDENTIALS = $credPath
$json | ConvertTo-Json -Depth 10 | Set-Content $mcpPath -Encoding utf8

Write-Host ""
Write-Host "Updated $mcpPath"
Write-Host "GA4 property 552202890 | account 406452772"
Write-Host "Restart Cursor -> Settings -> MCP -> enable google-analytics-mcp"
