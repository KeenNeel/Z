@echo off
chcp 65001 >nul
title Zフォルダ GitHub同期

rem ============================================================
rem  Zフォルダ ⇄ GitHub (KeenNeel/Z) 同期バッチ
rem  使い方: このファイルをデスクトップの Z フォルダに置いて
rem          ダブルクリックするだけです。
rem    1) フォルダ内の zenkanei_archive_github_*.zip があれば
rem       展開し、中身をフォルダのルートに置いて
rem       ZIP と展開用フォルダを削除します
rem    2) GitHub と同期します (取り込み → 記録 → 送信)
rem ============================================================

rem ---- 設定 (必要ならここだけ書き換えてください) ----
set "REPO_URL=https://github.com/KeenNeel/Z.git"
set "GIT_NAME=KeenNeel"
set "GIT_EMAIL=papagoukaku@gmail.com"

cd /d "%~dp0"

rem ============================================================
rem  手順1: ZIP の展開とルートへの配置
rem ============================================================
set "ZIPFOUND=0"
for %%Z in ("zenkanei_archive_github_*.zip") do (
  set "ZIPFOUND=1"
  echo ZIP を展開します: %%~nxZ
  if exist "_zip_tmp" rmdir /s /q "_zip_tmp"
  powershell -NoProfile -ExecutionPolicy Bypass -Command "Expand-Archive -LiteralPath '%%~fZ' -DestinationPath '_zip_tmp' -Force"
  if errorlevel 1 (
    echo [エラー] ZIP の展開に失敗しました: %%~nxZ
    echo ZIP は残してあります。ファイルを確認してください。
    pause
    exit /b 1
  )
  rem github フォルダの中身をルートへ
  if exist "_zip_tmp\github" (
    robocopy "_zip_tmp\github" "." /E /MOVE /NFL /NDL /NJH /NJS >nul
    if errorlevel 8 (
      echo [エラー] github フォルダの移動に失敗しました。
      pause
      exit /b 1
    )
  )
  rem ZIP 直下のファイル (別巻など) をルートへ
  robocopy "_zip_tmp" "." /E /MOVE /NFL /NDL /NJH /NJS >nul
  if errorlevel 8 (
    echo [エラー] 展開ファイルの移動に失敗しました。
    pause
    exit /b 1
  )
  rmdir /s /q "_zip_tmp" 2>nul
  del /f /q "%%~fZ"
  echo 展開完了: 中身をルートに置き、ZIP と展開フォルダを削除しました。
)
if "%ZIPFOUND%"=="0" echo ZIP は無いので、手順1を飛ばします。

rem ============================================================
rem  手順2: GitHub と同期
rem ============================================================
where git >nul 2>nul
if errorlevel 1 (
  echo [エラー] Git が見つかりません。Git for Windows をインストールしてください。
  pause
  exit /b 1
)

if not exist ".git" (
  echo 初回セットアップを行います...
  git init
  git remote add origin %REPO_URL%
)
git remote get-url origin >nul 2>nul || git remote add origin %REPO_URL%
git config --local core.quotepath false
git config --local core.autocrlf false
git config --local user.name >nul 2>nul || git config --local user.name "%GIT_NAME%"
git config --local user.email >nul 2>nul || git config --local user.email "%GIT_EMAIL%"

echo GitHub から最新情報を取得します...
git fetch origin
if errorlevel 1 (
  echo [エラー] GitHub に接続できませんでした。ネット接続とログインを確認してください。
  pause
  exit /b 1
)

set "BRANCH=main"
git show-ref --verify --quiet refs/remotes/origin/main && set "BRANCH=main"
git show-ref --verify --quiet refs/remotes/origin/main || git show-ref --verify --quiet refs/remotes/origin/master && set "BRANCH=master"
git show-ref --verify --quiet refs/remotes/origin/%BRANCH% && set "REMOTE_EXISTS=1" || set "REMOTE_EXISTS=0"

git checkout -B %BRANCH% >nul 2>nul

git add -A
git diff --cached --quiet || git commit -m "sync %date% %time%"

if "%REMOTE_EXISTS%"=="1" (
  git pull origin %BRANCH% --allow-unrelated-histories --no-edit
  if errorlevel 1 (
    echo.
    echo [停止] 取り込みで競合が発生しました。自動では解決していません。
    echo ファイルを確認してから、もう一度実行してください。
    pause
    exit /b 1
  )
)

git push -u origin %BRANCH%
if errorlevel 1 (
  echo.
  echo [エラー] 送信に失敗しました。初回はブラウザで GitHub ログインを求められることがあります。
  pause
  exit /b 1
)

echo.
echo ===== 同期が完了しました (ブランチ: %BRANCH%) =====
pause
