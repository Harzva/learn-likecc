/**
 * Built-in tool tile wall from cc-overview.json → tool_tiles
 * Mount: <div id="cc-tool-tiles-mount" data-json="data/cc-overview.json">
 */
;(function () {
    var mount = document.getElementById('cc-tool-tiles-mount')
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
            var block = data.tool_tiles
            if (!block || !block.categories || !block.categories.length) {
                mount.innerHTML = ''
                return
            }

            var html =
                '<div class="cc-tool-tiles__head">' +
                '<h3 class="cc-tool-tiles__title">Tool System（可点进讲义）</h3>' +
                '<p class="cc-tool-tiles__sub">按职能分组；<span class="cc-tool-tiles__lock" aria-hidden="true">🔒</span> 表示可能受限或随版本更名。</p>' +
                '</div>'
            if (block.note_zh) {
                html += '<p class="cc-tool-tiles__note">' + esc(block.note_zh) + '</p>'
            }
            html += '<div class="cc-tool-tiles__cols">'

            block.categories.forEach(function (cat) {
                var accent = esc(cat.accent || 'blue')
                html += '<section class="cc-tool-cat cc-tool-cat--' + accent + '">'
                html +=
                    '<h4 class="cc-tool-cat__title"><span class="cc-tool-cat__bar" aria-hidden="true"></span>' +
                    esc(cat.title) +
                    '</h4>'
                html += '<div class="cc-tool-cat__tiles">'
                ;(cat.tools || []).forEach(function (t) {
                    var nm = esc(t.name || '')
                    var href = esc(t.href || '#')
                    var lock = t.locked
                        ? '<span class="cc-tool-tiles__lock" title="可能受限或随版本变化">🔒</span>'
                        : ''
                    html +=
                        '<a class="cc-tool-tile" href="' +
                        href +
                        '"><code>' +
                        nm +
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
                '<p class="cc-tool-tiles__err">无法加载工具墙数据（请用 HTTP 打开本站）。</p>'
        })
})()
