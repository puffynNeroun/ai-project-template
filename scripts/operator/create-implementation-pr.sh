#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib.sh"

usage() {
  echo "Usage: bash scripts/operator/create-implementation-pr.sh TASK_ID PR_TITLE [BRANCH_NAME]"
}

if [ "$#" -lt 2 ] || [ "$#" -gt 3 ]; then
  usage
  exit 2
fi

TASK_ID="$1"
PR_TITLE="$2"
BRANCH_NAME="${3:-$(git branch --show-current)}"

forge_require_base_commands
forge_cd_root

forge_info "Validate implementation PR preconditions"
forge_require_clean_tree
forge_require_task_status "$TASK_ID" "ready_for_pr"
forge_require_artifact_chain "$TASK_ID"
forge_run_verify_summary "/tmp/forge-operator-create-implementation-pr-verify.log"

forge_info "Push branch"
git push -u origin "$BRANCH_NAME"

forge_info "Create or reuse implementation PR"
BODY_FILE="/tmp/${TASK_ID}-implementation-pr-body.md"

cat > "$BODY_FILE" <<EOF_BODY
## Summary

Implementation PR for ${TASK_ID}.

This PR contains the task implementation and its Forge evidence chain.

## Verification

- pnpm -C tools/forge-validator verify

Final local verify:

- Forge contract validation passed

## Artifacts

- .forge/artifacts/${TASK_ID}/plan-001.md
- .forge/artifacts/${TASK_ID}/build-report-001.md
- .forge/artifacts/${TASK_ID}/test-report-001.md
- .forge/artifacts/${TASK_ID}/review-report-001.md
EOF_BODY

if gh pr view "$BRANCH_NAME" --json url --jq '.url' >/tmp/forge-existing-pr-url.txt 2>/dev/null; then
  PR_URL="$(cat /tmp/forge-existing-pr-url.txt)"
  echo "Existing PR found: $PR_URL"
else
  PR_URL="$(gh pr create \
    --base main \
    --head "$BRANCH_NAME" \
    --title "$PR_TITLE" \
    --body-file "$BODY_FILE")"
  echo "Created PR: $PR_URL"
fi

forge_info "PR summary"
gh pr view "$PR_URL" --json number,title,url,state,headRefName,baseRefName,isDraft --jq '
"PR #\(.number): \(.title)\nURL: \(.url)\nState: \(.state)\nDraft: \(.isDraft)\nHead: \(.headRefName)\nBase: \(.baseRefName)"
'

echo
echo "PR_URL=$PR_URL"
