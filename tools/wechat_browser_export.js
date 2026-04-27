(() => {
  const pickText = (selectors) => {
    for (const selector of selectors) {
      const node = document.querySelector(selector);
      const text = node && node.textContent ? node.textContent.trim() : "";
      if (text) return text;
    }
    return "";
  };

  const slugify = (value) =>
    (value || "wechat-article")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
      .replace(/^-+|-+$/g, "") || "wechat-article";

  const triggerDownload = (filename, content, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const articleRoot =
    document.querySelector("#js_content") ||
    document.querySelector(".rich_media_content") ||
    document.querySelector("article");

  if (!articleRoot) {
    console.error("No WeChat article content container found. Open the article page first.");
    return;
  }

  const title =
    pickText(["#activity-name", ".rich_media_title", "h1"]) ||
    document.title ||
    "wechat-article";
  const author = pickText(["#js_name", ".account_nickname_inner", ".rich_media_meta_nickname"]);
  const publishTime = pickText(["#publish_time", ".rich_media_meta.rich_media_meta_text"]);
  const canonicalUrl =
    document.querySelector('meta[property="og:url"]')?.content ||
    document.querySelector('link[rel="canonical"]')?.href ||
    location.href;

  const clonedContent = articleRoot.cloneNode(true);

  clonedContent.querySelectorAll("img").forEach((img) => {
    const src =
      img.getAttribute("data-src") ||
      img.getAttribute("data-origin-src") ||
      img.getAttribute("data-actualsrc") ||
      img.getAttribute("src") ||
      "";
    if (src) {
      img.setAttribute("src", src);
    }
    img.removeAttribute("style");
    img.removeAttribute("width");
    img.removeAttribute("height");
  });

  clonedContent.querySelectorAll("script, style").forEach((node) => node.remove());

  const data = {
    title,
    author,
    publish_time: publishTime,
    canonical_url: canonicalUrl,
    exported_at: new Date().toISOString(),
    html: clonedContent.innerHTML,
    text: clonedContent.innerText.replace(/\u00a0/g, " ").replace(/\n{3,}/g, "\n\n").trim(),
  };

  const slug = slugify(title);
  const htmlDoc = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
    body { max-width: 760px; margin: 40px auto; padding: 0 16px; font: 16px/1.7 -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif; color: #222; }
    h1 { font-size: 32px; line-height: 1.25; margin-bottom: 12px; }
    .meta { color: #666; margin-bottom: 24px; }
    img { max-width: 100%; height: auto; display: block; margin: 16px auto; }
    a { color: #0a66c2; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="meta">${[author, publishTime, canonicalUrl].filter(Boolean).join(" | ")}</div>
  <article>${data.html}</article>
</body>
</html>`;

  triggerDownload(`${slug}.json`, `${JSON.stringify(data, null, 2)}\n`, "application/json;charset=utf-8");
  triggerDownload(`${slug}.txt`, `${data.text}\n`, "text/plain;charset=utf-8");
  triggerDownload(`${slug}.html`, htmlDoc, "text/html;charset=utf-8");

  console.log("WeChat article exported:", {
    title,
    author,
    publishTime,
    canonicalUrl,
    files: [`${slug}.json`, `${slug}.txt`, `${slug}.html`],
  });
})();
