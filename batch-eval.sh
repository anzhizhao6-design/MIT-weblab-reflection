#!/bin/bash
# batch-eval.sh — Run spec checkers + parsers against all 3 workflow branches
# Usage: bash batch-eval.sh [--port=5173]

PORT=${1#--port=}
PORT=${PORT:-5173}

BRANCHES=(
  "workflow/superpowers|benchmark/runs/superpowers/superpowers-F1-F2-F3.jsonl"
  "workflow/matt-skills|benchmark/runs/matt-skills/matt-skills-F1-F2-F3.jsonl"
  "workflow/agent-skills|benchmark/runs/agent-skills/agent-skills-F1-F2-F3.jsonl"
)

for entry in "${BRANCHES[@]}"; do
  BRANCH="${entry%%|*}"
  SESSION="${entry##*|}"

  echo ""
  echo "============================================"
  echo "  Running: $BRANCH"
  echo "============================================"

  git checkout "$BRANCH"
  git checkout feature/auto-eval -- eval/

  # Start dev server in background
  npm run dev -- --port "$PORT" 2>/dev/null &
  DEV_PID=$!
  sleep 3  # wait for server to start

  # Run evaluation
  node eval/evaluate.js --port="$PORT" --session="./$SESSION" --no-judge

  # Stop dev server
  kill $DEV_PID 2>/dev/null
  sleep 1

  echo "  Done: $BRANCH"
done

echo ""
echo "============================================"
echo "  Results saved to eval/output/results.csv"
echo "============================================"

git checkout feature/auto-eval
