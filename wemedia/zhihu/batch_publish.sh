#!/bin/bash
# 批量发布脚本
# 用法: ./batch_publish.sh [文章目录] [间隔秒数]

ARTICLES_DIR="${1:-./articles}"
INTERVAL="${2:-300}"  # 默认 5 分钟间隔

echo "📚 批量发布脚本"
echo "📂 文章目录: $ARTICLES_DIR"
echo "⏱️ 发布间隔: ${INTERVAL} 秒"
echo ""

# 统计文章数量
count=$(ls -1 "$ARTICLES_DIR"/*.md 2>/dev/null | wc -l)
echo "📄 找到 $count 篇文章"
echo ""

if [ $count -eq 0 ]; then
    echo "❌ 未找到 Markdown 文件"
    exit 1
fi

# 确认发布
read -p "确认开始批量发布? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "已取消"
    exit 0
fi

# 开始发布
current=0
for article in "$ARTICLES_DIR"/*.md; do
    current=$((current + 1))
    filename=$(basename "$article")

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📝 [$current/$count] 发布: $filename"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    node publish_article.js "$article"

    if [ $current -lt $count ]; then
        echo ""
        echo "⏳ 等待 ${INTERVAL} 秒后继续..."
        sleep $INTERVAL
    fi
done

echo ""
echo "✅ 批量发布完成！共发布 $count 篇文章"
