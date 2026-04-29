// DeepScientist Quest Stage Player
// Interactive step-through: quest-init → baseline → experiment → analysis-write
(function() {
  'use strict';

  var mount = document.getElementById('ds-quest-player');
  if (!mount) return;

  var jsonUrl = mount.dataset.json || 'data/ds-quest-stages.json';
  var data = null;
  var currentStage = 0;
  var currentStep = 0;
  var isPlaying = false;
  var playTimer = null;
  var totalStages = 0;

  // Color palette matching page theme
  var STAGE_COLORS = ['#60a5fa', '#4ade80', '#fbbf24', '#a78bfa'];

  function fetchData() {
    fetch(jsonUrl)
      .then(function(r) { return r.json(); })
      .then(function(d) {
        data = d;
        totalStages = data.stages.length;
        render();
        bindEvents();
        // Auto-advance first stage steps
        playStageSteps(0);
      })
      .catch(function(err) {
        mount.innerHTML = '<p class="section-desc" style="color:#f87171">加载步进数据失败：' + err.message + '</p>';
      });
  }

  function render() {
    var html = '<div class="ds-qp">';

    // Progress bar
    html += '<div class="ds-qp__progress">';
    html += '<div class="ds-qp__progress-track">';
    for (var i = 0; i < totalStages; i++) {
      var pct = ((i + 1) / totalStages) * 100;
      html += '<div class="ds-qp__progress-dot" data-stage="' + i + '" style="left:' + pct + '%"></div>';
    }
    html += '<div class="ds-qp__progress-bar" id="ds-qp-bar"></div>';
    html += '</div>';
    html += '<div class="ds-qp__progress-labels">';
    for (var j = 0; j < totalStages; j++) {
      html += '<span class="ds-qp__progress-label" data-stage="' + j + '">' + (j + 1) + '</span>';
    }
    html += '</div>';
    html += '</div>';

    // Stage cards
    html += '<div class="ds-qp__stages">';
    for (var s = 0; s < totalStages; s++) {
      var stage = data.stages[s];
      var color = STAGE_COLORS[s % STAGE_COLORS.length];
      html += '<div class="ds-qp__stage" data-stage="' + s + '">';
      html += '<div class="ds-qp__stage-header" style="border-left-color:' + color + '">';
      html += '<div class="ds-qp__stage-num" style="background:' + color + '">' + (s + 1) + '</div>';
      html += '<div class="ds-qp__stage-title">' + escapeHtml(stage.title) + '</div>';
      html += '<div class="ds-qp__stage-sub">' + escapeHtml(stage.subtitle) + '</div>';
      html += '</div>';
      html += '<div class="ds-qp__stage-steps">';
      for (var t = 0; t < stage.steps.length; t++) {
        var step = stage.steps[t];
        html += '<div class="ds-qp__step" data-step="' + t + '">';
        html += '<div class="ds-qp__step-label">' + escapeHtml(step.label) + '</div>';
        html += '<div class="ds-qp__step-desc">' + escapeHtml(step.desc) + '</div>';
        html += '<div class="ds-qp__step-highlight">' + escapeHtml(step.highlight) + '</div>';
        html += '</div>';
      }
      html += '</div>';
      html += '</div>';
    }
    html += '</div>';

    // Controls
    html += '<div class="ds-qp__controls">';
    html += '<button class="ds-qp__btn" id="ds-qp-prev">← 上一阶段</button>';
    html += '<button class="ds-qp__btn ds-qp__btn--primary" id="ds-qp-play">▶ 自动播放</button>';
    html += '<button class="ds-qp__btn" id="ds-qp-next">下一阶段 →</button>';
    html += '</div>';

    // Keyboard hint
    html += '<div class="ds-qp__hint">';
    html += '<kbd>←</kbd> <kbd>→</kbd> 切换阶段　<kbd>Space</kbd> 播放/暂停　<kbd>Home</kbd> 开头　<kbd>End</kbd> 结尾';
    html += '</div>';

    html += '</div>';

    mount.innerHTML = html;
    updateUI();
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function updateUI() {
    // Update progress bar
    var bar = document.getElementById('ds-qp-bar');
    if (bar) {
      var pct = ((currentStage + 1) / totalStages) * 100;
      bar.style.width = pct + '%';
    }

    // Update stage visibility
    var stages = mount.querySelectorAll('.ds-qp__stage');
    stages.forEach(function(el, i) {
      el.classList.toggle('is-active', i === currentStage);
    });

    // Update progress dots
    var dots = mount.querySelectorAll('.ds-qp__progress-dot');
    dots.forEach(function(el, i) {
      el.classList.toggle('is-done', i <= currentStage);
      el.classList.toggle('is-current', i === currentStage);
    });

    // Update progress labels
    var labels = mount.querySelectorAll('.ds-qp__progress-label');
    labels.forEach(function(el, i) {
      el.classList.toggle('is-active', i === currentStage);
    });

    // Update step visibility within current stage
    var activeStage = mount.querySelector('.ds-qp__stage.is-active');
    if (activeStage) {
      var steps = activeStage.querySelectorAll('.ds-qp__step');
      steps.forEach(function(el, i) {
        el.classList.toggle('is-visible', i <= currentStep);
      });
    }

    // Update buttons
    var prevBtn = document.getElementById('ds-qp-prev');
    var nextBtn = document.getElementById('ds-qp-next');
    var playBtn = document.getElementById('ds-qp-play');
    if (prevBtn) prevBtn.disabled = currentStage === 0;
    if (nextBtn) nextBtn.disabled = currentStage === totalStages - 1 && currentStep === getLastStepIndex();
    if (playBtn) playBtn.textContent = isPlaying ? '⏸ 暂停' : '▶ 自动播放';

    // Scroll active stage into view
    var active = mount.querySelector('.ds-qp__stage.is-active');
    if (active) {
      active.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function getLastStepIndex() {
    if (!data || !data.stages[currentStage]) return 0;
    return data.stages[currentStage].steps.length - 1;
  }

  function goToStage(s) {
    if (s < 0 || s >= totalStages) return;
    currentStage = s;
    currentStep = 0;
    updateUI();
    playStageSteps(s);
  }

  function goToStep(t) {
    var max = getLastStepIndex();
    currentStep = Math.max(0, Math.min(t, max));
    updateUI();
  }

  function playStageSteps(stageIdx) {
    if (!data || !data.stages[stageIdx]) return;
    var stage = data.stages[stageIdx];
    var stepDuration = stage.duration / stage.steps.length;
    currentStep = 0;

    var stepInterval = setInterval(function() {
      if (!isPlaying || currentStage !== stageIdx) {
        clearInterval(stepInterval);
        return;
      }
      currentStep++;
      if (currentStep >= stage.steps.length) {
        clearInterval(stepInterval);
        // Auto-advance to next stage after a pause
        if (isPlaying && currentStage < totalStages - 1) {
          setTimeout(function() {
            if (isPlaying) {
              currentStage++;
              currentStep = 0;
              updateUI();
              playStageSteps(currentStage);
            }
          }, 800);
        } else {
          isPlaying = false;
          updateUI();
        }
        return;
      }
      updateUI();
    }, stepDuration);
  }

  function togglePlay() {
    isPlaying = !isPlaying;
    if (isPlaying) {
      playStageSteps(currentStage);
    }
    updateUI();
  }

  function bindEvents() {
    var prevBtn = document.getElementById('ds-qp-prev');
    var nextBtn = document.getElementById('ds-qp-next');
    var playBtn = document.getElementById('ds-qp-play');

    if (prevBtn) {
      prevBtn.addEventListener('click', function() {
        isPlaying = false;
        goToStage(currentStage - 1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function() {
        isPlaying = false;
        if (currentStep < getLastStepIndex()) {
          goToStep(currentStep + 1);
        } else if (currentStage < totalStages - 1) {
          goToStage(currentStage + 1);
        }
      });
    }
    if (playBtn) {
      playBtn.addEventListener('click', togglePlay);
    }

    // Progress dot clicks
    var dots = mount.querySelectorAll('.ds-qp__progress-dot');
    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        isPlaying = false;
        goToStage(parseInt(this.dataset.stage));
      });
    });

    // Keyboard
    document.addEventListener('keydown', function(ev) {
      var isFocused = mount.matches(':focus-within') || mount.contains(document.activeElement);
      if (!isFocused) return;

      switch (ev.key) {
        case 'ArrowLeft':
          ev.preventDefault();
          isPlaying = false;
          goToStage(currentStage - 1);
          break;
        case 'ArrowRight':
          ev.preventDefault();
          isPlaying = false;
          if (currentStep < getLastStepIndex()) {
            goToStep(currentStep + 1);
          } else if (currentStage < totalStages - 1) {
            goToStage(currentStage + 1);
          }
          break;
        case ' ':
        case 'Spacebar':
          ev.preventDefault();
          togglePlay();
          break;
        case 'Home':
          ev.preventDefault();
          isPlaying = false;
          goToStage(0);
          break;
        case 'End':
          ev.preventDefault();
          isPlaying = false;
          goToStage(totalStages - 1);
          break;
      }
    });

    // Focus mount on click to enable keyboard
    mount.addEventListener('click', function() {
      mount.setAttribute('tabindex', '-1');
      mount.focus();
    });
  }

  // Add CSS
  var style = document.createElement('style');
  style.textContent = `
    .ds-qp { margin: 20px 0; }
    .ds-qp__progress { margin-bottom: 24px; }
    .ds-qp__progress-track { position: relative; height: 4px; background: rgba(148,163,184,0.15); border-radius: 2px; margin-bottom: 12px; }
    .ds-qp__progress-bar { position: absolute; top: 0; left: 0; height: 100%; background: linear-gradient(90deg, #60a5fa, #4ade80, #fbbf24, #a78bfa); border-radius: 2px; transition: width .4s ease; width: 0; }
    .ds-qp__progress-dot { position: absolute; top: 50%; transform: translate(-50%, -50%); width: 14px; height: 14px; border-radius: 50%; background: rgba(15,23,42,0.8); border: 2px solid rgba(148,163,184,0.3); cursor: pointer; transition: all .2s; z-index: 2; }
    .ds-qp__progress-dot:hover { border-color: #fbbf24; transform: translate(-50%, -50%) scale(1.2); }
    .ds-qp__progress-dot.is-done { border-color: #4ade80; background: rgba(74,222,128,0.15); }
    .ds-qp__progress-dot.is-current { border-color: #fbbf24; background: rgba(251,191,36,0.2); box-shadow: 0 0 8px rgba(251,191,36,0.3); }
    .ds-qp__progress-labels { display: flex; justify-content: space-between; }
    .ds-qp__progress-label { font-size: 12px; color: #64748b; transition: color .2s; }
    .ds-qp__progress-label.is-active { color: #fbbf24; font-weight: 600; }
    .ds-qp__stages { display: flex; flex-direction: column; gap: 16px; }
    .ds-qp__stage { display: none; border: 1px solid rgba(148,163,184,0.1); border-radius: 12px; background: rgba(15,23,42,0.3); overflow: hidden; }
    .ds-qp__stage.is-active { display: block; animation: dsQpFadeIn .3s ease; }
    @keyframes dsQpFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .ds-qp__stage-header { padding: 16px 20px; border-left: 4px solid; background: rgba(15,23,42,0.4); }
    .ds-qp__stage-num { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; color: #0f172a; font-weight: 700; font-size: 13px; margin-right: 10px; }
    .ds-qp__stage-title { display: inline; font-size: 16px; font-weight: 600; color: #e2e8f0; }
    .ds-qp__stage-sub { margin-top: 4px; font-size: 13px; color: #94a3b8; padding-left: 38px; }
    .ds-qp__stage-steps { padding: 16px 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
    .ds-qp__step { padding: 12px; border: 1px solid rgba(148,163,184,0.08); border-radius: 8px; background: rgba(15,23,42,0.2); opacity: 0; transform: translateY(4px); transition: all .3s ease; }
    .ds-qp__step.is-visible { opacity: 1; transform: translateY(0); }
    .ds-qp__step-label { font-size: 13px; font-weight: 600; color: #60a5fa; margin-bottom: 4px; }
    .ds-qp__step-desc { font-size: 12.5px; color: #cbd5e1; line-height: 1.5; margin-bottom: 6px; }
    .ds-qp__step-highlight { font-size: 11.5px; color: #fbbf24; background: rgba(251,191,36,0.08); padding: 3px 8px; border-radius: 4px; display: inline-block; }
    .ds-qp__controls { display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(148,163,184,0.1); }
    .ds-qp__btn { padding: 8px 16px; border: 1px solid rgba(148,163,184,0.2); border-radius: 8px; background: rgba(15,23,42,0.5); color: #cbd5e1; font-size: 13px; cursor: pointer; transition: all .2s; }
    .ds-qp__btn:hover:not(:disabled) { border-color: #fbbf24; color: #fbbf24; }
    .ds-qp__btn:disabled { opacity: .4; cursor: not-allowed; }
    .ds-qp__btn--primary { border-color: #fbbf24; color: #fbbf24; background: rgba(251,191,36,0.08); }
    .ds-qp__hint { text-align: center; margin-top: 12px; font-size: 12px; color: #64748b; }
    .ds-qp__hint kbd { display: inline-block; padding: 2px 6px; border: 1px solid rgba(148,163,184,0.2); border-radius: 4px; background: rgba(15,23,42,0.5); font-size: 11px; font-family: ui-monospace, monospace; }
    @media (max-width: 640px) {
      .ds-qp__stage-steps { grid-template-columns: 1fr; }
      .ds-qp__controls { flex-wrap: wrap; }
    }
  `;
  document.head.appendChild(style);

  fetchData();
})();
