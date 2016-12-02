#!/bin/sh

echo "Preparing to reboot server"

#call reboot script to reboot
node reboot.js

echo "Getting services back up"

#30 seconds delay to allow for server to back up
sleep 30

#playbook to run the application back
ansible-playbook -i inventory restartplaybook.yml
echo "Server rebooted"
