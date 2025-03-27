#!/bin/bash

# Define remotes
REMOTE=$1  # First argument (origin, upstream, or both)
BRANCH=$2  # Second argument (optional: branch to push, defaults to 'main')

# Validate input
if [[ -z "$REMOTE" ]]; then
    echo "Usage: $0 [origin|upstream|both] [branch]"
    exit 1
fi

# Perform push based on the argument
case "$REMOTE" in
    origin)
        ./switch_ssh.sh rsa
        git push origin ${BRANCH:-main}
        ;;
    upstream)
        ./switch_ssh.sh marque
        git push upstream ${BRANCH:-main}
        ;;
    both)
        ./switch_ssh.sh rsa
        git push origin ${BRANCH:-main}
        
        ./switch_ssh.sh marque
        git push upstream ${BRANCH:-main}
        ;;
    *)
        echo "Invalid remote. Use 'origin', 'upstream', or 'both'."
        exit 1
        ;;
esac

# Restore default SSH key (id_rsa) after push
./switch_ssh.sh rsa

echo "Push complete!"

# ./git_push.sh origin
# ./git_push.sh upstream
