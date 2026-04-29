#!/usr/bin/env node
/**
 * Unpacked Topic Compliance Audit
 * Scores any *-unpacked.html page against the 10-item template benchmark.
 *
 * Usage:
 *   node tools/unpacked-audit.js site/topic-deepscientist-unpacked.html
 *   node tools/unpacked-audit.js site/topic-hermes-unpacked.html
 */

const fs = require('fs');
const path = require('path');

const BENCHMARK = [
  {
    id: 'hero-stats',
    name: 'Hero with stats strip',
    weight: 1,
    check: (html) => {
      const hasHero = html.includes('class="hero-stats"') || html.includes("class='hero-stats'");
      const hasStatItems = (html.match(/class="stat-item"/g) || []).length >= 3;
      return hasHero && hasStatItems;
    }
  },
  {
    id: 'version-anchor',
    name: 'Reference & version anchoring',
    weight: 0.5,
    check: (html) => {
      return html.includes('page:updated') || html.includes('版本锚定') || html.includes('参考来源');
    }
  },
  {
    id: 'interactive-step',
    name: 'Interactive step-through',
    weight: 1.5,
    check: (html) => {
      const hasTabs = html.includes('ds-stage-tab') || html.includes('tab') || html.includes('accordion');
      const hasNav = html.includes('data-dir="prev"') || html.includes('data-dir="next"');
      const hasPlayer = html.includes('ds-quest-player') || html.includes('ds-stage-walkthrough');
      return hasPlayer || (hasTabs && hasNav);
    }
  },
  {
    id: 'arch-treemap',
    name: 'Visual architecture map (Treemap)',
    weight: 1,
    check: (html) => {
      return html.includes('treemap') || html.includes('ds-arch-treemap');
    }
  },
  {
    id: 'knowledge-graph',
    name: 'Knowledge graph / network diagram',
    weight: 1,
    check: (html) => {
      return html.includes('knowledge') || html.includes('network') || html.includes('graph') || html.includes('ds-arch-knowledge');
    }
  },
  {
    id: 'component-catalog',
    name: 'Categorized component catalog',
    weight: 1,
    check: (html) => {
      return html.includes('ds-connector-wall') || html.includes('pill') || html.includes('brick') || html.includes('feature-card');
    }
  },
  {
    id: 'data-table',
    name: 'Data tables',
    weight: 0.5,
    check: (html) => {
      const tables = (html.match(/<table/g) || []).length;
      return tables >= 1;
    }
  },
  {
    id: 'experimental-section',
    name: 'Experimental / advanced section',
    weight: 0.5,
    check: (html) => {
      return html.includes('experimental') || html.includes('advanced') || html.includes('preview') || html.includes('flag');
    }
  },
  {
    id: 'cross-links',
    name: 'Cross-links & reading paths',
    weight: 0.5,
    check: (html) => {
      return html.includes('chapter-navigation') || html.includes('back to hub') || html.includes('next topic');
    }
  },
  {
    id: 'footer-provenance',
    name: 'Footer with provenance',
    weight: 0.5,
    check: (html) => {
      const hasFooter = html.includes('class="footer"');
      const hasSource = html.includes('md-source-link') || html.includes('源文件') || html.includes('GitHub');
      return hasFooter && hasSource;
    }
  }
];

function audit(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error('File not found: ' + filePath);
    process.exit(1);
  }

  const html = fs.readFileSync(filePath, 'utf-8');
  const results = [];
  let totalScore = 0;
  let maxScore = 0;

  BENCHMARK.forEach(item => {
    const passed = item.check(html);
    const score = passed ? item.weight : 0;
    totalScore += score;
    maxScore += item.weight;
    results.push({
      id: item.id,
      name: item.name,
      passed: passed,
      weight: item.weight,
      score: score
    });
  });

  const percentage = Math.round((totalScore / maxScore) * 100);

  console.log('\n=== Unpacked Topic Audit: ' + path.basename(filePath) + ' ===\n');
  console.log('Item                                      | Weight | Score');
  console.log('------------------------------------------|--------|------');
  results.forEach(r => {
    const status = r.passed ? '✓' : '✗';
    const label = r.name.padEnd(40, ' ').substring(0, 40);
    console.log(status + ' ' + label + ' | ' + String(r.weight).padStart(4) + '   | ' + String(r.score).padStart(4));
  });
  console.log('------------------------------------------|--------|------');
  console.log('TOTAL                                     | ' + String(maxScore).padStart(4) + '   | ' + String(totalScore).padStart(4));
  console.log('\nCompliance: ' + percentage + '% (' + totalScore + '/' + maxScore + ')');

  if (percentage >= 80) {
    console.log('Status: ✅ PASS — meets template quality bar');
  } else if (percentage >= 60) {
    console.log('Status: ⚠️  PARTIAL — needs improvement in missing items');
  } else {
    console.log('Status: ❌ FAIL — significant gaps vs template benchmark');
  }

  const missing = results.filter(r => !r.passed).map(r => r.id);
  if (missing.length > 0) {
    console.log('\nMissing items: ' + missing.join(', '));
  }

  return { percentage, missing, totalScore, maxScore };
}

// CLI
const target = process.argv[2];
if (!target) {
  console.log('Usage: node unpacked-audit.js <path-to-unpacked.html>');
  console.log('');
  console.log('Examples:');
  console.log('  node unpacked-audit.js site/topic-deepscientist-unpacked.html');
  console.log('  node unpacked-audit.js site/topic-hermes-unpacked.html');
  process.exit(1);
}

audit(target);
