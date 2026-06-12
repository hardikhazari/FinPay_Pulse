@echo off
echo Starting Node.js backend server and serving web app...
start http://localhost:3050/index.html
cd webapp
node server.js
