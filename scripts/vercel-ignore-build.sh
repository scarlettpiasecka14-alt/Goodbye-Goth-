#!/bin/bash
# V9.86: Vercel's "Ignored Build Step" - lets us push lots of small commits to Testing5
# without each one spending a Vercel deployment/storage slot. A build only actually runs
# when the commit being deployed has "[deploy]" somewhere in its message; every other
# push is skipped (still pushed to GitHub, just not built/deployed by Vercel).
#
# Exit code 1 = go ahead and build. Exit code 0 = skip this build.
if git log -1 --pretty=%B | grep -qi '\[deploy\]'; then
  echo "✅ [deploy] found in the latest commit message - building"
  exit 1
fi
echo "⏭️  No [deploy] tag in the latest commit message - skipping this build"
exit 0
