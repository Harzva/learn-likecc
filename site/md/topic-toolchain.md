# 工具链专题
> **更新时间**: 2026-04-12

> **在线页面**: https://harzva.github.io/learn-likecc/topic-toolchain.html  
> **本文件**: `site/md/topic-toolchain.md`

## 专题说明

把以下四页合并为一个专题入口：

- [工具链阅读 / 从编辑器到 Agent](../column-agent-journey.html)
- [上手与踩坑](../column-shangshou-cikeng.html)
- [渠道评测](../column-channel-review.html)
- [开发日志](../devlog.html)

## 阅读顺序建议

1. 先看 **工具链阅读**，建立个人工具迁移背景。
2. 再看 **上手与踩坑**，抓可复用结论与避坑路径。
3. 然后看 **渠道评测**，理解不同付费与渠道形态的实际体验。
4. 然后看 **Show me your usage**，把“确有在用”的透明度补上。
5. 最后看 **开发日志**，补足站点与项目本身的演进过程。

## 近期工具链热点

这轮从 `site/data/hot-topic-snapshot.json` 的 `Hugging Face Blog` lane，把一条更适合长期沉淀到工具链专题的官方博客信号接了下来：

- [Safetensors is Joining the PyTorch Foundation](https://huggingface.co/blog/safetensors-joins-pytorch-foundation)

它值得进这页，而不是只停留在热点 intake 层，因为它讨论的不是短期模型热度，而是：

- 模型文件格式
- 分发安全
- 生态治理
- 跨框架工具链稳定性

如果你在关心模型下载、权重交换、推理部署和开源生态协作，这类“基础设施归属变化”比单次模型发布更像长期工具链信号。上游入口仍是 `topic-hot-watch`，但稳定解释层更适合放到工具链专题。

## 备注

- [Show me your usage](../column-show-your-usage.html) 现在作为工具链专题里的一个子专题保留，更偏“用量自证 / 透明度页”。
- [Design/UI 专题](../topic-design-ui.html) 已单独成立，负责收 `LivePPT / Slidev / Remotion` 这条讲解、演示与程序化视频表达线。
