@echo off
chcp 65001 >nul
title ZKE GAS デプロイ

rem ============================================================
rem  ZKE (Google Apps Script) 自動デプロイ バッチ
rem  Code.gs を clasp でアップロードし、既存のWebアプリ
rem  デプロイを新しいバージョンに更新します (URLは変わりません)。
rem  このバッチは Code.gs と同じフォルダに置いてください。
rem
rem  clasp のインストールと初回ログインは、このバッチが自動で
rem  行います (Node.js が入っていることが前提です)。
rem  手作業が残るのは次の2つだけです:
rem    1) 下の SCRIPT_ID に、ZKE プロジェクトの ID を貼る
rem       (プロジェクトを開いたときの URL の /projects/ と /edit の間)
rem    2) https://script.google.com/home/usersettings で
rem       「Google Apps Script API」をオンにする (初回のみ)
rem ============================================================

rem ---- 設定 ----
set "SCRIPT_ID=15bnmKpiaDL7wPP-aXgOXKJLuuKicLLsxuB2kqM8tydWLHZEf0paBA8Df"
set "DEPLOYMENT_ID=AKfycbwogV0XO0IQNhCfPoyPKmEwUKcC1Ed1obpgB47J_oF6-pOlsLhzZE85fHAJ_0fShlqM"

cd /d "%~dp0"

if "%SCRIPT_ID%"=="ここにSCRIPT_IDを貼り付け" (
  echo [未設定] バッチ冒頭の SCRIPT_ID に、ZKE プロジェクトの ID を貼ってください。
  echo プロジェクトの URL: https://script.google.com/home/projects/【この部分】/edit
  pause
  exit /b 1
)

if not exist "Code.gs" (
  echo [エラー] Code.gs がこのフォルダにありません。
  pause
  exit /b 1
)

rem ---- Node.js の確認 ----
where node >nul 2>nul
if errorlevel 1 (
  echo [エラー] Node.js が見つかりません。https://nodejs.org からインストールしてください。
  pause
  exit /b 1
)

rem ---- clasp が無ければ自動インストール ----
where clasp >nul 2>nul
if errorlevel 1 (
  echo clasp が入っていないので、インストールします (npm i -g @google/clasp)...
  call npm i -g @google/clasp
  where clasp >nul 2>nul
  if errorlevel 1 (
    echo [エラー] clasp のインストールに失敗しました。
    pause
    exit /b 1
  )
  echo clasp のインストールが完了しました。
)

rem ---- 未ログインなら初回ログイン (ブラウザが開きます) ----
if not exist "%USERPROFILE%\.clasprc.json" (
  echo 初回ログインを行います。ブラウザが開くので papagoukaku@gmail.com でログインしてください。
  call clasp login
  if errorlevel 1 (
    echo [エラー] ログインに失敗しました。もう一度実行してください。
    pause
    exit /b 1
  )
)

rem ---- 作業フォルダを用意し、現在のプロジェクトを取得 ----
if not exist "gas_work" mkdir "gas_work"
if not exist "gas_work\.clasp.json" (
  echo {"scriptId":"%SCRIPT_ID%"}> "gas_work\.clasp.json"
)

pushd "gas_work"
echo 現在のプロジェクトを取得します (clasp pull)...
call clasp pull
if errorlevel 1 (
  echo.
  echo [エラー] 取得に失敗しました。
  echo ・Apps Script API がオンになっているか確認してください:
  echo   https://script.google.com/home/usersettings
  echo ・ログインし直す場合は clasp logout のあと clasp login を実行してください。
  popd
  pause
  exit /b 1
)

rem ---- 最新の Code.gs に差し替え ----
copy /y "..\Code.gs" "Code.gs" >nul
for %%F in (*.gs) do if /i not "%%~nxF"=="Code.gs" del "%%F"

echo アップロードします (clasp push)...
call clasp push --force
if errorlevel 1 (
  echo [エラー] アップロードに失敗しました。
  popd
  pause
  exit /b 1
)

rem ---- 既存デプロイを新しいバージョンに更新 (URL不変) ----
echo デプロイを更新します (clasp deploy)...
call clasp deploy -i %DEPLOYMENT_ID% -d "auto deploy %date%"
if errorlevel 1 (
  echo [エラー] デプロイの更新に失敗しました。
  echo コードのアップロード自体は完了しています。
  popd
  pause
  exit /b 1
)
popd

echo.
echo ===== ZKE のデプロイが完了しました (WebアプリのURLは変わりません) =====
pause
