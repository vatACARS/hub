@echo off
setlocal

:: Configurable App Name
set "APP_NAME=vatACARS-hub (development)"
set "LOG_FILE=%~dp0cleanup-log.txt"

:: Timestamp function
for /f "tokens=2 delims==" %%I in ('"wmic os get localdatetime /value"') do set datetime=%%I
set "year=%datetime:~0,4%"
set "month=%datetime:~4,2%"
set "day=%datetime:~6,2%"
set "hour=%datetime:~8,2%"
set "minute=%datetime:~10,2%"
set "second=%datetime:~12,2%"
set "timestamp=%year%-%month%-%day%_%hour%-%minute%-%second%"

:: Start logging
echo Cleanup started at %timestamp% > "%LOG_FILE%"

:: Kill Electron processes quietly
echo. >> "%LOG_FILE%"
echo Stopping Electron processes... >> "%LOG_FILE%"
for %%P in (electron.exe electron-builder.exe electron-updater.exe) do (
    taskkill /F /IM %%P >nul 2>&1
    if %errorlevel%==0 (
        echo Terminated %%P >> "%LOG_FILE%"
    ) else (
        echo No running %%P found >> "%LOG_FILE%"
    )
)

:: Delete Electron userData
echo. >> "%LOG_FILE%"
echo Deleting user data folder "%APPDATA%\%APP_NAME%" >> "%LOG_FILE%"
if exist "%APPDATA%\%APP_NAME%" (
    rmdir /S /Q "%APPDATA%\%APP_NAME%"
    echo User data folder deleted. >> "%LOG_FILE%"
) else (
    echo User data folder not found, skipping. >> "%LOG_FILE%"
)

:: Clear temp files (safe way)
echo. >> "%LOG_FILE%"
echo Cleaning temp files... >> "%LOG_FILE%"
for /d %%D in ("%TEMP%\*") do rmdir /S /Q "%%D" >nul 2>&1
del /F /Q "%TEMP%\*" >nul 2>&1
echo Temp files cleaned. >> "%LOG_FILE%"

:: End of script
echo. >> "%LOG_FILE%"
echo Cleanup finished at %timestamp% >> "%LOG_FILE%"

echo Cleanup complete. See cleanup-log.txt for details.
pause
exit /b
