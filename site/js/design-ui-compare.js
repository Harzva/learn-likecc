/**
 * Design/UI 三列交互对照模块 — design-ui-compare.json → 三列 hover 展开
 * Mount: <div id="design-ui-compare-mount" data-json="data/design-ui-compare.json">
 */
;(function () {
    var mount = document.getElementById('design-ui-compare-mount')
    if (!mount) return

    var jsonUrl = mount.getAttribute('data-json') || 'data/design-ui-compare.json'

    function esc(s) {
        return String(s || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
    }

    function render(data) {
        var block = data.compare
        if (!block || !block.items || !block.items.length) {
            mount.innerHTML = ''
            return
        }

        var html = ''
        if (block.title) {
            html += '<h3 class="du-compare__title">' + esc(block.title) + '</h3>'
        }
        if (block.subtitle) {
            html += '<p class="du-compare__subtitle">' + esc(block.subtitle) + '</p>'
        }

        html += '<div class="du-compare__grid" role="list">'

        block.items.forEach(function (item) {
            var accent = esc(item.accent || '#eab308')
            html +=
                '<div class="du-compare__col" role="listitem" data-col-id="' + esc(item.id) + '" style="--col-accent:' + accent + '">'

            // header
            html +=
                '<div class="du-compare__header">' +
                '<span class="du-compare__accent-bar" aria-hidden="true"></span>' +
                '<h4 class="du-compare__col-title">' + esc(item.title) + '</h4>' +
                '<span class="du-compare__tagline">' + esc(item.tagline) + '</span>' +
                '</div>'

            // score chips
            if (item.score_labels && item.score_labels.length) {
                html += '<div class="du-compare__chips">'
                item.score_labels.forEach(function (lab) {
                    html += '<span class="du-compare__chip">' + esc(lab) + '</span>'
                })
                html += '</div>'
            }

            // dimensions list (always visible, hover expands)
            html += '<dl class="du-compare__dl">'
            ;(block.dimensions || []).forEach(function (dim) {
                var val = (item.values || {})[dim.key] || '—'
                html +=
                    '<div class="du-compare__row" data-dim="' + esc(dim.key) + '">' +
                    '<dt class="du-compare__dt">' +
                    '<span class="du-compare__dt-icon" aria-hidden="true">' + esc(dim.icon || '') + '</span>' +
                    '<span class="du-compare__dt-label">' + esc(dim.label) + '</span>' +
                    '</dt>' +
                    '<dd class="du-compare__dd">' + esc(val) + '</dd>' +
                    '</div>'
            })
            html += '</dl>'

            html += '</div>' // col
        })

        html += '</div>' // grid
        mount.innerHTML = html

        // hover interactions: highlight same-dimension rows across columns
        mount.querySelectorAll('.du-compare__row').forEach(function (row) {
            row.addEventListener('mouseenter', function () {
                var dim = row.getAttribute('data-dim')
                mount.querySelectorAll('.du-compare__row[data-dim="' + dim + '"]').forEach(function (r) {
                    r.classList.add('du-compare__row--active')
                })
            })
            row.addEventListener('mouseleave', function () {
                var dim = row.getAttribute('data-dim')
                mount.querySelectorAll('.du-compare__row[data-dim="' + dim + '"]').forEach(function (r) {
                    r.classList.remove('du-compare__row--active')
                })
            })
        })
    }

    fetch(jsonUrl)
        .then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status)
            return r.json()
        })
        .then(render)
        .catch(function () {
            mount.innerHTML =
                '<p class="du-compare__err">无法加载对照数据（请用 HTTP 打开本站）。</p>'
        })
})()
