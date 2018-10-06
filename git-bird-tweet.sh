#!/bin/bash - 

read -p "git title: " git_title
read -p "Twitter message: " twitter_msg

git add .

git commit -m "$git_title" -m "$twitter_msg"
git remote | xargs -L1 git push --all
git push origin --tags
