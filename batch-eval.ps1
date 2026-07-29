# batch-eval.ps1 — Run evaluation on all 3 workflow branches
# Usage: .\batch-eval.ps1

$branches = @(
  @{Name="workflow/superpowers"; Session="benchmark/runs/superpowers/superpowers-F1-F2-F3.jsonl"; Baseline="3502264"},
  @{Name="workflow/matt-skills"; Session="benchmark/runs/matt-skills/matt-skills-F1-F2-F3.jsonl"; Baseline="37c159d"},
  @{Name="workflow/agent-skills"; Session="benchmark/runs/agent-skills/agent-skills-F1-F2.jsonl"; Baseline="37c159d"}
)

foreach ($b in $branches) {
  Write-Host "`n============================================" -ForegroundColor Cyan
  Write-Host "  $($b.Name)" -ForegroundColor Cyan
  Write-Host "============================================"

  git checkout -- . 2>$null
  git checkout $b.Name
  Remove-Item -Recurse -Force eval -ErrorAction SilentlyContinue
  git checkout feature/auto-eval -- eval/

  taskkill /f /im node.exe 2>$null
  Start-Sleep -Seconds 2

  Start-Process cmd -ArgumentList "/c", "cd workshop && npm run dev" -WindowStyle Minimized
  Start-Sleep -Seconds 6

  node eval/evaluate.js --workflow=$($b.Name.Split('/')[1]) --no-judge
  Write-Host "  Done: $($b.Name)" -ForegroundColor Green
}

taskkill /f /im node.exe 2>$null
git checkout feature/auto-eval
Write-Host "`n=== All Done ===" -ForegroundColor Green
