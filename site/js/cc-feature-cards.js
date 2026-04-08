/**
 * Experimental / hidden-feature cards + detail panel — cc-overview.json → feature_cards
 * Mount: <div id="cc-feature-cards-mount" data-json="data/cc-overview.json">
 */
;(function () {
    var mount = document.getElementById('cc-feature-cards-mount')
    if (!mount) return

    var jsonUrl = mount.getAttribute('data-json') || 'data/cc-overview.json'
    var cardsData = []

    function esc(s) {
        return String(s || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
    }

    function renderDetail(card) {
        var panel = mount.querySelector('.cc-feature-detail')
        var titleEl = mount.querySelector('.cc-feature-detail__title')
        var bodyEl = mount.querySelector('.cc-feature-detail__body')
        var linksEl = mount.querySelector('.cc-feature-detail__links')
        if (!panel || !titleEl || !bodyEl || !linksEl) return

        titleEl.textContent = card.title || ''
        var paras = String(card.body || '')
            .split(/\n\n+/)
            .map(function (p) {
                return p.trim()
            })
            .filter(Boolean)
        bodyEl.innerHTML = paras
            .map(function (p) {
                return '<p>' + esc(p) + '</p>'
            })
            .join('')

        linksEl.innerHTML = ''
        ;(card.links || []).forEach(function (L) {
            var a = document.createElement('a')
            a.href = L.href || '#'
            a.className = 'cc-feature-detail__link'
            a.textContent = L.text || L.href
            linksEl.appendChild(a)
        })

        panel.hidden = false
        var closeBtn = mount.querySelector('.cc-feature-detail__close')
        if (closeBtn) closeBtn.focus()

        mount.querySelectorAll('.cc-feature-card').forEach(function (btn) {
            var active = btn.getAttribute('data-card-id') === card.id
            btn.classList.toggle('cc-feature-card--active', active)
            btn.setAttribute('aria-pressed', active ? 'true' : 'false')
        })
    }

    function closeDetail() {
        var panel = mount.querySelector('.cc-feature-detail')
        if (panel) panel.hidden = true
        mount.querySelectorAll('.cc-feature-card').forEach(function (btn) {
            btn.classList.remove('cc-feature-card--active')
            btn.setAttribute('aria-pressed', 'false')
        })
    }

    fetch(jsonUrl)
        .then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status)
            return r.json()
        })
        .then(function (data) {
            var block = data.feature_cards
            if (!block || !block.cards || !block.cards.length) {
                mount.innerHTML = ''
                return
            }

            cardsData = block.cards

            var html =
                '<p class="cc-feature-cards__hint">点击卡片查看说明；按 <kbd>Esc</kbd> 关闭详情。</p>'
            if (block.note_zh) {
                html += '<p class="cc-feature-cards__note">' + esc(block.note_zh) + '</p>'
            }
            html += '<div class="cc-feature-cards__grid" role="list">'

            block.cards.forEach(function (c) {
                var id = esc(c.id || '')
                html +=
                    '<button type="button" class="cc-feature-card" role="listitem" data-card-id="' +
                    id +
                    '" aria-pressed="false">' +
                    '<span class="cc-feature-card__spark" aria-hidden="true">✦</span>' +
                    '<span class="cc-feature-card__title">' +
                    esc(c.title) +
                    '</span>' +
                    '<span class="cc-feature-card__blurb">' +
                    esc(c.blurb) +
                    '</span>' +
                    '</button>'
            })

            html += '</div>'
            html +=
                '<div class="cc-feature-detail" hidden role="region" aria-label="特性说明">' +
                '<div class="cc-feature-detail__inner">' +
                '<button type="button" class="cc-feature-detail__close" aria-label="关闭详情">×</button>' +
                '<h3 class="cc-feature-detail__title"></h3>' +
                '<div class="cc-feature-detail__body"></div>' +
                '<div class="cc-feature-detail__links"></div>' +
                '</div></div>'

            mount.innerHTML = html

            mount.querySelectorAll('.cc-feature-card').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var id = btn.getAttribute('data-card-id')
                    var card = cardsData.find(function (x) {
                        return x.id === id
                    })
                    if (card) renderDetail(card)
                })
            })

            var closeBtn = mount.querySelector('.cc-feature-detail__close')
            if (closeBtn) {
                closeBtn.addEventListener('click', function () {
                    closeDetail()
                })
            }

            document.addEventListener('keydown', function (ev) {
                if (ev.key !== 'Escape') return
                var panel = mount.querySelector('.cc-feature-detail')
                if (panel && !panel.hidden) {
                    ev.preventDefault()
                    closeDetail()
                }
            })
        })
        .catch(function () {
            mount.innerHTML =
                '<p class="cc-feature-cards__err">无法加载特性卡片数据（请用 HTTP 打开本站）。</p>'
        })
})()
