========================================
  TERMINAL PORTFOLIO - PROJECT README
========================================

PROJECT NAME: Terminal Portfolio
TEAM MEMBERS: Prayatna Sapkota, Shubham Pradhananga, Dixit Neupane
SCHOOL PROJECT - 2025

----------------------------------------
WHAT IS THIS PROJECT?
----------------------------------------

This is an interactive portfolio website that looks and works 
like a computer terminal (command line).

Users can:
- Type commands to learn about each team member
- Browse a fake file system (like real computers)
- Play mini games (guess number, rock paper scissors)
- Switch between dark and light mode
- Sign a guestbook (PHP backend)

----------------------------------------
FILES IN THIS PROJECT
----------------------------------------

index.php          - Main page (shows everything)
style.css          - All the styling (colors, layouts)
script.js          - JavaScript for terminal and interactions
save_guestbook.php - Saves guestbook messages to file

guestbook.txt      - Where messages are stored (auto-created)

----------------------------------------
HOW TO RUN THIS PROJECT
----------------------------------------

OPTION 1: Free PHP Hosting (Recommended)
1. Go to infinityfree.net or 000webhost.com
2. Create a free account
3. Upload all files using their File Manager
4. Your site will be live!

OPTION 2: Local Testing
1. Install XAMPP (free)
2. Copy all files to C:\xampp\htdocs\portfolio\
3. Start Apache in XAMPP Control Panel
4. Open browser and go to: localhost/portfolio/

----------------------------------------
TECHNOLOGIES USED
----------------------------------------

FRONTEND (What users see):
- HTML - Structure of the page
- CSS - Styling and colors
- JavaScript - Interactive terminal

BACKEND (Server side):
- PHP - Saves guestbook messages
- Text file - Stores messages (no database needed!)

----------------------------------------
HOW THE TERMINAL WORKS
----------------------------------------

1. User types a command (like "help")
2. JavaScript captures the input
3. JavaScript checks which command was typed
4. JavaScript shows the appropriate response

It's like a big "if-else" statement:
  if (command == "help") showHelp();
  if (command == "about") showAbout();
  etc.

----------------------------------------
HOW THE GUESTBOOK WORKS
----------------------------------------

1. User fills the form and clicks "Sign Guestbook"
2. Form sends data to save_guestbook.php
3. PHP saves the message to guestbook.txt
4. When page loads, PHP reads the file and shows messages

No database needed - just a simple text file!

----------------------------------------
COMMANDS IN THE TERMINAL
----------------------------------------

help      - Show all commands
about     - Show member info
skills    - Show skills with progress bars
projects  - List projects
contact   - Contact information
weather   - Fake weather report
time      - Show current time
ls        - List files
cd        - Change directory
cat       - View file contents
game      - Play games
hack      - Fake hacking animation
joke      - Random joke
neofetch  - System info
clear     - Clear terminal screen

----------------------------------------
TEAM ROLES
----------------------------------------

Prayatna Sapkota:
- Frontend Developer
- Designed the UI/UX
- HTML and CSS

Shubham Pradhananga:
- Backend Developer  
- PHP guestbook system
- Database logic

Dixit Neupane:
- QA & Testing
- Found and fixed bugs
- JavaScript testing

----------------------------------------
