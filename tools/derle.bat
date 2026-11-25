@echo off
rem Siteyi yeniden uretir (tr/, en/, sitemap.xml, robots.txt, llms.txt). Cift tiklayin.
cd /d "%~dp0.."
py tools\build.py
echo.
pause
