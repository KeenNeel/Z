@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo === 1. GitHubから最新を取得 ===
git pull origin main --rebase
if errorlevel 1 goto :error
echo === 2. ローカルの変更を記録 ===
git add .
git diff --cached --quiet
if errorlevel 1 (
git commit -m "sync %date% %time%"
) else (
echo 変更なし
)
echo === 3. GitHubへ送信 ===
git push origin main
if errorlevel 1 goto :error
echo === 同期完了 ===
pause
exit /b 0
:error
echo エラーで止まりました。画面の表示を確認してください。
pause