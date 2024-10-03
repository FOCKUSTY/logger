@echo off

start build.typescript.bat
start build.files.bat

cd ../dist
npm publish --access=public

exit