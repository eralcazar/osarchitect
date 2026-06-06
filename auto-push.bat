@echo off
cd /d "C:\Users\don_e\OneDrive\Documentos\proyecto\OSARCHITECT"
git config user.email "eralcazar@gmail.com"
git config user.name "Erik Alcazar"
git add -A
git commit -m "feat: autonomous deployment system with GitHub API"
git push origin main
pause
