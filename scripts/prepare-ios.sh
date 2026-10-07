#!/bin/sh
set -eu

if [ "$(uname -s)" != "Darwin" ]; then
  echo "La préparation CocoaPods nécessite macOS et Xcode." >&2
  exit 1
fi
cd "$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
xcodebuild -version
bundle install
# The historical lock predates the upgraded native modules. Resolve it once.
cd ios
bundle exec pod update --repo-update
echo "Pods mis à jour. Vérifiez et versionnez Podfile.lock et Gemfile.lock."
