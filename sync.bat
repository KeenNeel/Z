@echo off
title Z folder - GitHub sync

rem ============================================================
rem  Sync the Z folder with GitHub (KeenNeel/Z)
rem  1) If zenkanei_archive_github_*.zip is in this folder,
rem     extract it, move contents to the root, delete the ZIP.
rem  2) Sync with GitHub. On conflicts, THIS folder wins.
rem  Code.gs and deploy_gs.bat are never committed
rem  (Code.gs contains limited-access URLs and personal data).
rem ============================================================

set "REPO_URL=https://github.com/KeenNeel/Z.git"
set "GIT_NAME=KeenNeel"
set "GIT_EMAIL=papagoukaku@gmail.com"

cd /d "%~dp0"

rem ---------- Step 1: extract ZIP ----------
set "ZIPFOUND=0"
for %%Z in ("zenkanei_archive_github_*.zip") do (
  set "ZIPFOUND=1"
  echo Extracting: %%~nxZ
  if exist "_zip_tmp" rmdir /s /q "_zip_tmp"
  powershell -NoProfile -ExecutionPolicy Bypass -Command "Expand-Archive -LiteralPath '%%~fZ' -DestinationPath '_zip_tmp' -Force"
  if errorlevel 1 (
    echo [ERROR] Failed to extract the ZIP. The ZIP was kept.
    pause
    exit /b 1
  )
  if exist "_zip_tmp\github" (
    robocopy "_zip_tmp\github" "." /E /MOVE /NFL /NDL /NJH /NJS >nul
    if errorlevel 8 ( echo [ERROR] Failed to move github folder. & pause & exit /b 1 )
  )
  robocopy "_zip_tmp" "." /E /MOVE /NFL /NDL /NJH /NJS >nul
  if errorlevel 8 ( echo [ERROR] Failed to move extracted files. & pause & exit /b 1 )
  rmdir /s /q "_zip_tmp" 2>nul
  del /f /q "%%~fZ"
  echo Extracted. Contents are at the root; ZIP deleted.
)
if "%ZIPFOUND%"=="0" echo No ZIP found. Skipping step 1.

rem ---------- Step 2: sync with GitHub ----------
where git >nul 2>nul
if errorlevel 1 ( echo [ERROR] Git not found. Install Git for Windows. & pause & exit /b 1 )

if not exist ".git" (
  echo First-time setup...
  git init
  git remote add origin %REPO_URL%
)
git remote get-url origin >nul 2>nul || git remote add origin %REPO_URL%
git config --local core.quotepath false
git config --local core.autocrlf false
git config --local user.name >nul 2>nul || git config --local user.name "%GIT_NAME%"
git config --local user.email >nul 2>nul || git config --local user.email "%GIT_EMAIL%"

echo Fetching from GitHub...
git fetch origin
if errorlevel 1 ( echo [ERROR] Cannot reach GitHub. Check connection and login. & pause & exit /b 1 )

set "BRANCH=main"
git show-ref --verify --quiet refs/remotes/origin/main && set "BRANCH=main"
git show-ref --verify --quiet refs/remotes/origin/main || git show-ref --verify --quiet refs/remotes/origin/master && set "BRANCH=master"
git show-ref --verify --quiet refs/remotes/origin/%BRANCH% && set "REMOTE_EXISTS=1" || set "REMOTE_EXISTS=0"

git checkout -B %BRANCH% >nul 2>nul

if not exist ".gitignore" (
  echo Code.gs> .gitignore
  echo deploy_gs.bat>> .gitignore
  echo gas_work/>> .gitignore
  echo _zip_tmp/>> .gitignore
)
git rm --cached --ignore-unmatch Code.gs deploy_gs.bat >nul 2>nul

git add -A
git diff --cached --quiet || git commit -m "sync %date% %time%"

if "%REMOTE_EXISTS%"=="1" (
  git pull origin %BRANCH% --allow-unrelated-histories -X ours --no-edit
  if errorlevel 1 (
    echo [STOP] Merge stopped. Nothing was auto-resolved.
    pause
    exit /b 1
  )
  rem Make sure private files are not in the repo tree after the merge.
  git rm --cached --ignore-unmatch Code.gs deploy_gs.bat >nul 2>nul
  git add -A
  git diff --cached --quiet || git commit -m "keep private files out of repo"
)

git push -u origin %BRANCH%
if errorlevel 1 ( echo [ERROR] Push failed. A browser GitHub login may be needed the first time. & pause & exit /b 1 )

echo.
echo ===== Sync complete (branch: %BRANCH%) =====
pause
