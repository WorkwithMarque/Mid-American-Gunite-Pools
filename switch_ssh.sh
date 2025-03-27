#!/bin/bash

if [ "$1" == "marque" ]; then
    git config core.sshCommand "ssh -i ~/.ssh/id_workwithmarque -o IdentitiesOnly=yes"
    echo "Switched to id_workwithmarque"
elif [ "$1" == "rsa" ]; then
    git config core.sshCommand "ssh -i ~/.ssh/id_rsa -o IdentitiesOnly=yes"
    echo "Switched to id_rsa"
else
    echo "Usage: ./switch_ssh.sh [marque|rsa]"
fi

# chmod +x ./switch_ssh.sh
# ./switch_ssh.sh // to use
# ./switch_ssh.sh marque  # Switch to id_workwithmarque
# ./switch_ssh.sh rsa     