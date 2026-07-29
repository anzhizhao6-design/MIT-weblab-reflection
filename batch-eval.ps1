# batch-eval.ps1 — Run evaluation on all 3 workflow branches
param([int]$Port = 5173)

$branches = @(
  @{Name="workflow/superpowers"; Session="benchmark/runs/superpowers/superpowers-F1-F2-F3.jsonl"; Baseline="3502264"},
  @{Name="workflow/matt-skills"; Session="benchmark/runs/matt-skills/matt-skills-F1-F2-F3.jsonl"; Baseline="37c159d"},
  @{Name="workflow/agent-skills"; Session="benchmark/runs/agent-skills/agent-skills-F1-F2-F3.jsonl"; Baseline="37c159d"}
)

foreach ($b in $branches) {
  Write-Host "`n============================================" -ForegroundColor Cyan
  Write-Host "  Running: $($b.Name)" -ForegroundColor Cyan
  Write-Host "============================================"

  git checkout $b.Name
  git checkout feature/auto-eval -- eval/

  # Start dev server (kill any existing first)
  taskkill /f /im node.exe 2>$null
  Start-Process npm -ArgumentList "run","dev" -WorkingDirectory "workshop" -NoNewWindow
  Start-Sleep -Seconds 5

  # Run evaluation
  node eval/evaluate.js --port=$Port --session="./$($b.Session)" --baseline=$($b.Baseline) --no-judge

  Write-Host "  Done: $($b.Name)"
}

git checkout feature/auto-eval
Write-Host "`n=== All Done ===" -ForegroundColor Green
