# Commit Ledger

这个文件专门记录关键 commit 的用途、相对上一版本的变化，以及是否适合作为源码基线。

使用约定：

- 每次涉及版本锚点、源码线切换、可运行性修复、release 基线调整时，都要补一条记录。
- 每条记录至少写清楚：
  - `commit`
  - `scope`
  - `relative to previous`
  - `status`
  - `notes`
- 如果只是普通小修，不强制逐条登记；但一旦影响“基线能否运行”或“某条源码线代表什么”，必须登记。

---

## 2026-04-07

### `6a1afe3`

- `scope`: `ccsource/CC/claude-code-rebuild` 的重建基线锚点
- `relative to previous`: 对应“重建完成、程序可运行”的阶段，还没有叠加 Like Code 的 tab、panel、Web UI、多 Provider 等后续定制能力
- `status`: 当前保留为 rebuild 基线
- `notes`: 这是目前最适合承担“可运行重建基线”职责的 commit

### `c75951f`

- `scope`: rebuild 历史中的更晚阶段
- `relative to previous`: 比 `6a1afe3` 更靠后，提交信息指向“功能测试完成 / 稳定运行”方向
- `status`: 暂不作为 rebuild 基线
- `notes`: 可以作为候选参考，但已经不是最纯的“重建完成未加新功能”状态

### `50b6fb0`

- `scope`: rebuild 历史中的更晚阶段
- `relative to previous`: 比 `6a1afe3` 更靠后，进入后续演进阶段
- `status`: 暂不作为 rebuild 基线
- `notes`: 如果未来希望换成“更晚但仍未进入 Like Code 功能线”的锚点，可以重新对比评估

### `a1531fb`

- `scope`: rebuild 历史中的更晚阶段
- `relative to previous`: 比 `6a1afe3` 更靠后，属于后续演进提交
- `status`: 暂不作为 rebuild 基线
- `notes`: 当前不切换，先保持 rebuild 语义稳定

### `57ad57f`

- `scope`: 修复 `ccsource/CC/claude-code-rebuild` 的 REPL 启动
- `relative to previous`: 在不改 `~/.claude.json`、不引入 Like Code 新功能的前提下，把 rebuild 从“表面卡在启动”修到“可进入交互 REPL”
- `status`: 当前有效
- `notes`:
  - 补齐 `TungstenLiveMonitor.tsx`
  - 补齐 `utils/ultraplan/prompt.txt`
  - 移除 `ScrollBox.tsx` 里的错误导入
  - 将 `AppState.tsx` 的 `useEffectEvent` 改为兼容的 `useCallback`
  - 给 sandbox adapter 增加兼容 stub
  - 保留最小启动诊断链，方便继续排查

### `v1.0.2-likecode`

- `scope`: Like Code 第一阶段工作台发布节点
- `relative to previous`: 相对 `v1.0.1-likecode`，新增 tab / panel / pane 状态隔离雏形、localhost Web UI 观察台、rebuild 基线修复与分层源码治理
- `status`: 当前发布目标
- `notes`:
  - tab、panel、pane 相关能力进入第一版可用状态
  - localhost Web UI 已能展示 session / pane / transcript / workflow
  - `ccsource/CC/claude-code-rebuild` 已重新恢复到可进入交互 REPL
  - 启动头视觉继续打磨，窄终端下也保留装饰线，并支持随机小动物与固定 RGB 蓝色
