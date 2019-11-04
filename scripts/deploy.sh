#!/usr/bin/env bash

set -e # exit with nonzero exit code if anything fails

# Git user info configs
git config --global user.email "iliadm@ca.ibm.com"
git config --global user.name "iliadm"

# Add github token to git credentials
git config credential.helper "store --file=.git/credentials"
echo "https://${GH_TOKEN}:@github.ibm.com" > .git/credentials 2>/dev/null

if [ -z "$TRAVIS_TAG" ]
then
	echo "The commit is not a tag, get lerna to version packages, and publish to Github."

	# checkout master to get out of detached HEAD state
	git checkout master

	lerna version --conventional-commits --yes --force-publish
else
	echo "The commit is a tag, publish to NPM!"

	# authenticate with the npm registry

	# AF_USER and AF_API_KEY are manually set on travis from info in artifactory
	curl -u${AF_USER}:${AF_API_KEY} "https://na.artifactory.swg-devops.com/artifactory/api/npm/wce-peretz-npm-local/auth/peretz" > ~/.npmrc

	yarn run build-all

	node scripts/clean-package-jsons.js

	lerna publish from-git --yes --force-publish --contents dist

	curl -d "{\"text\":\"sterling-charts published :partyperetz:\"}" https://hooks.slack.com/services/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
fi
