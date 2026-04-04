# 从编辑器到 Agent：一条工具链上的个人阅历

个人折腾记录与主观感受，**不是**教程或采购建议；已隐去账号细节、精确额度、任何可复现的密钥与端点。

- **在线专栏**：https://harzva.github.io/learn-likecc/column-agent-journey.html  
- **站内 MD 镜像**：`site/md/column-agent-journey.md`（[GitHub 上查看](https://github.com/Harzva/learn-likecc/blob/main/site/md/column-agent-journey.md)）

---

## 写在前面

这是一份给自己留底的**阅历随笔**，后面会接到「个人项目经历」展示里。逻辑我稍微顺过一遍，但语气尽量保持原来那种——**坑、白嫖、丝滑、断流**这些词就留着了，真实一点。

说白了就是**热爱这个赛道**：新工具出来就想摸，**比写论文爽多了**——**体验即动机**，不是为了写进简历才点下载。

---

## 我摸过哪些「宿主」与 Trae 时间线

**Trae**：我印象里**差不多 2025 年 3 月前后**就开始用了——和公开报道**对得上**：多家媒体稿写 Trae **国内版在 2025 年 3 月初**集中上线（例如中国经济网、IT 媒体等 3 月 3 日前后稿）；更早在 **2025 年 1 月**已有国际向/M 版迭代。所以要**分清**：三月我摸的很可能是 **AI IDE 本体**；而大家后来吹爆的 **Solo**，在公开材料里多是 **2025 年 7 月后**才作为重头戏推出来——时间线别混在一起，但「早就上车」这件事没毛病。

**Trae Solo** 依旧主观一句：**非常惊艳**；而且**国内更新跟得快**，这点很加分。

**Agent / 编程助手向**里，我还体验过（或深度白嫖过）：**Qoder**、**Trae**、**Cursor**、谷歌 **Antigravity（反重力）**、**VS Code**（插件与内置 Agent 形态）、**Codex / Claude Code** 等 CLI 线，以及 **Kiro**（口述常写成 Krio）一类编辑器形态（只玩过编辑器版本）。

- **谁当主力？**我**从来没把 Cursor 当固定主力**；更常见的是 **Qoder、Trae、Antigravity、VS Code、Codex、Claude Code** 等**轮换上阵**——阶段性谁顺手谁就上前排。
- **Cursor**：也在池子里，付过费、会打开用，但不是「默认开机只开它」那一个。
- **Antigravity**：后面单独开喷（也会夸 workflow）。

**付费**方面：Qoder 付过一个月加首月，其余主要靠活动/邀请；Trae 有过两个月左右叠加春节活动；Cursor 付过一个月，**学生认证没薅成功**。

**一直没开 Claude 官方订阅**，主要是怕风控封号，心理负担大。

**CLI / 终端向**：Claude 系、**Codex**（多账号轮换着用）、**Gemini CLI**。

**VS Code 插件**：所谓「三巨头」对应的插件形态都摸过。**Copilot** 只用过插件版，但不得不说——**和各家模型打通之后，可玩性是真的不错**。

---

## 从「Claude Code 火了」到「一发不可收拾」

后来一直刷到 **Claude Code** 火，但**当时没用**：心里觉得有**门槛**——命令行、偏 Vim 系操作，像是「大佬才配」；我**一直比较依赖编辑器界面**，对纯 CLI 天然怵。

直到有一天，群里**表格、对比、推理一条条甩出来**，反复强调它好用。我心想：行吧，试试。结果**一试就不可收拾**，正式走上 **Agent 之路**——从**怎么用**到**原理**，一路摸过来。

摸下来发现：**CLI 模式其实也不错**；而且后面 **VS Code 插件**也跟上了，心里那道「没界面就不敢用」的坎慢慢平了。

但**中间很坎坷**：**官方 Claude Code** 对我来说一度**根本不能当默认解**——一头是**贵**，一头是**封号**风险。于是就出现了前文说的那一整段：**一边方便时体验各种 Agent**，一边**认真找能嵌进自己工作流**的工具。说白了，**体验也不是白体验**：是一点点**见证这些工具变好**、**使用门槛和成本在降**。

---

## 白嫖与用量（只谈现象，不谈可复制细节）

有些渠道是**云厂商活动价**买到的大包 token（例如人民币几十块档、标称「亿级」的那种），多账号累计下来，**实际消耗已经跑到更高的数量级**——我**盲猜**某些路由后面如果按「高档模型」倍率计费，账单会**异常夸张**（比如坊间说的百倍增耗那种传说，未核实，纯体感）。

另外是 **Google / Gemini 侧大额试用或活动额度（美元档）**、以及 **GitHub Copilot 教育权益**等——具体数字和账号数就不写了，避免被当成教程。

**底线**：白嫖归白嫖，**密钥轮换、限额、告警**该开就开；别在群里晒完整 key。

---

## 反代 API（只讲结构，不讲配方）

下面这些我都**试过概念**，**不会**写任何可照抄的 URL、Header 或密钥文件路径。

1. 用 **Antigravity 体系里的 tool 能力** 做**反代 API**，接到 **Claude Code** 上——能跑，但心里不踏实，而且链路一长就烦。
2. 用 **Codex** 去接 Claude Code：**不够丝滑**，而且 **token 烧得明显快**。
3. **Cherry Studio**、**ccswitch** 这类：主要用来**测一下 key / 端点是否通**，属于工具箱里的「万用表」。
4. Linux 上折腾过 **antissh** 一类——本质还是把 **Antigravity** 或 **Gemini** 相关流量**弯到本地**再出去；和「远程机不能开 TUN」之类场景绑在一起，下面单独说。

5. 名字在群里见过的：**小龙虾**、**OpenClaw**、**Copaw**、**cc-connect**、**aionuip** 等——有的试过一两脚，有的只围观；生态变得太快，**不保证你现在搜到的还是同一个东西**。

6. **最早**搞 Claude Code 连 **remote** 的时候，**Auth JSON 手动拷到远程**、**本机/服务器谁翻墙**、**端口流量怎么走**——全是先决条件；现在工具链成熟多了，**这些土办法基本算过时故事**，但那段记忆很深刻。

---

## Antigravity：爱过，累过

**特别喜欢它早期那种 workflow 感**——虽然现在看，重要性被稀释了：因为后来 **Claude Code 里 `/command`、`/+command` 一套**也能把「固定流水线」钉死，和 **Skills** 还不完全是一回事（Skills 更偏可复用能力包）。

我还干过很蠢但很时代眼泪的事：基于 **CV 自动点 Continue**，让流程自己往下跑，去**审稿、改论文**——本质就是把「workflow」用暴力续杯。现在模型和官方能力都上来了，这种野路子**仅作考古**。

**槽点**也实在：

- **不流畅，经常断，要手动 Continue**——体验极差。
- **好处**是曾经能蹭到**顶级模型**，但**额度被砍了又恢复一点**这种事，心累。
- **Gemini 做 UI / 前端很漂亮**；但**科研向实验、严谨推导**，主观感觉**总比 Opus / GPT 慢半代**。
- **本地登录 Antigravity** 先过鬼门关：**TUN 模式**、代理、证书、远程环境不能 TUN 时就要 **antissh**、自己写脚本，或者 **ProxyBridge**（exe 要配、LLM 相关服务也要挂进去——**全是坑，一点点摸出来的**）。**Clash 系**下面有时流量统计**怪怪的**，后来干脆**不指望按软件分流**，直接 **TUN 全局**（费流量但省心）。**Proxifier** 还要会员，更烦。
- 最终：**Antigravity 本体也不流畅**；**反代**如果上工具，有人推 **Cliproxy** 一类（多登录、多账号管理、各种反代甚至 Copilot——**仅作名词提及，不构成背书**），我试过，**仍不够丝滑**，**干脆不用了**。

---

## MCP、Skills、子代理，以及我最在意的 Loop

后面行业里陆续有了 **MCP**、**Skills** 这些概念——主观感受上，**Claude Code 这一侧先把想法讲圆了**，确实**巧**。我也曾在**别的智能体 / IDE**里搭自己的 Skills、接 MCP，能跑，但**不够丝滑**；再后来大家**都上了** Skill、MCP、Subagent 这一套，算是**整条赛道在补课**。

说到底，我**最喜欢 Claude Code 的还是 Loop**。最早社区里有人叫 **Ralph loop**，还要**额外装插件**；现在**产品里自带了**，太好用。一开始 Loop 对我来说就是「**把这件事做完**」；到后来能 **cron**、**定时唤醒**——我**曾在别处写过短文**，主张 Agent 的**长程 runtime**得加强「**时间观念**」；现在这些能力**真的长出来了**，而且实现得**很巧**：**对时间的感知也很丝滑**，像人**抬手看一眼手表**那种丝滑。**调用工具**也丝滑。

网上还刷到过一种暴论：**RAG 以后说不定会被 Agent 挤掉一块**，因为 Agent 手里有 `grep`、能进仓库里**现搜现用**——我**不当结论采信**，但**这个梗我记住了**。

再往深想一层（**纯个人胡想，不当预测**）：**动手查、动手翻仓库**本来就是 Agent 框架里很妙的一块——有点像「检索」不必**非得向量库**一条道，**短时间里** RAG 肯定不会整块消失，但工程上的那些**临时绝活**（各种 temp 技巧）会跟着模型变强而**改写法**。

另一个感受：**Computer use** 这类事，以前是**强烈依赖 harness / Agent 框架**才能凑出来；现在 **GPT-5.4、Claude Opus** 一类在训练里已经吃进了**点鼠标、操界面**这类行为，**原生就能干**。再往推演一句更狂的（**仍是推论**）：今天的 **harness engineering**、插件式编排，**以后没准也会以「数据」的形式被蒸馏回模型里**——**大模型一直在扩自己的边界**；你也能在 **MCP、Skills、computer use** 叠在一起的热闹里，看到**同一条趋势的投影**。

把这条线再**拧一句**（还是**随笔**）：**早先**更指望模型吐出**又稳又结构化的指令**，任务甩给后台，旁边总得有个**「执行器」一直在等**——不然命令谁来跑？**现在**模型把自己能吞的能力**往里收**，**执行器**和**模型侧**的边界就**越来越糊**。

再补半句更**玄学的**（**别当真**）：未必永远只是「**缸中之脑**」那种隐喻——**只要接上**工具、屏幕、会话环境这些**广义的手脚**，**它会一路适应**；不是说「什么都能学会」，而是**可接的那部分边界一直在涨**。

以上**句句可当耳旁风**，权当**今天这组胡思乱想**；写进文里只是留个时间戳。

**大趋势一句话**：绕了一大圈，**最终还是回归 Claude Code**。

---

## 现在重心在哪

上面那句不是口号：**日常默认还是 Claude Code 这条线**。编辑器侧则与 **Qoder、Trae、Antigravity、VS Code** 等继续轮换；**Cursor 的独立 Agent 模式**（有点像 Trae Solo）和 **智谱系 Zed** 也会按需点开——整体都是**以 Agent 为中心的 IDE 环境**，不是「以编辑器为中心、人手撸每一行给人看」。

模型越来越好的时候，**vibe coding** 里人到底是**指挥**还是**甲方**？越常「只要结果不看过程」，爽和风险越大——**代码你不读，锅就是你的**。

---

## PATH 里的脚本：索引 + 脱敏示例

本机（常见如 `/usr/local/bin` 或自管 `~/bin`）里攒了一堆**只为工作流更丝滑**的脚本。下表是**索引**；下面每个小标题附带**可复制改写的示意代码**——路径、端口、Token 均为**占位**，勿把真实密钥写进仓库。

| 名字（示意） | 大致干什么 |
|-------------|------------|
| `ccswitch` / `codexswitch` | 多套 CLI / 配置目录切换 |
| `mtool`（及同类网关 CLI） | 配置在 YAML/JSON；安装后进 `PATH`，全局子命令切换 profile / 重载 |
| `clashproxy` / `proxy_manager.sh` | 代理环境变量 on/off |
| `glmclaude` | 子 shell 注入变量后 `exec claude`（占位） |
| `installAntigravity.sh` | 考古向安装骨架 |
| `aionuip` | UI 自动化延时 + 点击示意 |
| `mylaunch` | `cd` 工程 + Zellij attach/create |
| `frpc` | 内网穿透 ini 示意（仅实验） |

### `mtool` 等：配置文件里写全，全局命令只管切换

**区别**：`ccswitch` 多是自写 bash 改环境变量指向另一配置根；**`mtool` 类**通常是**一个二进制**读 `~/.config/...` 下 YAML/JSON，通过 **PATH 里的子命令**（`profile list` / `use` / `doctor` 等，**以你安装版本 `--help` 为准**）切换。密钥只放配置文件引用环境变量或密钥链，勿写进仓库。

**接上全局命令**：安装到 `~/.local/bin` 或 `/usr/local/bin`，或 `ln -s` 到 `~/bin`；新终端 `which mtool` 自检。

**与 Claude Code 联用**：常配合 `ANTHROPIC_BASE_URL` 指向本机监听；顺序示意：代理（若需）→ 启 mtool → `ccswitch` 或启动 `claude`。

```yaml
# ~/.config/mtool/config.yaml 示意
version: 1
current_profile: default
profiles:
  default:
    listen: "127.0.0.1:11435"
    upstream_base: "https://example.invalid/v1"
  work:
    listen: "127.0.0.1:11436"
    upstream_base: "https://corp-gateway.example.invalid/v1"
```

```bash
#!/usr/bin/env bash
exec "${HOME}/.local/lib/mtool/bin/mtool" "$@"
```

```bash
# mtool version
# mtool profile list
# mtool profile use work
```

### `ccswitch` / `codexswitch`

```bash
#!/usr/bin/env bash
PROFILE="${1:-default}"
export CLAUDE_CONFIG_DIR="${HOME}/.config/claude-profiles/${PROFILE}"
mkdir -p "$CLAUDE_CONFIG_DIR"
echo "Active profile: ${PROFILE} -> ${CLAUDE_CONFIG_DIR}"
```

```bash
#!/usr/bin/env bash
PROFILE="${1:-work}"
export CODEX_HOME="${HOME}/.codex/${PROFILE}"
echo "CODEX_HOME=${CODEX_HOME}"
```

### `clashproxy` / `proxy_manager.sh`

```bash
export HTTP_PROXY="http://127.0.0.1:7890"
export HTTPS_PROXY="http://127.0.0.1:7890"
export ALL_PROXY="socks5://127.0.0.1:7891"
export NO_PROXY="localhost,127.0.0.1"
```

```bash
unset HTTP_PROXY HTTPS_PROXY ALL_PROXY http_proxy https_proxy all_proxy
```

### `glmclaude`

```bash
#!/usr/bin/env bash
# export ANTHROPIC_BASE_URL="https://example.invalid/v1"
# export ANTHROPIC_AUTH_TOKEN="${MY_SECRET_FROM_ENV:-}"
exec claude "$@"
```

### `installAntigravity.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail
echo "Replace with real vendor download + verify + install steps."
```

### `aionuip`

```bash
#!/usr/bin/env bash
sleep 2
# xdotool search --name "SomeApp" windowactivate
# xdotool mousemove 400 300 click 1
echo "Wire to your UI automation stack."
```

### `mylaunch`

```bash
#!/usr/bin/env bash
PROJECT_ROOT="${HOME}/path/to/your-repo"
cd "$PROJECT_ROOT" || exit 1
SESSION="agent-dev"
LAYOUT="${HOME}/.config/zellij/agent.kdl"
if zellij list-sessions 2>/dev/null | grep -q "^${SESSION}$"; then
  zellij attach "$SESSION"
else
  zellij --layout "$LAYOUT" --session "$SESSION"
fi
```

### `frpc`

```ini
[common]
server_addr = YOUR_FRPS_HOST
server_port = 7000
token = YOUR_TOKEN_PLACEHOLDER
[ssh-tunnel]
type = tcp
local_ip = 127.0.0.1
local_port = 22
remote_port = 60022
```

### `claudep`（仅隔离环境）

```bash
#!/usr/bin/env bash
exec claude --dangerously-skip-permissions "$@"
```

### Zellij 布局（示意）

```text
layout {
  default_tab_template {
    pane size=1 split_direction="vertical" {
      pane
      pane size=2 split_direction="horizontal" { pane; pane; }
    }
  }
}
```

---

## 小结

这是一条**从编辑器依赖到接受 CLI**、从**到处试 Agent**到**又绕回 Claude Code**的路；中间**反代、额度、封号**都算学费。若你也在走类似路径：**合规第一、密钥最小暴露、链路越短越省心**。技术细节仍以各产品官方文档与开源课程正文为准；本篇仅作**个人侧记**。

---

*仓库路径：`wemedia/zhihu/articles/11-从编辑器到Agent-工具链个人阅历.md` — 与 `site/md/column-agent-journey.md` 同源迭代。*
