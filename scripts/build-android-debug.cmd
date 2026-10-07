@echo off
setlocal

set "ANDROID_USER_HOME=%USERPROFILE%\.android"
set "GRADLE_USER_HOME=%USERPROFILE%\.gradle-barmej"
set "JAVA_TOOL_OPTIONS=-Duser.home=%USERPROFILE%"
set "ANDROID_SDK_HOME="

pushd "%~dp0..\android"
call gradlew.bat assembleDebug --no-daemon --no-configuration-cache --max-workers=2
set "BUILD_EXIT=%errorlevel%"
popd

exit /b %BUILD_EXIT%
