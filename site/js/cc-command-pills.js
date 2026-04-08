/**
 * Slash-command pill wall from site/data/cc-overview.json → command_pills
 * Mount: <div id="cc-command-pills-mount" data-json="data/cc-overview.json">
 */
;(function () {
    var mount = document.getElementById('cc-command-pills-mount')
    if (!mount) return

    var jsonUrl = mount.getAttribute('data-json') || 'data/cc-overview.json'

    function esc(s) {
        return String(s || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
    }

    fetch(jsonUrl)
        .then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status)
            return r.json()
        })
        .then(function (data) {
            var block = data.command_pills
            if (!block || !block.categories || !block.categories.length) {
                mount.innerHTML = ''
                return
            }

            var html =
                '<div class="cc-pill-wall__head">' +
                '<h3 class="cc-pill-wall__title">Command Catalog（可点进讲义）</h3>' +
                '<p class="cc-pill-wall__sub">与下表互补；<span class="cc-pill-wall__lock" aria-hidden="true">🔒</span> 表示可能随版本/权限变化。</p>' +
                '</div>'

            if (block.note_zh) {
                html += '<p class="cc-pill-wall__note">' + esc(block.note_zh) + '</p>'
            }

            html += '<div class="cc-pill-wall__grid">'

            block.categories.forEach(function (cat) {
                var accent = esc(cat.accent || 'blue')
                html += '<section class="cc-pill-cat cc-pill-cat--' + accent + '">'
                html +=
                    '<h4 class="cc-pill-cat__title"><span class="cc-pill-cat__bar" aria-hidden="true"></span>' +
                    esc(cat.title) +
                    '<span class="cc-pill-cat__count">' +
                    (cat.pills ? cat.pills.length : 0) +
                    '</span></h4>'
                html += '<div class="cc-pill-cat__row">'
                ;(cat.pills || []).forEach(function (p) {
                    var cmd = esc(p.cmd || '')
                    var href = esc(p.href || '#')
                    var lock = p.locked
                        ? '<span class="cc-pill-wall__lock" title="可能受限或随版本变化">🔒</span>'
                        : ''
                    html +=
                        '<a class="cc-pill" href="' +
                        href +
                        '"><code>' +
                        cmd +
                        '</code>' +
                        lock +
                        '</a>'
                })
                html += '</div></section>'
            })

            html += '</div>'
            mount.innerHTML = html
        })
        .catch(function () {
            mount.innerHTML =
                '<p class="cc-pill-wall__err">无法加载命令墙数据（请用 HTTP 打开本站）。</p>'
        })
})()
