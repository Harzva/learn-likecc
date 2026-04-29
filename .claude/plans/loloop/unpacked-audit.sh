#!/usr/bin/env bash
# unpacked-audit.sh — Score any unpacked page against the 10-item benchmark
# Usage: ./unpacked-audit.sh <path-to-unpacked-html>
# Example: ./unpacked-audit.sh ../../site/topic-deepscientist-unpacked.html

FILE="${1:-}"
if [[ -z "$FILE" || ! -f "$FILE" ]]; then
  echo "Usage: $0 <path-to-unpacked-html>"
  exit 1
fi

RAW=$(cat "$FILE" | tr '\n' ' ' | tr '\t' ' ')
LOWER=$(echo "$RAW" | tr '[:upper:]' '[:lower:]')

score=0
max=10
results=()

check() {
  local name="$1"
  local pattern="$2"
  local found=0
  if echo "$LOWER" | grep -qiE "$pattern"; then
    found=1
    ((score++))
  fi
  results+=("$found|$name")
}

# 1. Hero with stats strip — look for stat/metric containers near hero
check "Hero stats strip" "(stat|metric|counter|badge|pill).*(count|number|files|lines|tools|courses|quest|stage|repo)"

# 2. Reference & version anchoring — commit hash, date, version, attribution
check "Reference & version" "(commit|version|changelog|updated|date|anchor|hash|revision|attribution|source)"

# 3. Interactive step-through — tabs, step, walkthrough, playback, keyboard nav
check "Interactive step-through" "(tab|step|walkthrough|playback|keyboard|navigate|carousel|wizard|stage)"

# 4. Visual architecture map — treemap, hierarchy, tree, map, explorer
check "Architecture treemap" "(treemap|hierarchy|tree.*view|architecture.*map|explorer|d3|canvas|svg.*map)"

# 5. Knowledge graph / network diagram — graph, network, node, edge, force, d3
check "Knowledge graph" "(knowledge.*graph|network.*diagram|graph|node|edge|force|d3|vis|cytoscape)"

# 6. Categorized component catalog — brick wall, pill wall, card grid, tool catalog, command catalog
check "Component catalog" "(catalog|brick|pill.*wall|card.*grid|tool.*list|command.*list|component|feature.*grid|badge.*wall)"

# 7. Data tables — <table>, summary table, stage mapping, lesson links
check "Data tables" "(<table|summary.*table|stage.*map|lesson.*link|data.*table|comparison.*table)"

# 8. Experimental / advanced section — feature flag, preview, gated, experimental, beta
check "Experimental section" "(experimental|feature.*flag|preview|gated|beta|alpha|advanced|coming.*soon|wip)"

# 9. Cross-links & reading paths — prev/next, back to hub, related topic, reading path
check "Cross-links & reading paths" "(prev|next|back.*hub|related.*topic|reading.*path|navigation|breadcrumb|←|→)"

# 10. Footer with provenance — markdown source link, update date, hit counter, footer
check "Footer with provenance" "(footer|provenance|markdown.*source|update.*date|hit.*counter|last.*updated|generated)"

# Output
BASENAME=$(basename "$FILE")
echo ""
echo "========================================"
echo "  Unpacked Page Audit: $BASENAME"
echo "========================================"
echo ""

for r in "${results[@]}"; do
  IFS='|' read -r ok label <<< "$r"
  if [[ "$ok" == "1" ]]; then
    echo "  [✓] $label"
  else
    echo "  [ ] $label"
  fi
done

echo ""
echo "----------------------------------------"
printf "  Score: %d/%d\n" "$score" "$max"

pct=$(( score * 100 / max ))
if [[ "$pct" -ge 80 ]]; then
  echo "  Grade: A (template-aligned)"
elif [[ "$pct" -ge 60 ]]; then
  echo "  Grade: B (partial)"
elif [[ "$pct" -ge 40 ]]; then
  echo "  Grade: C (needs work)"
else
  echo "  Grade: D (significant gap)"
fi
echo "========================================"
echo ""
