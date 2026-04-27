;(function () {
    var host = document.getElementById('hot-topic-source-board')
    if (!host) return

    function esc(s) {
        return String(s || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
    }

    function itemMarkup(item) {
        return (
            '<li class="hot-watch-item">' +
                '<a href="' + esc(item.link || '#') + '" target="_blank" rel="noopener noreferrer">' + esc(item.title || '未命名条目') + '</a>' +
                (item.date ? '<span class="hot-watch-item__date">' + esc(item.date) + '</span>' : '') +
                (item.note ? '<p>' + esc(item.note) + '</p>' : '') +
            '</li>'
        )
    }

    function sourceMarkup(source) {
        var items = source.items || []
        return (
            '<article class="hot-watch-card">' +
                '<div class="hot-watch-card__topline">' +
                    '<span class="hot-watch-card__label">' + esc(source.label) + '</span>' +
                    '<span class="hot-watch-card__kind">' + esc(source.kind) + '</span>' +
                '</div>' +
                '<p class="hot-watch-card__note">' + esc(source.notes || '') + '</p>' +
                (
                    source.current_issue && source.current_issue.link
                        ? '<p class="hot-watch-card__issue"><a href="' + esc(source.current_issue.link) + '" target="_blank" rel="noopener noreferrer">' + esc(source.current_issue.title || '当前日报入口') + '</a></p>'
                        : ''
                ) +
                '<div class="hot-watch-card__routes"><strong>推荐落点：</strong> ' + esc((source.route_hints || []).join(' / ')) + '</div>' +
                (
                    source.error
                        ? '<p class="hot-watch-card__error">抓取失败：' + esc(source.error) + '</p>'
                        : '<ol class="hot-watch-card__list">' + items.map(itemMarkup).join('') + '</ol>'
                ) +
            '</article>'
        )
    }

    fetch(host.getAttribute('data-hot-topic-src') || 'data/hot-topic-snapshot.json')
        .then(function (res) { return res.json() })
        .then(function (payload) {
            var sources = payload.sources || []
            var meta = payload.meta || {}
            if (!sources.length) {
                host.innerHTML = '<div class="course-quote"><p>还没有本地热点快照。先运行 <code>python3 tools/fetch_hot_topic_sources.py --write</code>。</p></div>'
                return
            }
            host.innerHTML =
                '<p class="hot-watch-board__meta">快照时间：' + esc(meta.generated_at || 'unknown') + ' · 来源数：' + esc(meta.source_count || sources.length) + '</p>' +
                '<div class="hot-watch-card-grid">' + sources.map(sourceMarkup).join('') + '</div>'
        })
        .catch(function () {
            host.innerHTML = '<div class="course-quote"><p>热点快照加载失败。请先运行 <code>python3 tools/fetch_hot_topic_sources.py --write</code>。</p></div>'
        })
})()
