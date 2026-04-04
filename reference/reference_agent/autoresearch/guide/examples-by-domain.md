# Examples by Domain — Real-World Configurations

Copy-paste configurations organized by domain. Every example includes the command, config, and what Claude does. All verification commands are real — paste them into your project and adjust paths as needed.

[Software Engineering](#software-engineering-typescriptjavascript) · [Python & Django](#python--django) · [Go](#go) · [Rust](#rust) · [Sales & Lead Generation](#sales--lead-generation) · [SEO & Content Marketing](#seo--content-marketing) · [Marketing & Growth](#marketing--growth) · [Web Scraping & Data Collection](#web-scraping--data-collection) · [Research & Analysis](#research--analysis) · [DevOps & Infrastructure](#devops--infrastructure) · [Data Science & ML](#data-science--ml) · [Design & Accessibility](#design--accessibility) · [HR & People Operations](#hr--people-operations) · [Operations](#operations) · [Documentation & Knowledge Management](#documentation--knowledge-management) · [MCP Servers](#combining-with-mcp-servers) · [CI/CD Integration](#cicd-integration) · [Verification Scripts](#custom-verification-scripts)

---

## Software Engineering (TypeScript/JavaScript)

### Increase test coverage

```
/autoresearch
Goal: Increase test coverage from 72% to 90%
Scope: src/**/*.test.ts, src/**/*.ts
Metric: coverage % (higher is better)
Verify: npm test -- --coverage | grep "All files"
```

Bounded variant — run exactly 20 iterations then stop:

```
/autoresearch
Iterations: 20
Goal: Increase test coverage from 72% to 90%
Scope: src/**/*.test.ts, src/**/*.ts
Metric: coverage % (higher is better)
Verify: npm test -- --coverage | grep "All files"
```

Claude adds tests one-by-one. Each iteration: write test → run coverage → keep if % increased → discard if not → repeat.

### Reduce bundle size

```
/autoresearch
Iterations: 15
Goal: Reduce production bundle size
Scope: src/**/*.tsx, src/**/*.ts
Metric: bundle size in KB (lower is better)
Verify: npm run build 2>&1 | grep "First Load JS"
```

Claude tries: tree-shaking unused imports, lazy-loading routes, replacing heavy libraries, code-splitting — one change at a time. 15 iterations is usually enough to find the big wins.

### Fix flaky tests

```
/autoresearch
Iterations: 10
Goal: Zero flaky tests (all tests pass 5 consecutive runs)
Scope: src/**/*.test.ts
Metric: failure count across 5 runs (lower is better)
Verify: for i in {1..5}; do npm test 2>&1; done | grep -c "FAIL"
```

### API performance optimization

```
/autoresearch
Goal: API response time under 100ms (p95)
Scope: src/api/**/*.ts, src/services/**/*.ts
Metric: p95 response time in ms (lower is better)
Verify: npm run bench:api | grep "p95"
Guard: npm test
```

Quick 30-minute sprint variant:

```
/autoresearch
Iterations: 10
Goal: API response time under 100ms (p95)
Scope: src/api/**/*.ts, src/services/**/*.ts
Metric: p95 response time in ms (lower is better)
Verify: npm run bench:api | grep "p95"
```

### Eliminate TypeScript `any` types

```
/autoresearch
Iterations: 25
Goal: Eliminate all TypeScript `any` types
Scope: src/**/*.ts
Metric: count of `any` occurrences (lower is better)
Verify: grep -r ":\s*any" src/ --include="*.ts" | wc -l
```

### Reduce lines of code (refactoring)

```
/autoresearch
Iterations: 20
Goal: Reduce lines of code in src/services/ by 30% while keeping all tests green
Metric: LOC count (lower is better)
Verify: npm test && find src/services -name "*.ts" | xargs wc -l | tail -1
```

### Lighthouse performance score

```
/autoresearch
Goal: Lighthouse performance score 95+
Scope: src/components/**/*.tsx, src/app/**/*.tsx
Metric: Lighthouse performance score (higher is better)
Verify: npx lighthouse http://localhost:3000 --output=json --quiet | jq '.categories.performance.score * 100'
Guard: npx playwright test
```

---

## Python & Django

### Increase pytest coverage

```
/autoresearch
Iterations: 30
Goal: Increase pytest coverage from 68% to 90%
Scope: tests/**/*.py, app/**/*.py
Metric: coverage % (higher is better)
Verify: pytest --cov=app --cov-report=term-missing 2>&1 | grep "TOTAL" | awk '{print $4}'
```

### Reduce Django N+1 queries

```
/autoresearch
Iterations: 15
Goal: Eliminate N+1 queries — reduce total DB queries per request
Scope: app/views/**/*.py, app/models/**/*.py
Metric: total query count per request (lower is better)
Verify: python manage.py test --settings=settings.test 2>&1 | grep "queries" | awk '{print $1}'
Guard: pytest
```

### Fix mypy strict errors

```
/autoresearch:fix --target "mypy app/ --strict"
Guard: pytest
Iterations: 25
```

### FastAPI response time

```
/autoresearch
Iterations: 20
Goal: Reduce p95 response time to under 50ms
Scope: app/routers/**/*.py, app/services/**/*.py
Metric: p95 response time in ms (lower is better)
Verify: python scripts/bench_api.py | grep "p95"
Guard: pytest
```

### Flask security audit

```
/autoresearch:security
Scope: app/**/*.py, config/**/*.py
Focus: SQL injection, CSRF, session management, secret handling
Iterations: 15
```

---

## Go

### Increase test coverage

```
/autoresearch
Iterations: 25
Goal: Increase test coverage to 85%
Scope: **/*.go
Metric: coverage % (higher is better)
Verify: go test ./... -coverprofile=cover.out && go tool cover -func=cover.out | grep "total:" | awk '{print $3}'
```

### Reduce binary size

```
/autoresearch
Iterations: 10
Goal: Reduce compiled binary size
Scope: cmd/**/*.go, internal/**/*.go
Metric: binary size in MB (lower is better)
Verify: go build -o /tmp/bench ./cmd/server && ls -la /tmp/bench | awk '{print $5/1048576}'
Guard: go test ./...
```

### Fix go vet + staticcheck errors

```
/autoresearch:fix --target "go vet ./... && staticcheck ./..."
Guard: go test ./...
Iterations: 15
```

### Benchmark optimization

```
/autoresearch
Iterations: 20
Goal: Improve hot-path benchmark by 2x
Scope: internal/parser/**/*.go
Metric: ns/op from benchmark (lower is better)
Verify: go test -bench=BenchmarkParse -benchmem ./internal/parser/ | grep "BenchmarkParse" | awk '{print $3}'
Guard: go test ./...
```

---

## Rust

### Increase test coverage

```
/autoresearch
Iterations: 20
Goal: Increase test coverage to 80%
Scope: src/**/*.rs
Metric: coverage % (higher is better)
Verify: cargo tarpaulin --out Stdout 2>&1 | grep "coverage" | awk '{print $2}'
```

### Reduce compile time

```
/autoresearch
Iterations: 15
Goal: Reduce incremental compile time
Scope: src/**/*.rs, Cargo.toml
Metric: compile time in seconds (lower is better)
Verify: cargo build --timings 2>&1 | grep "Finished" | awk '{print $2}'
Guard: cargo test
```

### Fix clippy warnings

```
/autoresearch:fix --target "cargo clippy -- -D warnings"
Guard: cargo test
Iterations: 20
```

### Criterion benchmark optimization

```
/autoresearch
Iterations: 25
Goal: Reduce p95 request handling time
Scope: src/handlers/**/*.rs
Metric: ns/iter from criterion (lower is better)
Verify: cargo bench -- --output-format bencher 2>&1 | grep "bench:" | awk '{print $5}'
Guard: cargo test
```

---

## Sales & Lead Generation

### Cold email optimization

```
/autoresearch
Iterations: 15
Goal: Improve cold email reply rate prediction score
Scope: content/email-templates/*.md
Metric: readability score + personalization token count (higher is better)
Verify: node scripts/score-email-template.js
```

Claude iterates on subject lines, opening hooks, CTAs, personalization variables — keeping changes that score higher.

### Sales deck refinement

```
/autoresearch
Iterations: 10
Goal: Reduce slide count while maintaining all key points
Scope: content/sales-deck/*.md
Metric: slide count (lower is better), constraint: key-points-checklist.md must all be present
Verify: node scripts/check-deck-coverage.js && wc -l content/sales-deck/*.md
```

### Objection handling docs

```
/autoresearch
Iterations: 20
Goal: Cover all 20 common objections with responses under 50 words each
Scope: content/objection-responses.md
Metric: objections covered + avg word count per response (more covered + fewer words = better)
Verify: node scripts/score-objections.js
```

### Lead magnet optimization

```
/autoresearch
Iterations: 20
Goal: Improve lead magnet download page conversion score
Scope: content/lead-magnets/**/*.md, content/landing-pages/lead-magnet.md
Metric: conversion checklist score (higher is better)
Verify: node scripts/lead-magnet-score.js
```

Claude iterates on headline, value proposition, form fields, social proof, urgency elements — one change per iteration.

### LinkedIn outreach sequences

```
/autoresearch
Iterations: 25
Goal: Improve LinkedIn outreach sequence — personalization, hook quality, CTA clarity
Scope: content/outreach/linkedin-sequence/*.md
Metric: sequence quality score (higher is better)
Verify: node scripts/outreach-scorer.js --platform linkedin
```

### Lead scoring model refinement

```
/autoresearch
Iterations: 15
Goal: Improve lead scoring accuracy — reduce false positive rate
Scope: scripts/lead-scoring/*.py
Metric: false positive rate (lower is better)
Verify: python scripts/evaluate-lead-scoring.py | grep "false_positive_rate"
Guard: python -m pytest tests/scoring/
```

### Ship a sales proposal

```
/autoresearch:ship --type sales
Target: proposals/enterprise-q1.md
```

Checklist: prospect name correct, pricing current, CTA clear, case studies current, branding consistent.

### Generate sales scenarios

```
/autoresearch:scenario --domain business --depth deep
Scenario: Enterprise customer evaluates our SaaS during procurement with 5 stakeholders
Iterations: 30
```

---

## SEO & Content Marketing

### Blog SEO score optimization

```
/autoresearch
Goal: Maximize SEO score for target keywords
Scope: content/blog/*.md
Metric: SEO score from audit tool (higher is better)
Verify: node scripts/seo-score.js --file content/blog/target-post.md
```

Claude tweaks headings, keyword density, meta descriptions, internal links — one change per iteration. Run unlimited overnight, or bounded:

```
/autoresearch
Iterations: 25
Goal: Maximize SEO score for target keywords
Scope: content/blog/*.md
Metric: SEO score from audit tool (higher is better)
Verify: node scripts/seo-score.js --file content/blog/target-post.md
```

### Content depth score

```
/autoresearch
Iterations: 15
Goal: Maximize Flesch readability + keyword density for "AI automation"
Scope: content/landing-pages/ai-automation.md
Metric: readability_score * 0.7 + keyword_density_score * 0.3 (higher is better)
Verify: node scripts/content-score.js content/landing-pages/ai-automation.md
```

### Meta descriptions batch

```
/autoresearch
Iterations: 20
Goal: Ensure all blog posts have meta descriptions under 160 chars with target keyword
Scope: content/blog/*.md
Metric: posts meeting criteria (higher is better)
Verify: node scripts/meta-description-audit.js
```

### Ship blog content

```
/autoresearch:ship
Target: content/blog/my-new-post.md
Type: content
```

### Content scenarios

```
/autoresearch:scenario --domain product --format use-cases --depth deep
Scenario: Researcher evaluates autonomous iteration techniques across ML, DevOps, and content
Iterations: 30
```

---

## Marketing & Growth

### Email campaign click rate

```
/autoresearch
Iterations: 20
Goal: Optimize 7-day nurture sequence for clarity and CTA strength
Scope: content/email-sequences/onboarding/*.md
Metric: avg readability + CTA score per email (higher is better)
Verify: node scripts/score-email-sequence.js onboarding
```

### Landing page conversion optimization

```
/autoresearch
Iterations: 15
Goal: Maximize landing page quality score — clear CTA, social proof, urgency, mobile-friendly
Scope: content/landing-pages/product-launch.md
Metric: CRO checklist score (higher is better)
Verify: node scripts/cro-score.js content/landing-pages/product-launch.md
```

### Ad copy variants

```
/autoresearch
Iterations: 25
Goal: Generate and refine 20 ad copy variants, each under 90 chars with power words
Scope: content/ads/facebook-q1.md
Metric: variants meeting criteria (higher is better)
Verify: node scripts/validate-ad-copy.js
```

### Google Ads headlines

```
/autoresearch
Iterations: 30
Goal: Generate 50 ad headline variants (max 30 chars) with power words + CTA
Scope: content/ads/google-search/*.md
Metric: headlines meeting char limit + power word + CTA criteria (higher is better)
Verify: node scripts/google-ads-validator.js --type headlines
```

### Ship email campaign

```
/autoresearch:ship
Target: content/emails/product-launch-campaign.md
Type: content
```

### Ship campaign assets

```
/autoresearch:ship --type sales
Target: content/campaigns/q1-growth-push/
```

---

## Web Scraping & Data Collection

### Improve scraper success rate

```
/autoresearch
Iterations: 25
Goal: Increase scraper success rate from 85% to 99%
Scope: scrapers/**/*.py
Metric: success rate % (higher is better)
Verify: python scripts/scraper-test.py --sample 100 | grep "success_rate"
Guard: python -m pytest tests/scrapers/
```

Claude iterates on retry logic, selector resilience, timeout handling, rate limiting — one improvement per iteration.

### Reduce scraping time per page

```
/autoresearch
Iterations: 20
Goal: Reduce average scrape time from 3s to under 1s per page
Scope: scrapers/**/*.py
Metric: avg time per page in seconds (lower is better)
Verify: python scripts/scraper-bench.py | grep "avg_time"
Guard: python -m pytest tests/scrapers/
```

### Debug scraper failures

```
/autoresearch:debug
Scope: scrapers/**/*.py
Symptom: Scraper fails on paginated results after page 5 with 403 errors
Iterations: 10
```

### Scraping edge cases exploration

```
/autoresearch:scenario --domain software --focus edge-cases
Scenario: Web scraper encounters anti-bot measures, dynamic content, and rate limiting
Iterations: 25
```

Explores: CAPTCHAs, IP blocking, JavaScript rendering, infinite scroll, login walls, A/B test variants, geo-blocking, cookie consent popups.

### Improve data extraction accuracy

```
/autoresearch
Iterations: 20
Goal: Increase structured data extraction accuracy to 98%
Scope: scrapers/extractors/**/*.py
Metric: extraction accuracy % (higher is better)
Verify: python scripts/extraction-accuracy.py --ground-truth fixtures/expected.json | grep "accuracy"
Guard: python -m pytest tests/extractors/
```

---

## Research & Analysis

### Research paper readability

```
/autoresearch
Iterations: 20
Goal: Improve research paper Flesch readability score to 60+
Scope: papers/draft/**/*.md
Metric: Flesch readability score (higher is better)
Verify: python scripts/readability.py papers/draft/ | grep "flesch_score"
```

### Ship a research paper

```
/autoresearch:ship --type research
Target: papers/final/autonomous-iteration-patterns.pdf
```

Checklist: abstract present, citations formatted, data sources linked, methodology complete, figures labeled, conclusion addresses hypothesis, acknowledgments included.

### Literature review structure (PRISMA)

```
/autoresearch
Iterations: 15
Goal: Ensure all literature review sections follow PRISMA checklist
Scope: papers/lit-review/**/*.md
Metric: PRISMA checklist compliance % (higher is better)
Verify: python scripts/prisma-check.py | grep "compliance"
```

### Data analysis report quality

```
/autoresearch
Iterations: 20
Goal: Ensure all analysis reports have methodology, data sources, visualizations, and conclusions
Scope: reports/analysis/**/*.md
Metric: report completeness score (higher is better)
Verify: python scripts/report-audit.py | grep "completeness"
```

### Research scenario exploration

```
/autoresearch:scenario --domain product --format use-cases --depth deep
Scenario: Researcher evaluates autonomous iteration techniques across ML, DevOps, and content
Iterations: 30
```

---

## DevOps & Infrastructure

### Reduce Docker image size

```
/autoresearch
Iterations: 10
Goal: Reduce Docker image size and build time
Scope: Dockerfile, .dockerignore
Metric: image size in MB (lower is better)
Verify: docker build -t bench . 2>&1 && docker images bench --format "{{.Size}}"
```

### Optimize Docker build time

```
/autoresearch
Goal: Reduce Docker build time from 180s to under 60s
Scope: Dockerfile, .dockerignore
Verify: docker build --no-cache . 2>&1 | tail -1 | grep -oP '[\d.]+'
Iterations: 10
```

Claude targets one optimization per iteration: layer ordering, multi-stage builds, .dockerignore rules, apt-get cleanup, build argument caching.

### Kubernetes deployment optimization

```
/autoresearch
Goal: Reduce pod startup time from 45s to under 15s
Scope: k8s/deployment.yaml, k8s/service.yaml, k8s/configmap.yaml
Verify: kubectl rollout status deployment/app --timeout=60s 2>&1 | grep -oP '\d+(?=s)'
Guard: kubectl get pods | grep -c 'Running'
Iterations: 10
```

Changes spanning `deployment.yaml` + `service.yaml` + `configmap.yaml` are ONE atomic change when they serve the same purpose (e.g., "add resource limits" touches deployment + configmap).

### Optimize CI/CD pipeline duration

```
/autoresearch
Goal: Reduce CI/CD pipeline from 12 minutes to under 5 minutes
Scope: .github/workflows/*.yml, Dockerfile, docker-compose.yml
Verify: gh run list --limit 1 --json durationMs --jq '.[0].durationMs / 60000'
Guard: docker compose up -d && sleep 5 && curl -sf http://localhost:3000/health
Iterations: 15
```

Multi-file changes are common in DevOps. The rule: **same intent = one change**, even across files.

**Example iterations:**
```bash
# Iteration 1: Enable Docker layer caching (Dockerfile + CI workflow — ONE intent)
# Files: Dockerfile, .github/workflows/ci.yml
git add Dockerfile .github/workflows/ci.yml
git commit -m "experiment(ci): enable Docker layer caching in build step"
# Verify: pipeline time dropped from 12min → 9min ✓ KEEP

# Iteration 2: Parallelize test matrix (CI workflow only)
# Files: .github/workflows/ci.yml
git add .github/workflows/ci.yml
git commit -m "experiment(ci): split tests into 3 parallel matrix jobs"
# Verify: 9min → 6min ✓ KEEP

# Iteration 3: Switch to slim base image (Dockerfile + compose — ONE intent)
# Files: Dockerfile, docker-compose.yml
git add Dockerfile docker-compose.yml
git commit -m "experiment(ci): switch node:20 to node:20-slim base image"
# Verify: 6min → 5.2min ✓ KEEP
```

| One Change (OK) | Two Changes (Split Into Separate Iterations) |
|-----------------|---------------------------------------------|
| Change port in Dockerfile + compose + nginx | Change port AND add new service |
| Update Node version in Dockerfile + CI + package.json | Update Node AND switch package manager |
| Add caching in CI workflow + Dockerfile | Add caching AND parallelize tests |

### CI/CD pipeline speed

```
/autoresearch
Iterations: 15
Goal: Reduce CI pipeline duration from 12min to under 5min
Scope: .github/workflows/*.yml
Metric: pipeline duration in seconds (lower is better)
Verify: node scripts/estimate-ci-time.js
```

### Fix CI/CD failures

```
/autoresearch:fix
Target: gh run view --log-failed
Scope: .github/workflows/*.yml
```

### Terraform/IaC security compliance

```
/autoresearch
Iterations: 20
Goal: Pass all tfsec security checks + reduce resource count
Scope: infra/*.tf
Metric: tfsec violations (lower is better)
Verify: tfsec . --format json | jq '.results | length'
```

### Infrastructure security audit

```
/autoresearch:security
Scope: infra/*.tf, .github/workflows/*.yml, Dockerfile
Focus: exposed secrets, container privileges, network policies
Iterations: 15
```

### Ship a deployment

```
/autoresearch:ship --type deployment --monitor 10
```

Runs readiness checklist, deploys, then monitors for 10 minutes. Triggers auto-rollback on error spike.

### CLI invocation for DevOps pipelines

Invoke autoresearch from the command line for DevOps workflows:

```bash
# Interactive mode — Claude guides the optimization
claude "/autoresearch
Goal: Reduce CI/CD pipeline from 12min to 5min
Scope: .github/workflows/*.yml, Dockerfile, docker-compose.yml
Verify: gh run list --limit 1 --json durationMs --jq '.[0].durationMs / 60000'
Iterations: 15"

# Non-interactive (CI/CD mode) — runs headless
claude --print "/autoresearch
Goal: Reduce Docker build time
Scope: Dockerfile
Verify: docker build . 2>&1 | grep -oP 'total [\d.]+s' | grep -oP '[\d.]+'
Iterations: 10"

# With guard to prevent breaking deployments
claude "/autoresearch
Goal: Optimize Kubernetes resource usage
Scope: k8s/*.yaml
Verify: kubectl top pods -n prod --no-headers | awk '{sum+=\$3} END {print sum}'
Guard: kubectl rollout status deployment/app -n prod --timeout=60s
Iterations: 10"
```

### Error handling for DevOps experiments

DevOps changes can fail in ways code changes don't — broken deploys, unreachable services, resource exhaustion:

```bash
# Verify with timeout (prevent hanging on stuck deployments)
timeout 120 kubectl rollout status deployment/app --timeout=90s 2>&1 \
  | grep -oP '\d+(?=s)' || echo "999"
# → Returns 999 on timeout, triggering discard

# Health check with retry (services may take time to start)
verify_with_retry() {
  for i in 1 2 3; do
    if curl -sf http://localhost:3000/health > /dev/null 2>&1; then
      return 0
    fi
    sleep 5
  done
  return 1  # Failed after 3 retries
}

# Guard: ensure deployment didn't break production
guard_production() {
  # Check pod status
  kubectl get pods -n prod | grep -v Running | grep -v Completed | grep -c . && return 1
  # Check endpoint health
  curl -sf "https://api.example.com/health" > /dev/null || return 1
  return 0
}
```

**Common DevOps failure patterns and recovery:**

| Failure | Detection | Recovery |
|---------|-----------|----------|
| Deploy timeout | `kubectl rollout status` exits non-zero | `safe_revert()` restores previous YAML |
| OOM killed | Pod status = OOMKilled | Revert resource change, try smaller increment |
| Health check fails | `curl -f` returns non-zero | Rollback deploy: `kubectl rollout undo` |
| Build cache miss | Build time spikes | Revert Dockerfile change, try different layer strategy |
| Port conflict | Container fails to start | Revert port change in compose + app config |

### Defining metrics for complex pipeline changes

DevOps metrics often require composite measurement:

```bash
# Pipeline duration (minutes)
gh run list --limit 1 --json durationMs --jq '.[0].durationMs / 60000'

# Docker image size (MB)
docker images myapp:latest --format '{{.Size}}' | grep -oP '[\d.]+'

# Deployment rollout time (seconds)
kubectl rollout status deployment/app 2>&1 | grep -oP '\d+(?= seconds)'

# Resource utilization (average CPU across all pods)
kubectl top pods --no-headers | awk '{sum+=$3} END {print sum/NR}'

# Cost estimation (compute-hours)
kubectl get pods -o json | jq '[.items[].spec.containers[].resources.requests.cpu // "100m"] | map(rtrimstr("m") | tonumber) | add / 1000'
```

### Rollback in production environments

```bash
# Autoresearch automatically handles rollback via safe_revert():
# 1. Code change is committed BEFORE verification (Phase 4)
# 2. If verification fails, git revert restores previous state (Phase 6)
# 3. For Kubernetes, add explicit rollback as part of safe_revert:

# In your Guard command, combine code check + deploy check:
Guard: kubectl rollout status deployment/app --timeout=60s && curl -sf http://api.example.com/health

# If guard fails:
# 1. safe_revert() reverts the git commit (YAML files restored)
# 2. kubectl apply -f k8s/ re-applies the reverted config
# 3. kubectl rollout status confirms rollback succeeded

# For critical production systems, add a pre-deploy snapshot:
# Verify: kubectl apply -f k8s/ && kubectl rollout status deployment/app && curl -sf http://api.example.com/health | jq '.responseTime'
```

---

## Data Science & ML

### Python ML training loss

```
/autoresearch
Goal: Reduce validation loss (val_bpb)
Scope: train.py, model.py
Metric: val_bpb (lower is better)
Verify: uv run train.py --epochs 1 2>&1 | grep "val_bpb" | tail -1 | awk '{print $NF}'
```

### Optimize ML model accuracy

```
/autoresearch
Goal: Improve classification accuracy from 85% to 95%
Scope: model.py, config.yaml, data/augmentation.py
Verify: python train.py --eval-only 2>&1 | grep 'val_accuracy' | awk '{print $NF}'
Guard: python -m pytest tests/test_model.py -q
Noise: high
Min-Delta: 0.5
Iterations: 25
```

The agent targets one hyperparameter or architectural change per iteration: learning rate, batch size, layer count, dropout rate, optimizer, augmentation strategy. Each experiment is committed before verification, enabling git-based rollback if accuracy drops.

**Example iterations:**
```bash
# Iteration 1: Increase learning rate
# model.py: lr = 0.001 → lr = 0.01
git commit -m "experiment(model): increase learning rate from 0.001 to 0.01"
# Verify: accuracy = 87.2% (+2.2%) → KEEP

# Iteration 2: Add data augmentation
# data/augmentation.py: add random flip + rotation
git commit -m "experiment(data): add random flip and rotation augmentation"
# Verify: accuracy = 89.1% (+1.9%) → KEEP

# Iteration 3: Try larger batch size
# config.yaml: batch_size = 32 → 128
git commit -m "experiment(config): increase batch size from 32 to 128"
# Verify: accuracy = 88.5% (-0.6%) → DISCARD (reverted)
```

### SQL query optimization

```
/autoresearch
Iterations: 15
Goal: Reduce total query execution time for dashboard queries
Scope: queries/dashboard/*.sql
Metric: total execution time in ms (lower is better)
Verify: psql -f scripts/bench-queries.sql | grep "total_ms"
```

### Data pipeline quality

```
/autoresearch
Iterations: 20
Goal: Increase data validation pass rate from 85% to 99%
Scope: scripts/validators/*.py
Metric: validation pass rate % (higher is better)
Verify: python scripts/run_validations.py | grep "pass_rate"
```

---

## Design & Accessibility

### WCAG 2.1 AA compliance

```
/autoresearch
Iterations: 25
Goal: Reach WCAG 2.1 AA compliance — zero axe violations
Scope: src/components/**/*.tsx
Metric: axe violation count (lower is better)
Verify: npx playwright test a11y.spec.ts | grep "violations"
```

### Color contrast and design tokens

```
/autoresearch
Iterations: 20
Goal: Replace all hardcoded colors/spacing with design tokens
Scope: src/**/*.tsx, src/**/*.css
Metric: hardcoded values count (lower is better)
Verify: grep -rE "#[0-9a-fA-F]{3,6}|px\b" src/ --include="*.tsx" --include="*.css" | wc -l
```

### Ship design assets

```
/autoresearch:ship
Target: design/tokens/v2/
Type: content
```

---

## HR & People Operations

### Job description clarity

```
/autoresearch
Iterations: 15
Goal: Improve job descriptions — bias-free language, clear requirements, inclusive tone
Scope: content/job-descriptions/*.md
Metric: inclusivity score from textio-style checker (higher is better)
Verify: node scripts/jd-inclusivity-score.js
```

### Onboarding docs readability

```
/autoresearch
Iterations: 10
Goal: Reduce average reading level of HR policies to grade 8
Scope: content/policies/*.md
Metric: Flesch-Kincaid grade level (lower is better)
Verify: node scripts/readability.js content/policies/
```

### Hiring scenarios

```
/autoresearch:scenario --domain business --depth deep
Scenario: Candidate moves through interview process from application to offer
Iterations: 30
```

### Interview question bank

```
/autoresearch
Iterations: 20
Goal: Ensure all questions are behavioral (STAR format) + cover all competencies
Scope: content/interview-questions.md
Metric: STAR-format compliance % + competency coverage % (higher is better)
Verify: node scripts/interview-quality.js
```

---

## Operations

### Runbook accuracy and brevity

```
/autoresearch
Iterations: 15
Goal: Reduce average runbook steps while maintaining completeness
Scope: docs/runbooks/*.md
Metric: avg steps per runbook (lower is better), constraint: all checklist items preserved
Verify: node scripts/runbook-audit.js
```

### SLA compliance documentation

```
/autoresearch
Iterations: 10
Goal: Standardize all SOPs to template format with <100 words per step
Scope: docs/sops/*.md
Metric: template compliance % + avg words per step (higher compliance + lower words = better)
Verify: node scripts/sop-score.js
```

### Incident response playbooks

```
/autoresearch
Iterations: 20
Goal: Ensure all playbooks have decision trees, escalation paths, rollback steps
Scope: docs/incident-playbooks/*.md
Metric: completeness checklist score (higher is better)
Verify: node scripts/playbook-completeness.js
```

---

## Documentation & Knowledge Management

### Generate docs for an unknown codebase

```
/autoresearch:learn --mode init --depth deep
Scope: src/**
```

Claude scouts the codebase, detects project type (web app, library, CLI, API), generates all relevant docs (architecture, code standards, overview, summary), validates references, and iteratively fixes any hallucinated code refs. Creates deployment-guide.md only if Dockerfile/CI config detected.

### Update docs after a major refactor

```
/autoresearch:learn --mode update
Iterations: 3
```

Uses git-diff scoping to prioritize changed areas. Reads existing docs in parallel, updates all `docs/*.md` dynamically (no hardcoded list — catches custom docs too). Validation-fix loop ensures updated refs are valid.

### Check documentation health

```
/autoresearch:learn --mode check
```

Read-only diagnostic: staleness gap (days between last code commit vs last docs commit), validation warnings, file inventory with LOC, coverage assessment. No files modified.

---

## Combining with MCP Servers

Claude Code supports MCP (Model Context Protocol) servers. When combined with autoresearch, this enables real-time data-driven iteration loops.

### Database-aware query optimization

Use a PostgreSQL MCP server to iterate on real query performance — no mock data:

```
/autoresearch
Goal: Optimize slow dashboard queries — reduce p95 query time
Scope: queries/dashboard/*.sql
Metric: avg query time in ms (lower is better)
Verify: Use MCP postgres tool to run EXPLAIN ANALYZE on each query, sum total costs
```

Claude modifies queries, runs EXPLAIN ANALYZE via MCP on the live database, keeps improvements. Each iteration tests on real data, not synthetic benchmarks.

### Analytics-driven content optimization

Use a Google Analytics or Plausible MCP server:

```
/autoresearch
Goal: Improve blog post structure based on engagement metrics
Scope: content/blog/*.md
Metric: avg time on page for modified posts (higher is better)
Verify: Use MCP analytics tool to fetch page metrics, compare against baseline
```

### CRM-driven email template refinement

Use a HubSpot or Salesforce MCP server:

```
/autoresearch
Goal: Optimize email templates based on actual open/reply rates
Scope: content/email-templates/*.md
Metric: avg open rate from CRM data (higher is better)
Verify: Use MCP CRM tool to pull latest campaign metrics for template variants
```

### Recommended MCP servers by use case

| MCP Server | Use Case | Metric Source |
|---|---|---|
| **PostgreSQL** | Query optimization, data validation | Query execution time, row counts |
| **GitHub** | Issue triage, PR quality, CI status | Issue counts, check pass rates |
| **Puppeteer/Playwright** | Visual regression, performance | Lighthouse scores, screenshot diffs |
| **Sentry** | Error reduction | Error count, crash-free rate |
| **Cloudflare** | Edge performance | Cache hit rate, TTFB |
| **Stripe** | Payment flow optimization | Checkout completion rates |
| **Slack** | Notification quality, alert tuning | Message delivery, response times |

---

## CI/CD Integration

Run autoresearch autonomously in GitHub Actions pipelines.

### Security audit on pull requests

```yaml
# .github/workflows/security-audit.yml
name: Security Audit
on:
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * 1'  # Weekly Monday 2am

jobs:
  security-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Security Audit
        run: |
          if [ "${{ github.event_name }}" = "pull_request" ]; then
            claude -p "/autoresearch:security --diff --fail-on critical --iterations 5"
          else
            claude -p "/autoresearch:security --fail-on high --iterations 15"
          fi
      - name: Upload Report
        uses: actions/upload-artifact@v4
        with:
          name: security-report
          path: security/
```

### Coverage enforcement on main

```yaml
# .github/workflows/coverage-gate.yml
name: Coverage Gate
on:
  push:
    branches: [main]

jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - name: Run autoresearch coverage sprint
        run: claude -p "/autoresearch --iterations 10 --goal 'Keep coverage above 85%' --verify 'npm test -- --coverage | grep All files' --fail-below 85"
```

### Nightly improvement loop

```yaml
# .github/workflows/nightly-optimize.yml
name: Nightly Optimization
on:
  schedule:
    - cron: '0 3 * * *'  # 3am daily

jobs:
  optimize:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - name: Run overnight loop
        run: |
          claude -p "/autoresearch
          Iterations: 50
          Goal: Improve test coverage and reduce bundle size
          Scope: src/**/*.ts
          Verify: npm test -- --coverage | grep 'All files'
          Guard: npm run build"
      - name: Create PR with improvements
        run: claude -p "/autoresearch:ship --type code-pr --auto"
```

---

## Custom Verification Scripts

The loop works best when verification is fast and mechanical. Scripts must output a parseable number and exit cleanly.

### JavaScript template

```javascript
// scripts/score-example.js — Template for custom scoring
const fs = require('fs');
const file = process.argv[2];
const content = fs.readFileSync(file, 'utf-8');

// Your scoring logic here
const score = content.split('\n').filter(l => l.startsWith('- ')).length;

// Output MUST be a single number on its own line for easy parsing
console.log(`SCORE: ${score}`);
process.exit(score > 0 ? 0 : 1);
```

### Python template

```python
#!/usr/bin/env python3
# scripts/verify-coverage.py
import subprocess, re, sys

result = subprocess.run(
    ["npm", "test", "--", "--coverage"],
    capture_output=True, text=True
)

match = re.search(r'All files\s*\|\s*([\d.]+)', result.stdout)
if match:
    print(f"coverage: {match.group(1)}")
    sys.exit(0)
else:
    print("coverage: 0")
    sys.exit(1)
```

Use it:

```
/autoresearch
Verify: python scripts/verify-coverage.py | grep "coverage"
```

### LLM-based content quality scorer

Use a fast, cheap model (Haiku) to score content:

```javascript
// scripts/content-quality-scorer.js
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');

const content = fs.readFileSync(process.argv[2], 'utf-8');
const client = new Anthropic();

async function score() {
  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 100,
    messages: [{
      role: 'user',
      content: `Score this content 0-100 for clarity, engagement, and SEO. Return ONLY a number.\n\n${content}`
    }]
  });
  const score = parseInt(msg.content[0].text.trim());
  console.log(`SCORE: ${score}`);
  process.exit(0);
}
score();
```

```
/autoresearch
Goal: All blog posts score 80+ on AI-assessed quality
Scope: content/blog/*.md
Metric: quality score from Haiku (higher is better)
Verify: node scripts/content-quality-scorer.js content/blog/latest.md
```

### Rules for good verification scripts

| Rule | Why |
|------|-----|
| Runs in under 10 seconds | Fast = more iterations = more experiments |
| Outputs a single parseable number | Claude needs to extract the metric mechanically |
| Exit code 0 = success, non-zero = crash | Clean pass/fail signal |
| No human judgment required | Agent must decide autonomously |
| Deterministic (same input = same output) | Non-deterministic metrics break the feedback loop |

---

## Domain Adaptation Reference

| Domain | Metric | Scope | Verify Command | Guard |
|--------|--------|-------|----------------|-------|
| Node.js/TS backend | Coverage % | `src/**/*.ts` | `npm test -- --coverage` | — |
| Python backend | pytest coverage % | `app/**/*.py` | `pytest --cov=app` | `mypy app/` |
| Go backend | Test coverage % | `**/*.go` | `go test ./... -cover` | `go vet ./...` |
| Rust backend | Test coverage % | `src/**/*.rs` | `cargo tarpaulin` | `cargo clippy` |
| Frontend UI | Lighthouse score | `src/components/**` | `npx lighthouse` | `npm test` |
| ML training | val_bpb / loss | `train.py` | `uv run train.py` | — |
| Blog/content | Readability score | `content/*.md` | Custom script | — |
| Performance | Benchmark time (ms) | Target files | `npm run bench` | `npm test` |
| Web scraping | Success rate % | `scrapers/**/*.py` | Custom test script | `pytest tests/scrapers/` |
| Security | OWASP + STRIDE | API/auth/middleware | `/autoresearch:security` | — |

---

*Related: [chains-and-combinations.md](./chains-and-combinations.md) · [getting-started.md](./getting-started.md) · [autoresearch.md](./autoresearch.md)*
