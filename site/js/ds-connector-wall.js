/**
 * DeepScientist connector & tool pill wall
 * Mount: <div id="ds-connector-wall-mount" data-json="data/ds-connectors.json">
 */
;(function () {
    var mount = document.getElementById('ds-connector-wall-mount')
    if (!mount) return

    var jsonUrl = mount.getAttribute('data-json') || 'data/ds-connectors.json'

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
            var block = data.connector_wall
            if (!block || !block.categories || !block.categories.length) {
                mount.innerHTML = ''
                return
            }

            var html =
                '<div class="ds-wall__head">' +
                '<h3 class="ds-wall__title">' + esc(block.title) + '</h3>' +
                '<p class="ds-wall__sub">' + esc(block.subtitle) + '</p>' +
                '</div>' +
                '<div class="ds-wall__grid">'

            block.categories.forEach(function (cat) {
                var accent = esc(cat.accent || 'blue')
                html += '<section class="ds-wall-cat ds-wall-cat--' + accent + '">'
                html +=
                    '<h4 class="ds-wall-cat__title"><span class="ds-wall-cat__bar" aria-hidden="true"></span>' +
                    esc(cat.title) +
                    '<span class="ds-wall-cat__count">' +
                    (cat.pills ? cat.pills.length : 0) +
                    '</span></h4>'
                html += '<div class="ds-wall-cat__row">'
                ;(cat.pills || []).forEach(function (p) {
                    html +=
                        '<span class="ds-wall-pill" data-type="' + esc(p.type) + '" title="' + esc(p.tag) + '">' +
                        '<strong>' + esc(p.name) + '</strong>' +
                        '<span class="ds-wall-pill__tag">' + esc(p.tag) + '</span>' +
                        '</span>'
                })
                html += '</div></section>'
            })

            html += '</div>'
            mount.innerHTML = html
        })
        .catch(function () {
            mount.innerHTML =
                '<p class="ds-wall__err">无法加载连接器目录（请用 HTTP 打开本站）。</p>'
        })
})()
