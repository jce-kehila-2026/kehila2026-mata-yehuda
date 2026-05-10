#!/bin/bash

# Get Mac username
User=$(whoami)

# Output file name
OutputFile="fullstack-install-$User.txt"

# Start report
echo "Fullstack Installation Verification Report" > $OutputFile
echo "Generated on: $(date)" >> $OutputFile
echo "Username: $User" >> $OutputFile
echo "-----------------------------------------" >> $OutputFile

# Node version
echo "Node Version:" >> $OutputFile
node -v >> $OutputFile 2>&1
echo "" >> $OutputFile

# npm version
echo "npm Version:" >> $OutputFile
npm -v >> $OutputFile 2>&1
echo "" >> $OutputFile

# Git version
echo "Git Version:" >> $OutputFile
git --version >> $OutputFile 2>&1
echo "" >> $OutputFile

# Check for package.json
echo "package.json Present:" >> $OutputFile
if [ -f "./package.json" ]; then
  echo "true" >> $OutputFile
else
  echo "false" >> $OutputFile
fi
echo "" >> $OutputFile

# Installed npm packages
echo "Installed npm Packages:" >> $OutputFile
npm list --depth=0 >> $OutputFile 2>&1
echo "" >> $OutputFile

# React
echo "React Installed:" >> $OutputFile
npm list react >> $OutputFile 2>&1
echo "" >> $OutputFile

# Vite
echo "Vite Installed:" >> $OutputFile
npm list vite >> $OutputFile 2>&1
echo "" >> $OutputFile

# Firebase
echo "Firebase Installed:" >> $OutputFile
npm list firebase >> $OutputFile 2>&1
echo "" >> $OutputFile

# Final message
echo "-----------------------------------------" >> $OutputFile
echo "Verification complete. Submit the file:" >> $OutputFile
echo "$OutputFile" >> $OutputFile
echo "-----------------------------------------" >> $OutputFile

echo "Done! Your report has been created: $OutputFile"