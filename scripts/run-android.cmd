@echo off
setlocal

rem Gradle home court : le chemin du cache dans le projet depasse la limite
rem Windows de 260 caracteres pendant la compilation C++ (ninja).
set "GRADLE_USER_HOME=%USERPROFILE%\.gradle-barmej"
set "ANDROID_USER_HOME=%USERPROFILE%\.android"
set "JAVA_TOOL_OPTIONS=-Duser.home=%USERPROFILE%"
set "ANDROID_SDK_HOME="

call npx.cmd react-native run-android --no-packager --active-arch-only %*
exit /b %errorlevel%
