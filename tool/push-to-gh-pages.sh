#!/bin/bash

git config --global user.email "travis@travis-ci.org"
git config --global user.name "travis-ci"

cd build
git clone --quiet https://github.com/scheakur/fx-addon-traccounter.git
cd fx-addon-traccounter
git checkout -b gh-pages origin/gh-pages
cp ../../*.xpi ./
git add -A
git commit -m 'Update package by Travis CI'
git push --quiet https://$GH_TOKEN@github.com/scheakur/fx-addon-traccounter.git gh-pages 2> /dev/null
