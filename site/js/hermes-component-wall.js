/**
 * Hermes component catalog pill wall
 * Mount: <div id="hermes-component-wall-mount" data-json="data/hermes-component-catalog.json">
 */
;(function () {
    var mount = document.getElementById('hermes-component-wall-mount')
    if (!mount) return

    var jsonUrl = mount.getAttribute('data-json') || 'data/hermes-component-catalog.json'

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
            var block = data.component_wall
            if (!block || !block.categories || !block.categories.length) {
                mount.innerHTML = ''
                return
            }

            var html =
                '<div class="cc-pill-wall">' +
                '<div class="cc-pill-wall__head">' +
                '<h3 class="cc-pill-wall__title">' + esc(block.title) + '</h3>' +
                '<p class="cc-pill-wall__sub">' + esc(block.subtitle) + '</p>' +
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
                    html +=
                        '<span class="cc-pill" title="' + esc(p.tag) + '">' +
                        '<strong>' + esc(p.name) + '</strong>' +
                        '<span class="cc-pill__tag">' + esc(p.tag) + '</span>' +
                        '</span>'
                })
                html += '</div></section>'
            })

            html += '</div></div>'
            mount.innerHTML = html
        })
        .catch(function () {
            mount.innerHTML =
                '<p class="cc-pill-wall__err">无法加载组件目录数据（请用 HTTP 打开本站）。</p>'
        })
})()
