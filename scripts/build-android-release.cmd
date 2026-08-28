@echo off
setlocal

set "PROJECT_ROOT=%~dp0.."
set "GRADLE_USER_HOME=C:\gbarmej"

set "BUILD_DRIVE="
for %%D in (R Q P O N M) do if not defined BUILD_DRIVE if not exist %%D:\ set "BUILD_DRIVE=%%D:"

if not defined BUILD_DRIVE (
  echo ERROR: No free temporary drive was found between R: and M:.
  exit /b 1
)

echo Using temporary build drive %BUILD_DRIVE%

rem Remove generated files that may still contain a previous temporary drive path.
if exist "%PROJECT_ROOT%\android\build\generated\autolinking" rmdir /s /q "%PROJECT_ROOT%\android\build\generated\autolinking"
if exist "%PROJECT_ROOT%\android\app\build\generated\autolinking" rmdir /s /q "%PROJECT_ROOT%\android\app\build\generated\autolinking"
if exist "%PROJECT_ROOT%\android\app\.cxx\RelWithDebInfo" rmdir /s /q "%PROJECT_ROOT%\android\app\.cxx\RelWithDebInfo"

subst %BUILD_DRIVE% "%PROJECT_ROOT%"
if errorlevel 1 exit /b %errorlevel%

pushd %BUILD_DRIVE%\android
call gradlew.bat assembleRelease --no-daemon --max-workers=1
set "BUILD_EXIT=%errorlevel%"
popd

subst %BUILD_DRIVE% /d
exit /b %BUILD_EXIT%
