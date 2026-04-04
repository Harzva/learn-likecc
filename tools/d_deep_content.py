# ruff: noqa: E501
"""Rich HTML bodies for D01–D12 (inserted after Mermaid figure). Index 0 = D01."""

DEEP_BODIES: list[str] = [
    # D01 Agent Loop
    """
                <section class="section-block">
                    <h2>🔬 深挖目标</h2>
                    <p>把「一轮循环」拆成<strong>可调试的状态机</strong>：模型返回什么会触发继续转圈？什么会干净退出？工具结果如何<strong>无损回流</strong>到下一轮上下文？</p>
                </section>

                <section class="section-block">
                    <h2>📍 建议检索入口（以官方 Claude Code 仓库为准）</h2>
                    <ul>
                        <li>从 S01 提到的 <code>QueryEngine</code> 一带入手，全文搜索 <code>tool_use</code>、<code>stop_reason</code>、<code>assistant</code> 消息追加逻辑。</li>
                        <li>区分两条链路：<strong>模型侧</strong>（流式 chunk 解析）与 <strong>宿主侧</strong>（执行工具、写回 <code>tool_result</code>）。</li>
                    </ul>
                </section>

                <section class="section-block">
                    <h2>🧩 状态机要点</h2>
                    <table class="options-table">
                        <tr><th>观察信号</th><th>宿主通常行为</th></tr>
                        <tr><td>响应中含未完成 tool 调用</td><td>等待参数收齐 → 走权限门 → 执行 → 构造 tool_result 消息</td></tr>
                        <tr><td>模型声明停止调用工具</td><td>进入「仅展示/等待用户」分支，循环结束或等待新输入</td></tr>
                        <tr><td>流中断 / 解析异常</td><td>区分可重试（网络）与不可重试（协议损坏）；记录已消耗的 partial 状态</td></tr>
                    </table>
                </section>

                <section class="section-block">
                    <h2>⚠️ 边界与坑</h2>
                    <ul>
                        <li><strong>消息顺序</strong>：tool_result 必须挂在对应 tool_use 之后，否则多工具并行时会乱序。</li>
                        <li><strong>嵌套与深度</strong>：子代理 / 任务系统可能在同一会话里叠加多圈 loop，注意「哪一层」在消费 tool_result。</li>
                        <li><strong>反压</strong>：长输出工具若一次灌满上下文，会提前触发压缩（见 D05）。</li>
                    </ul>
                </section>

                <section class="section-block">
                    <h2>📖 走读顺序（90 min 量级）</h2>
                    <ol>
                        <li>找到「从模型响应解析出 tool 调用」的函数，列出它返回的结构体字段。</li>
                        <li>跟踪到「执行工具」唯一入口，确认是否<strong>先</strong>权限再执行（应如此）。</li>
                        <li>找到「把结果写回 messages」的代码，标注与 D02、D03 的交界文件。</li>
                    </ol>
                </section>

                <section class="section-block" id="d01-practice-min-loop">
                    <h2>✏️ 实践练习 1：最小 Agent Loop（仅 Bash）</h2>
                    <p><strong>任务</strong>：写一个最小宿主：只注册一个 <code>bash</code> 工具，循环调用模型直到<strong>不再出现 tool_use</strong>（或达到最大轮数）。</p>
                    <p><strong>参考答案（思路）</strong>：</p>
                    <ol>
                        <li>构造初始 <code>messages = [user]</code>，<code>tools</code> 仅含 bash 的 JSON Schema（<code>command: string</code>）。</li>
                        <li>每轮：<code>response = api.messages.create(..., messages, tools)</code>。</li>
                        <li>若响应的 <code>stop_reason</code> 为 <code>end_turn</code> 且 <code>content</code> 中<strong>没有</strong> <code>tool_use</code> 块 → <strong>退出循环</strong>，把 assistant 文本展示给用户。</li>
                        <li>否则对每个 <code>tool_use</code>：<code>spawn bash -c</code>（或受限 shell）→ 追加一条 assistant 消息（含本轮全部 content 块）→ 再追加 <code>tool_result</code> 消息（<code>tool_use_id</code> 对齐）。</li>
                        <li>加保险：<code>max_turns</code>、单次命令超时、工作目录白名单。</li>
                    </ol>
                    <div class="code-block">
                        <pre><code class="language-typescript">/**
 * 最小 Agent Loop：只注册 bash，反复调用模型直到本轮响应里不再出现 tool_use。
 * 与具体厂商无关：把 model.create / 消息结构换成你用的 SDK 即可。
 */
const MAX_TURNS = 40
let turn = 0

while (turn++ &lt; MAX_TURNS) {
  // ① 携带「当前完整 messages + 工具表」请求模型
  const res = await model.create({ messages, tools: [bashTool] })
  messages.push(assistantMessageFrom(res))

  const uses = res.content.filter(isToolUse)
  if (uses.length === 0) {
    // ② 无 tool_use：模型本回合只输出文本或已 end_turn，退出循环
    break
  }

  // ③ 每个 tool_use 必须执行并写回 tool_result，且 tool_use_id 与 assistant 块对齐
  for (const u of uses) {
    const out = await runBash(u.input.command) // 生产环境：此处前插 D03 canUseTool / 策略门
    messages.push(toolResultMessage(u.id, out))
  }
}

// ④ 建议另加：max_turns（上已示例）、单命令超时、工作目录白名单、工具错误计数防死循环</code></pre>
                    </div>
                </section>

                <section class="section-block" id="d01-practice-tools">
                    <h2>✏️ 实践练习 2：扩展 Read / Write / Edit</h2>
                    <p><strong>任务</strong>：在练习 1 的循环不变前提下，增加三个工具：<code>read_file</code>、<code>write_file</code>、<code>apply_patch</code>（或简化版「整文件覆盖写」）。</p>
                    <p><strong>参考答案（要点）</strong>：</p>
                    <ul>
                        <li><strong>注册</strong>：<code>tools</code> 数组并入三条 schema；模型同一轮可并行多个 tool_use，宿主按 id 顺序执行或按拓扑（本练习可先顺序执行）。</li>
                        <li><strong>读</strong>：校验路径在 workspace 内；返回 UTF-8 文本或明确 binary 不可读。</li>
                        <li><strong>写</strong>：先权限（高危）再写入；大文件写入前可要求模型先 read 再写，避免盲覆盖。</li>
                        <li><strong>Edit</strong>：最小实现是「搜索片段替换」；失败时把 diff 失败原因写进 tool_result，让模型重试，<strong>不要</strong>在宿主层伪造成功。</li>
                        <li>与 D02 对齐：每层工具都走同一套「校验 → 权限 → 执行 → ToolResult」。</li>
                    </ul>
                </section>

                <section class="section-block" id="d01-think">
                    <h2>🤔 思考题 · 参考答案</h2>

                    <h3 id="d01-q-stop-reason">为什么用 <code>stop_reason</code> 而不是只看 content 里有没有工具调用？</h3>
                    <ul>
                        <li><strong>协议层语义</strong>：<code>stop_reason</code>（及厂商扩展字段）表达「这一轮模型为何停笔」，是 API 契约的一部分；content 只是载体，不同模型/版本可能把「停顿」表达成空 tool 块、未闭合流、额外 stop 序列等。</li>
                        <li><strong>流式场景</strong>：chunk 到达过程中 content 不完整；若在最后一个 chunk 前用启发式扫字符串，容易把「还在传输的 tool JSON」误判成无工具。</li>
                        <li><strong>多块与混排</strong>：一轮响应可同时含文本 + 多个 tool_use；终止条件应是「本回合模型声明结束且 tool 队列已消费」，而不是简单正则匹配。</li>
                        <li><strong>工程结论</strong>：以 SDK 解析后的结构化结果 + <code>stop_reason</code> 作为状态机输入；content 仅作展示与 tool 参数来源。</li>
                    </ul>

                    <h3 id="d01-q-accumulation">消息累积会导致什么问题？如何解决？</h3>
                    <ul>
                        <li><strong>问题</strong>：上下文窗口溢出；费用与延迟线性上涨；早期无关细节「淹没」当前任务；工具超长输出占满 budget。</li>
                        <li><strong>解法谱系</strong>：① <strong>工具侧截断</strong>（只返回 head/tail + 长度提示）；② <strong>滑动窗口</strong>保留最近 k 轮；③ <strong>摘要/压缩</strong>用边界消息保留锚点（见 <a href="d05.html">D05</a>、<a href="d05.html#d05-think-accumulation">D05 · 工程侧补充</a> 与专题 <a href="topic-source-derived.html#compact-hard">Compact 硬读</a>）；④ <strong>外置记忆</strong>（把大段移出 prompt，按需再 read）；⑤ <strong>子任务拆分</strong>（D06）降低单会话长度。</li>
                    </ul>

                    <h3 id="d01-q-tool-fail">如何处理工具执行失败？</h3>
                    <ul>
                        <li><strong>契约</strong>：向模型返回<strong>结构化失败</strong>——HTTP/SDK 的 <code>is_error</code> 或等价字段 + 可读错误摘要 +（可选）stderr 尾部；与成功路径同一消息类型，避免模型看不到失败。</li>
                        <li><strong>不要</strong>吞异常返回空字符串当成功；否则模型会基于错误状态继续瞎编。</li>
                        <li><strong>策略</strong>：可重试类（网络、429）在宿主层有限次退避；不可重试类（权限、命令不存在）直接交给模型决定换方案；对 bash 可附退出码。</li>
                        <li><strong>护栏</strong>：<code>max_tool_errors_per_turn</code> 防止死循环打同一个坏命令。</li>
                    </ul>
                </section>

                <section class="section-block" id="d01-q-self-seq">
                    <h2>✏️ 自测 1 · 参考答案：消息序列（最小 Loop）</h2>
                    <h3>题干</h3>
                    <p>画出「用户 → 模型 → bash → tool_result → 模型 → end_turn」的消息序列。</p>
                    <h3>参考答案（链式列举）</h3>
                    <ol>
                        <li><code>user</code>：用户目标描述。</li>
                        <li><code>assistant</code>：含 <code>tool_use</code>（bash + 参数）。</li>
                        <li><code>user</code> 角色的 <code>tool_result</code>：附在对应 <code>tool_use_id</code> 上，内容为命令输出或结构化错误。</li>
                        <li><code>assistant</code>：若仍需工具则继续带 <code>tool_use</code>；否则纯文本，<code>stop_reason</code> 常为 <code>end_turn</code>。</li>
                    </ol>
                    <p>多轮时重复 2–4，直到无未决 <code>tool_use</code> 或达到轮数上限。</p>
                </section>

                <section class="section-block" id="d01-q-self-recap">
                    <h2>✏️ 自测 2 · 参考答案：三道思考题一句话复述</h2>
                    <h3>题干</h3>
                    <p>对照上文三道思考题，用自己的话各复述一句。</p>
                    <h3>指向详答</h3>
                    <ul>
                        <li><strong>stop_reason</strong>：别只靠扫字符串判断有没有工具，要用协议里的停止原因 + 结构化块。→ 全文见 <a href="#d01-q-stop-reason">上文 stop_reason 一节</a>。</li>
                        <li><strong>消息累积</strong>：越长越贵越慢且淹没重点，要截断、窗口、压缩或外置。→ 见 <a href="#d01-q-accumulation">消息累积</a>。</li>
                        <li><strong>工具失败</strong>：必须把失败结构化喂回模型，禁止假成功。→ 见 <a href="#d01-q-tool-fail">工具失败</a>。</li>
                    </ul>
                </section>

                <section class="section-block">
                    <h2>✏️ 自测（题干回顾）</h2>
                    <ul>
                        <li>消息序列？→ <a href="#d01-q-self-seq">自测 1</a></li>
                        <li>三道题复述？→ <a href="#d01-q-self-recap">自测 2</a></li>
                    </ul>
                </section>
    """,
    # D02 Tool System
    """
                <section class="section-block">
                    <h2>🔬 深挖目标</h2>
                    <p>工具不是「一个函数」，而是 <strong>Schema + 权限钩子 + 执行器 + 结果契约</strong> 四层叠在一起；本讲把每一层的失败形态对齐到可观测现象。</p>
                </section>

                <section class="section-block">
                    <h2>📐 ToolDef 契约（概念层）</h2>
                    <div class="code-block">
                        <pre><code class="language-typescript">// 与 S02 对照：抓住这四件事
name + description          // 给模型的「广告」
inputSchema                 // 宿主侧校验，防 JSON 胡写
hasPermission? → execute    // 顺序不能反
execute → ToolResult        // 必须可序列化回消息</code></pre>
                    </div>
                </section>

                <section class="section-block">
                    <h2>🔍 失败矩阵</h2>
                    <table class="options-table">
                        <tr><th>阶段</th><th>典型原因</th><th>用户可见现象</th></tr>
                        <tr><td>Schema 校验</td><td>缺字段 / 类型错</td><td>工具未执行，直接报错或模型重试</td></tr>
                        <tr><td>权限</td><td>策略为 ask 且用户拒绝</td><td>明确 deny，循环继续但无结果块</td></tr>
                        <tr><td>执行期</td><td>超时、退出码非 0</td><td>stderr / is_error 标记进入上下文</td></tr>
                    </table>
                    <p>工具失败如何回灌模型、何时重试：<strong>参考答案</strong>见 <a href="d01.html#d01-q-tool-fail">D01 · 工具执行失败</a>（与本表「执行期」一行对照读）。</p>
                </section>

                <section class="section-block">
                    <h2>🔗 与相邻章节</h2>
                    <ul>
                        <li>扩展 Read/Write/Edit 的<strong>实践练习</strong>骨架见 <a href="d01.html#d01-practice-tools">D01 练习 2</a>。</li>
                        <li>进入执行器之前几乎必经 <strong>D03 权限</strong>；别把「业务错误」和「策略拒绝」混在同一分支里。</li>
                        <li>MCP 动态工具（D07）与内置工具共用同一套「调用外壳」时，重点看<strong>名称空间是否冲突</strong>。</li>
                    </ul>
                </section>

                <section class="section-block">
                    <h2>📖 走读顺序</h2>
                    <ol>
                        <li>列出仓库里所有内置工具的注册表初始化点。</li>
                        <li>找一个「重」工具（如 bash）和一个「轻」工具（如 read），对比权限字段差异。</li>
                        <li>追踪一次校验失败：错误对象最终如何变成模型可见的文本。</li>
                    </ol>
                </section>

                <section class="section-block" id="d02-q-fake-success">
                    <h2>✏️ 自测 1 · 参考答案：execute 为何不能「假成功」？</h2>
                    <h3>题干</h3>
                    <p>为什么 execute 不应吞掉异常而返回「假成功」？</p>
                    <h3>结论</h3>
                    <ul>
                        <li>模型把 <code>tool_result</code> 当作<strong>地面真值</strong>；若失败被伪装成空输出或成功，下一轮会基于幻觉继续改代码、提交或删除文件。</li>
                        <li>宿主无法区分「业务语义失败」（测试挂、编译错）与「传输/执行失败」；吞异常会把两类混在一起，用户也无法在日志里追责。</li>
                        <li>正确做法是：<strong>结构化失败</strong>（<code>is_error</code> 或等价位 + 人类可读摘要 + 可选 stderr 尾），与 <a href="d01.html#d01-q-tool-fail">D01 · 工具失败</a> 一致。</li>
                    </ul>
                </section>

                <section class="section-block" id="d02-q-tool-dedupe">
                    <h2>✏️ 自测 2 · 参考答案：MCP 与内置同名 tool 如何消歧？</h2>
                    <h3>题干</h3>
                    <p>若同一 tool name 被 MCP 与内置同时注册，你会如何在代码层消歧？</p>
                    <h3>结论</h3>
                    <p>在<strong>注册表合并阶段</strong>定死唯一真相，不要让运行时随机命中：</p>
                    <ul>
                        <li><strong>命名空间前缀</strong>（推荐）：内置保持短名，MCP 工具加 <code>mcp__serverId__toolName</code> 或文档约定前缀；模型侧 schema 与调用必须一致。</li>
                        <li><strong>显式优先级</strong>：若允许覆盖，在合并表里记录 <code>source: builtin | mcp</code>，冲突时内置优先或 MCP 优先（写进项目文档），并打日志。</li>
                        <li><strong>禁止静默二义</strong>：启动或 <code>tools/list</code> 后若仍有重名，应 fail-fast 或自动改名并通知用户，避免「有时打到 A 有时打到 B」。</li>
                    </ul>
                </section>

                <section class="section-block">
                    <h2>✏️ 自测（题干回顾）</h2>
                    <ul>
                        <li>execute 假成功？→ <a href="#d02-q-fake-success">自测 1</a></li>
                        <li>同名 tool 消歧？→ <a href="#d02-q-tool-dedupe">自测 2</a></li>
                    </ul>
                </section>
    """,
    # D03 Permission Model
    """
                <section class="section-block">
                    <h2>🔬 深挖目标</h2>
                    <p>权限不是 UI 弹窗那么简单，而是<strong>策略函数 + 会话模式 + 审计轨迹</strong>。你要能回答：同一操作在 <code>default</code> / <code>acceptEdits</code> / <code>bypassPermissions</code> 下分别走哪条分支。</p>
                </section>

                <section class="section-block">
                    <h2>📊 策略维度（建议自建表）</h2>
                    <p>打开源码后，建一张二维表：<strong>工具类型 × 风险等级 × 当前 PermissionMode</strong> → 结果（auto / ask / deny）。不必一次填满，先覆盖：文件写、bash、网络、MCP 调用。</p>
                    <table class="options-table">
                        <tr><th>模式</th><th>心智模型</th><th>实现侧需警惕</th></tr>
                        <tr><td><code>default</code></td><td>高风险默认打断用户</td><td>「高风险」列表是否完整？有无绕过路径？</td></tr>
                        <tr><td><code>acceptEdits</code></td><td>编辑类自动放行</td><td>与 bash / 删除类是否仍隔离？</td></tr>
                        <tr><td><code>bypassPermissions</code></td><td>全放行（yolo）</td><td>是否仍有<strong>硬熔断</strong>（例如某些环境变量禁运）？</td></tr>
                    </table>
                </section>

                <section class="section-block">
                    <h2>🔍 代码走读抓手</h2>
                    <ul>
                        <li>重建源码中与 auto-mode / 解释器相关的<strong>硬读摘录</strong>见 <a href="topic-source-derived.html#permissions-hard">专题 · 权限硬读</a>（<code>AutoModeRules</code>、<code>explain_command</code>）。</li>
                        <li>搜索 <code>canUseTool</code>、<code>PermissionMode</code>、<code>bypassPermissions</code>，找<strong>唯一真相源</strong>：哪个函数把策略结果转成 UI？</li>
                        <li>跟踪「用户点允许一次」vs「记住规则」：会话状态落在内存还是配置文件？</li>
                        <li>审计：日志里能否还原「谁、在何模式、对哪条工具、做了什么决定」？若不能，说明审计链断裂。</li>
                    </ul>
                </section>

                <section class="section-block">
                    <h2>⚠️ 边界案例清单</h2>
                    <ul>
                        <li>工具参数含路径穿越或敏感目录时，策略是否在<strong>解析后路径</strong>上判定？</li>
                        <li>并行 tool 调用：若一个被拒一个通过，部分成功如何反馈给模型？</li>
                        <li>模式切换发生在工具执行中途：是否用快照模式还是实时读取？</li>
                    </ul>
                </section>

                <section class="section-block">
                    <h2>📖 走读顺序</h2>
                    <ol>
                        <li>从 S03 的 <code>PermissionMode</code> 类型出发，列出所有枚举值在 UI 层的入口。</li>
                        <li>画一张「tool 请求 → 策略 → 用户/自动 → 执行」的流程图，与页面顶部 Mermaid 对照查漏补缺。</li>
                        <li>刻意用 <code>bypassPermissions</code> 跑一条高危命令（隔离环境），验证是否仍有硬拦截。</li>
                    </ol>
                </section>

                <section class="section-block" id="d03-q-dontask-bypass">
                    <h2>✏️ 自测 1 · 参考答案：<code>dontAsk</code> vs <code>bypassPermissions</code></h2>
                    <h3>题干</h3>
                    <p>用三句话说明二者差异（语义与实现位置）。</p>
                    <h3>参考答案（三句话版）</h3>
                    <ol>
                        <li><strong><code>dontAsk</code></strong>通常表示「本类操作不要再弹窗确认」，但<strong>仍受策略与硬规则约束</strong>，不是法外之地；实现上多在<strong>策略/会话记忆</strong>或 per-tool 规则里。</li>
                        <li><strong><code>bypassPermissions</code></strong>是更激进的「跳过常规权限闸门」模式（yolo），往往用于受控环境；实现上在<strong><code>canUseTool</code> 入口短路</strong>，但仍可能被硬熔断（高危命令、企业策略）拦截。</li>
                        <li>产品文案上必须区分：前者是<strong>减少打扰</strong>，后者是<strong>信任升级</strong>；混用文案会导致用户误以为「不再询问 = 绝对安全」。</li>
                    </ol>
                </section>

                <section class="section-block" id="d03-q-workspace-write">
                    <h2>✏️ 自测 2 · 参考答案：workspace 内写 — 权限层还是工具层？</h2>
                    <h3>题干</h3>
                    <p>「只允许 workspace 内写」挂在权限层还是工具层？</p>
                    <h3>结论</h3>
                    <p><strong>两层都要，硬校验放在工具层（或共享路径库），策略放在权限层。</strong></p>
                    <ul>
                        <li><strong>权限层</strong>：根据模式决定 ask/auto/deny，并写审计；但若只有策略没有路径解析，攻击面仍在「工具接受任意路径」上。</li>
                        <li><strong>工具层</strong>：在 <code>Write</code>/<code>Edit</code>/<code>Bash</code> 内对<strong>解析后的绝对路径</strong>做 <code>path.resolve</code> + workspace 根前缀校验，防 <code>../</code> 与 symlink 跳出；这是<strong>最后防线</strong>，防模型或配置绕过 UI。</li>
                    </ul>
                </section>

                <section class="section-block">
                    <h2>✏️ 自测（题干回顾）</h2>
                    <ul>
                        <li><code>dontAsk</code> vs <code>bypassPermissions</code> → <a href="#d03-q-dontask-bypass">自测 1</a></li>
                        <li>workspace 内写挂哪层？→ <a href="#d03-q-workspace-write">自测 2</a></li>
                    </ul>
                </section>
    """,
    # D04 Command Interface
    """
                <section class="section-block">
                    <h2>🔬 深挖目标</h2>
                    <p>CLI 是「入口路由器」：同一行输入可能是自然语言、斜杠命令、子命令或管道；本讲理清<strong>分词优先级</strong>与<strong>配置覆盖顺序</strong>。</p>
                </section>

                <section class="section-block">
                    <h2>🧭 分流模型</h2>
                    <ol>
                        <li><strong>REPL 主循环</strong>读一行 → 判断是否以 <code>/</code> 开头 → 命中则走命令注册表。</li>
                        <li>未命中则作为「用户 turn」进入 QueryEngine（回到 D01）。</li>
                        <li>非交互模式（<code>-p</code> / pipe）往往跳过 TTY 特性，注意<strong>stdin 关闭</strong>与<strong>退出码约定</strong>。</li>
                    </ol>
                </section>

                <section class="section-block">
                    <h2>⚙️ 配置优先级（通用模式）</h2>
                    <table class="options-table">
                        <tr><th>层级</th><th>典型来源</th><th>备注</th></tr>
                        <tr><td>进程参数 / 环境变量</td><td><code>argv</code>、<code>ENV</code></td><td>最高优先级，适合 CI</td></tr>
                        <tr><td>项目级</td><td><code>.claude</code>、项目 settings</td><td>多人协作差异最大</td></tr>
                        <tr><td>用户级</td><td>全局 config</td><td>与机器绑定</td></tr>
                    </table>
                    <p>走读时请标出：哪一段代码合并这些层？后写覆盖先写还是深度合并？</p>
                </section>

                <section class="section-block">
                    <h2>🔗 耦合点</h2>
                    <ul>
                        <li>命令层常直接操作 <strong>AppState</strong>（模型、MCP、权限模式），改动命令时要回归 D01/D07。</li>
                        <li>与 D10：部分行为由 hooks 触发，命令是否是 hook 的唯一起点？</li>
                    </ul>
                </section>

                <section class="section-block">
                    <h2>📖 走读顺序</h2>
                    <ol>
                        <li>找到 main / cli 入口，列出前 20 行内在做的初始化。</li>
                        <li>列出所有斜杠命令的注册表，标注哪些会改权限模式（高危）。</li>
                        <li>用 pipe 输入一段多行提示，观察是否与 TTY 路径行为一致。</li>
                    </ol>
                </section>

                <section class="section-block" id="d04-q-print-config">
                    <h2>✏️ 自测 1 · 参考答案：「打印当前有效配置」读什么？</h2>
                    <h3>题干</h3>
                    <p>设计命令只打印当前有效配置，应读取合并后的哪一数据结构？</p>
                    <h3>结论</h3>
                    <p>应读取<strong>宿主内存里「合并完成」的单一真相对象</strong>（例如初始化管线在启动末尾构造的 <code>AppState</code> / <code>EffectiveSettings</code>），而不是只读磁盘上某一个 JSON 文件。</p>
                    <ul>
                        <li>输出里可分区展示：<strong>来源层</strong>（默认 / 用户 / 项目 / 环境变量覆盖）与<strong>最终字段值</strong>，便于对照「谁覆盖了谁」。</li>
                        <li>若合并是深度合并，命令应调用与运行时<strong>同一套 merge 函数</strong>，避免「打印所见」与「实际所用」不一致。</li>
                    </ul>
                </section>

                <section class="section-block" id="d04-q-slash-lex">
                    <h2>✏️ 自测 2 · 参考答案：<code>/command</code> 与自然语言冲突？</h2>
                    <h3>题干</h3>
                    <p>若 <code>/command</code> 与用户消息解析冲突，如何在词法层消除歧义？</p>
                    <h3>结论</h3>
                    <ul>
                        <li><strong>第一 token 规则</strong>：仅当行首（trim 后）以 <code>/</code> 开头且紧跟已注册命令名时走命令表；否则整行进模型。</li>
                        <li><strong>转义</strong>：支持 <code>\/</code> 或约定前缀（如 <code>//</code> 表示字面斜杠）避免用户想讨论路径时被当命令。</li>
                        <li><strong>多行与粘贴</strong>：命令解析只在「提交的一行」或「第一行」上做，避免块粘贴误触。</li>
                    </ul>
                </section>

                <section class="section-block">
                    <h2>✏️ 自测（题干回顾）</h2>
                    <ul>
                        <li>有效配置从哪读？→ <a href="#d04-q-print-config">自测 1</a></li>
                        <li>斜杠与用户消息？→ <a href="#d04-q-slash-lex">自测 2</a></li>
                    </ul>
                </section>
    """,
    # D05 Context Compression
    """
                <section class="section-block">
                    <h2>🔬 深挖目标</h2>
                    <p>压缩是「有损优化」：<strong>何时触发、压缩谁、保留什么信号、如何向模型隐瞒损失</strong>，决定 Agent 是否突然变笨。</p>
                </section>

                <section class="section-block">
                    <h2>📊 触发与策略</h2>
                    <ul>
                        <li>常见触发：token 预算、消息条数、工具输出超长、显式配置阈值。</li>
                        <li>策略谱系：<strong>截断</strong>（硬切）→ <strong>摘要</strong>（模型或规则）→ <strong>结构化压缩</strong>（只留 error + 尾部）。</li>
                    </ul>
                </section>

                <section class="section-block">
                    <h2>⚠️ 信息损失审计</h2>
                    <table class="options-table">
                        <tr><th>内容类型</th><th>压缩风险</th><th>缓解思路</th></tr>
                        <tr><td>测试失败栈</td><td>丢中间帧 → 无法定位</td><td>保留首尾 + 关键 assert 行</td></tr>
                        <tr><td>大文件 read</td><td>只剩摘要 → 丢 import</td><td>分段 read 或保留 path + checksum</td></tr>
                        <tr><td>多轮 plan</td><td>目标被冲掉</td><td>单独 system 小结锚点</td></tr>
                    </table>
                </section>

                <section class="section-block">
                    <h2>🔗 与 Loop</h2>
                    <p>压缩发生在「下一轮模型调用前」；若与工具并行交织，确认压缩器看到的消息视图是否包含<strong>尚未提交的 tool_result</strong>。</p>
                </section>

                <section class="section-block" id="d05-think-accumulation">
                    <h2>🤔 与 D01「消息累积」对照（工程侧答案）</h2>
                    <p><a href="d01.html#d01-q-accumulation">D01 思考题</a>从原理答了危害与解法谱系；本章补<strong>实现侧锚点</strong>（重建源码中的命名，便于你走读）：</p>
                    <ul>
                        <li><strong>触发前计量</strong>：<code>compactConversation</code> 入口处的 <code>tokenCountWithEstimation(messages)</code>——先量化再决定是否压缩。</li>
                        <li><strong>可插桩</strong>：<code>executePreCompactHooks</code> / post 阶段让自定义策略改写压缩指令，而不是黑箱改数组。</li>
                        <li><strong>切段与重放</strong>：通过 compact 边界类消息（参见源码中 <code>createCompactBoundaryMessage</code>、<code>SystemCompactBoundaryMessage</code>）让后续轮次仍知道「哪些历史已被摘要替代」。</li>
                    </ul>
                    <p>完整摘录与走读清单见 <a href="topic-source-derived.html#compact-hard">专题 · Compact 硬读</a>。</p>
                </section>

                <section class="section-block">
                    <h2>📖 走读顺序</h2>
                    <ol>
                        <li>搜索 <code>compress</code>、<code>truncate</code>、<code>summary</code>、<code>token</code> 相关函数，列调用栈。</li>
                        <li>构造一条超长工具输出，打日志看压缩前后消息长度与结构变化。</li>
                        <li>回答：压缩后的消息是否仍满足 API schema？</li>
                    </ol>
                </section>

                <section class="section-block" id="d05-q-compress-fail">
                    <h2>✏️ 自测 1 · 参考答案：压缩后必然做错的场景</h2>
                    <h3>题干</h3>
                    <p>给出一种「压缩后模型必然做错」的场景，并说明如何改策略避免。</p>
                    <h3>示例场景</h3>
                    <p>摘要把<strong>失败测试的唯一关键栈帧行</strong>或<strong>用户刚约定的接口签名</strong>删掉，只保留「测试失败」四字；下一轮模型会按错误假设改代码，越改越偏。</p>
                    <h3>如何避免</h3>
                    <ul>
                        <li><strong>锚点保留</strong>：对含 <code>Error</code>/<code>FAIL</code> 的工具输出保留首尾 N 行 + 关键字行；或用边界消息标记 compact（见上文 D05 工程补充）。</li>
                        <li><strong>外置大段</strong>：超长 log 写入文件，上下文只保留路径与 checksum，需要时再 <code>read</code>。</li>
                        <li><strong>用户/规则 gate</strong>：压缩前若检测到「未闭合任务」关键词，降低压缩强度或跳过该轮。</li>
                    </ul>
                </section>

                <section class="section-block" id="d05-q-summary-cost">
                    <h2>✏️ 自测 2 · 参考答案：小模型摘要 vs 规则摘要</h2>
                    <h3>题干</h3>
                    <p>摘要由「小模型」与「规则」各有什么工程代价？</p>
                    <h3>对比</h3>
                    <table class="options-table">
                        <tr><th>方式</th><th>代价 / 风险</th></tr>
                        <tr><td>小模型摘要</td><td>多一次推理<strong>费用与延迟</strong>；摘要质量波动；需防「摘要再幻觉」；要版本化 prompt 与回归测例。</td></tr>
                        <tr><td>规则 / 模板</td><td>开发维护<strong>规则表</strong>成本高；对非标输出脆弱；但<strong>确定性高、可测</strong>，适合合规场景。</td></tr>
                    </table>
                    <p>实务上常<strong>混合</strong>：规则做硬截断与结构化字段提取，小模型只负责把「已截断块」压成短摘要。</p>
                </section>

                <section class="section-block">
                    <h2>✏️ 自测（题干回顾）</h2>
                    <ul>
                        <li>压缩后必然做错？→ <a href="#d05-q-compress-fail">自测 1</a></li>
                        <li>小模型 vs 规则？→ <a href="#d05-q-summary-cost">自测 2</a></li>
                    </ul>
                </section>
    """,
    # D06 Subagent Fork
    """
                <section class="section-block">
                    <h2>🔬 深挖目标</h2>
                    <p>子代理 = <strong>隔离上下文 + 受限工具视图 + 结果回灌</strong>。深挖重点是：fork 时复制什么、不复制什么、合并时会不会重复计费或泄露秘密。</p>
                </section>

                <section class="section-block">
                    <h2>🧩 隔离清单</h2>
                    <ul>
                        <li><strong>消息历史</strong>：通常截断为子任务描述 + 少量父上下文。</li>
                        <li><strong>工具白名单</strong>：子代理可能无权 bash / 无权写仓库。</li>
                        <li><strong>文件系统视图</strong>：cwd、忽略规则、沙箱路径是否继承？</li>
                    </ul>
                </section>

                <section class="section-block">
                    <h2>🔀 合并策略</h2>
                    <table class="options-table">
                        <tr><th>合并产物</th><th>父循环消费方式</th><th>风险</th></tr>
                        <tr><td>单条摘要消息</td><td>当作 tool_result</td><td>细节丢失 → 父模型误判完成度</td></tr>
                        <tr><td>多条结构化块</td><td>拼进上下文</td><td>体积暴涨 → 触发 D05</td></tr>
                        <tr><td>仅状态 diff</td><td>更新 AppState</td><td>与 Git（D12）状态不一致</td></tr>
                    </table>
                </section>

                <section class="section-block">
                    <h2>💰 成本与调试</h2>
                    <p>每 fork 一轮完整 loop，token 与延迟近似翻倍；日志里应能区分 <code>parent_turn_id</code> / <code>child_turn_id</code>。</p>
                </section>

                <section class="section-block">
                    <h2>📖 走读顺序</h2>
                    <ol>
                        <li>搜索 <code>subagent</code>、<code>fork</code>、<code>delegate</code> 等关键词，定位创建函数。</li>
                        <li>打印 fork 前后的 config diff（尤其 tools 与 permission）。</li>
                        <li>跟踪子代理异常退出时父层如何收尾（超时、部分结果）。</li>
                    </ol>
                </section>

                <section class="section-block" id="d06-q-env-leak">
                    <h2>✏️ 自测 1 · 参考答案：子代理读到 <code>.env</code> 算不算泄露？</h2>
                    <h3>题干</h3>
                    <p>若子代理读到 <code>.env</code> 而父未显式传入，这是泄露还是特性？怎么修？</p>
                    <h3>结论</h3>
                    <p>默认应视为<strong>策略缺陷或泄露风险</strong>：子上下文若与父共享同一工作目录与读文件工具，会「顺带」看到敏感文件，而用户未必理解「子任务也能读盘」。</p>
                    <ul>
                        <li><strong>修</strong>：子代理使用<strong>缩小的工具白名单</strong>（禁用 read 或仅允许路径前缀）；或 fork 时<strong>不继承</strong>父的 secret 注入；对 <code>.env*</code> 走更高权限级。</li>
                        <li>若业务上<strong>故意</strong>让子任务读配置，应在 UI/文档中显式标注，并审计日志记录访问路径。</li>
                    </ul>
                </section>

                <section class="section-block" id="d06-q-parent-fail">
                    <h2>✏️ 自测 2 · 参考答案：子成功、父应失败的验收测试</h2>
                    <h3>题干</h3>
                    <p>设计「子任务成功但父任务应失败」的验收测试。</p>
                    <h3>思路</h3>
                    <p>父任务定义<strong>全局不变式</strong>（例如「不得修改 <code>LICENSE</code>」）。子任务只负责子树且成功完成；子返回后父在<strong>合并/校验阶段</strong>发现不变式被破坏 → 父状态 <code>failed</code>，并向用户展示<strong>子输出 + 父校验失败原因</strong>。</p>
                    <ul>
                        <li>自动化可构造：子代理被授权写 <code>src/</code>，但子通过 symlink 或相对路径实际改到 <code>LICENSE</code>（若未校验解析路径则父应 catch）。</li>
                        <li>断言：子进程 exit 0；父任务最终 <code>failed</code>，且日志含违规路径。</li>
                    </ul>
                </section>

                <section class="section-block">
                    <h2>✏️ 自测（题干回顾）</h2>
                    <ul>
                        <li><code>.env</code> 与子代理？→ <a href="#d06-q-env-leak">自测 1</a></li>
                        <li>子成功父失败测试？→ <a href="#d06-q-parent-fail">自测 2</a></li>
                    </ul>
                </section>
    """,
    # D07 MCP Protocol
    """
                <section class="section-block">
                    <h2>🔬 深挖目标</h2>
                    <p>MCP 是进程/会话级协议：<strong>握手、能力公告、工具发现、调用、崩溃恢复</strong>。本讲把每个 JSON-RPC 形状与宿主状态机对齐。</p>
                </section>

                <section class="section-block">
                    <h2>🔌 生命周期（概念）</h2>
                    <ol>
                        <li><strong>启动传输</strong>：<code>stdio</code> spawn 子进程 / <code>sse</code> 建连。</li>
                        <li><strong>initialize / initialized</strong>：交换协议版本与 capability。</li>
                        <li><strong>tools/list</strong> → 缓存工具 schema → 与内置工具合并名空间。</li>
                        <li><strong>tools/call</strong>：参数校验 → 等待响应 → 映射为统一 ToolResult。</li>
                    </ol>
                </section>

                <section class="section-block">
                    <h2>⚠️ 工程坑</h2>
                    <table class="options-table">
                        <tr><th>问题</th><th>现象</th><th>排查</th></tr>
                        <tr><td>僵尸子进程</td><td>端口占用 / CPU 空转</td><td>宿主退出时是否 SIGTERM 子进程？</td></tr>
                        <tr><td>握手超时</td><td>工具列表空</td><td>stderr 是否被吞？日志级别？</td></tr>
                        <tr><td>工具重名</td><td>调用打到错误 server</td><td>前缀策略或注册顺序</td></tr>
                    </table>
                </section>

                <section class="section-block">
                    <h2>🔒 安全边界</h2>
                    <p>MCP 工具在权限模型里通常等价于「外部 bash」：应继承 D03 的最严策略或单独白名单；任何「自动信任 MCP」都是红旗。</p>
                </section>

                <section class="section-block">
                    <h2>📖 走读顺序</h2>
                    <ol>
                        <li>定位 MCP client 实现文件，画「连接 → list → call」时序。</li>
                        <li>找一个官方示例 server，故意让 tools/call 抛错，观察宿主如何展示给模型。</li>
                        <li>列出所有 transport 分支，比较重连策略差异。</li>
                    </ol>
                </section>

                <section class="section-block" id="d07-q-handshake">
                    <h2>✏️ 自测 1 · 参考答案：为何不宜每次 tool call 都 handshake？</h2>
                    <h3>题干</h3>
                    <p>解释为何 MCP 不宜在每次 tool call 时重新 handshake。</p>
                    <h3>结论</h3>
                    <ul>
                        <li><strong>延迟</strong>：每次 <code>initialize</code> + 传输建连会把工具调用变成「秒级」操作，批量调用时不可接受。</li>
                        <li><strong>状态与配额</strong>：连接上往往有会话状态、流控、订阅；反复握手易触发 server 侧资源泄漏或对端限流。</li>
                        <li><strong>正确模型</strong>：长生命周期的 <strong>client 连接</strong>，在进程/会话级维护；仅在断线、版本不匹配或配置变更时重连。</li>
                    </ul>
                </section>

                <section class="section-block" id="d07-q-dedupe-name">
                    <h2>✏️ 自测 2 · 参考答案：同名 tool — 前缀还是 UUID？</h2>
                    <h3>题干</h3>
                    <p>两个 server 提供同名 tool，选前缀还是 UUID？利弊？</p>
                    <h3>结论</h3>
                    <p>对<strong>人类与模型可读性</strong>优先选<strong>稳定前缀</strong>（如 <code>serverSlug_toolName</code>）；UUID 适合机器内部主键，<strong>不适合</strong>作为模型可见的主名称（难推理、难 diff）。</p>
                    <ul>
                        <li><strong>前缀</strong>：可读、可教用户；需处理 slug 冲突与字符集。</li>
                        <li><strong>UUID</strong>：全局唯一无歧义；但对 prompt 噪声大，除非只做内部映射、对外仍展示前缀。</li>
                    </ul>
                </section>

                <section class="section-block">
                    <h2>✏️ 自测（题干回顾）</h2>
                    <ul>
                        <li>每次 handshake？→ <a href="#d07-q-handshake">自测 1</a></li>
                        <li>同名 tool？→ <a href="#d07-q-dedupe-name">自测 2</a></li>
                    </ul>
                </section>
    """,
    # D08 Task Management
    """
                <section class="section-block">
                    <h2>🔬 深挖目标</h2>
                    <p>任务系统把「多步工作」从模型幻觉里拽到<strong>可持久化数据结构</strong>：依赖、状态、重试与并发上限都要在代码层可验证。</p>
                </section>

                <section class="section-block">
                    <h2>🧱 数据模型（自查）</h2>
                    <ul>
                        <li>任务节点：id、title、状态机（pending/running/blocked/done/failed）。</li>
                        <li>依赖边：DAG 还是允许软依赖？失败是否级联取消？</li>
                        <li>调度器：与主 loop 是同线程还是 job queue？</li>
                    </ul>
                </section>

                <section class="section-block">
                    <h2>🔁 失败与重试</h2>
                    <table class="options-table">
                        <tr><th>失败类型</th><th>建议策略</th></tr>
                        <tr><td>工具瞬时错误</td><td>有限次指数退避 + 可观察日志</td></tr>
                        <tr><td>权限拒绝</td><td>不要自动重试；回到 D03 等人</td></tr>
                        <tr><td>模型胡写 plan</td><td>校验 DAG 无环 + 人工 / 规则 gate</td></tr>
                    </table>
                </section>

                <section class="section-block">
                    <h2>🔗 与 Subagent</h2>
                    <p>常见模式：父任务拆子任务 → 子代理执行 → 父任务合并；确认子任务失败是否会<strong>阻塞</strong>父任务依赖解析。</p>
                </section>

                <section class="section-block">
                    <h2>📖 走读顺序</h2>
                    <ol>
                        <li>搜索 <code>task</code>、<code>todo</code>、<code>queue</code>、<code>scheduler</code>，缩小到任务模块目录。</li>
                        <li>画一张 5 个状态以内的状态机，并与实际枚举对比。</li>
                        <li>模拟：任务 A 依赖 B，B failed，UI 与 API 各应表现什么？</li>
                    </ol>
                </section>

                <section class="section-block" id="d08-q-parallel-files">
                    <h2>✏️ 自测 1 · 参考答案：并行任务如何避免双写？</h2>
                    <h3>题干</h3>
                    <p>若允许并行 3 个 running 任务，如何避免同一文件被双写？</p>
                    <h3>结论</h3>
                    <ul>
                        <li><strong>文件级锁 / 租约</strong>：任务开始前对将修改的路径集合申请锁，冲突则排队或失败 fast。</li>
                        <li><strong>分区所有权</strong>：调度器把目录树切片，保证并行任务<strong>写集合不相交</strong>。</li>
                        <li><strong>最后写者检测</strong>：写前读 checksum，不匹配则中止并把冲突交给模型/用户（与 git 冲突类似）。</li>
                    </ul>
                </section>

                <section class="section-block" id="d08-q-acceptance">
                    <h2>✏️ 自测 2 · 参考答案：只存 title 不存验收？</h2>
                    <h3>题干</h3>
                    <p>任务持久化若只存 title 不存 acceptance criteria，会有什么问题？</p>
                    <h3>结论</h3>
                    <ul>
                        <li>模型与用户会对「什么叫完成」<strong>各说各话</strong>，无法自动验收，任务状态沦为摆设。</li>
                        <li>恢复会话或换人接手时，无法判断旧任务是<strong>真完成</strong>还是<strong>被跳过</strong>。</li>
                        <li>建议至少存：可机读的 <strong>完成条件</strong>（测试命令、文件存在、URL 返回码）或指向 spec 的链接/片段。</li>
                    </ul>
                </section>

                <section class="section-block">
                    <h2>✏️ 自测（题干回顾）</h2>
                    <ul>
                        <li>并行双写？→ <a href="#d08-q-parallel-files">自测 1</a></li>
                        <li>只存 title？→ <a href="#d08-q-acceptance">自测 2</a></li>
                    </ul>
                </section>
    """,
    # D09 Bridge IDE
    """
                <section class="section-block">
                    <h2>🔬 深挖目标</h2>
                    <p>IDE Bridge 是<strong>双主状态同步</strong>：编辑器 buffer、宿主会话、文件系统三角形里任意一边更新都可能冲突；本讲抓协议消息与冲突解决策略。</p>
                </section>

                <section class="section-block">
                    <h2>📡 消息类型（抽象）</h2>
                    <ul>
                        <li>文档级：打开/关闭、变更 diff、光标/选区（视实现而定）。</li>
                        <li>命令级：从 IDE 触发 run、从宿主推送诊断。</li>
                        <li>心跳与重连：WebSocket 断线后如何对齐版本向量？</li>
                    </ul>
                </section>

                <section class="section-block">
                    <h2>⚔️ 冲突模型</h2>
                    <table class="options-table">
                        <tr><th>场景</th><th>典型策略</th></tr>
                        <tr><td>宿主写文件同时 IDE 编辑</td><td>Last-write-wins / 提示重载 / OT</td></tr>
                        <tr><td>大补丁 apply 失败</td><td>回滚到 snapshot + 通知模型</td></tr>
                        <tr><td>二进制文件</td><td>禁止文本 merge，整文件替换</td></tr>
                    </table>
                </section>

                <section class="section-block">
                    <h2>🔗 与工具链</h2>
                    <p>Apply_patch / write 工具应与 bridge 共用「单一写入层」，否则会出现磁盘与 buffer 撕裂（调试极痛）。</p>
                </section>

                <section class="section-block">
                    <h2>📖 走读顺序</h2>
                    <ol>
                        <li>定位 bridge server 启动点与端口协商。</li>
                        <li>列出所有 WS 事件枚举，标注哪些是 fire-and-forget。</li>
                        <li>断网 10 秒再恢复，观察是否丢事件；若丢，缺陷在哪？</li>
                    </ol>
                </section>

                <section class="section-block" id="d09-test-buffer-override">
                    <h2>✏️ 自测 1 · 参考答案：「宿主覆盖 IDE 未保存 buffer」测试用例</h2>
                    <p><strong>目标</strong>：验证当磁盘已被宿主（工具写文件）更新，而 IDE 里同一文件仍有<strong>未保存编辑</strong>时，产品行为是否符合预期（提示 / 重载 / diff），且<strong>不会静默丢一边的修改</strong>。</p>

                    <h3>前置条件</h3>
                    <ul>
                        <li>工作区文件 <code>src/foo.ts</code>，磁盘内容为版本 <code>A</code>。</li>
                        <li>IDE 打开该文件，用户改成版本 <code>B</code>，<strong>未保存</strong>（buffer dirty）。</li>
                        <li>Bridge 已连接；可观测 IDE 通知或 RPC 日志。</li>
                    </ul>

                    <h3>操作步骤（自动化可脚本化）</h3>
                    <ol>
                        <li>记录 IDE 侧「文档版本号」或 hash（若有）；记录 buffer 文本 <code>B</code>。</li>
                        <li>在宿主侧触发一次<strong>合法</strong>写盘：例如模拟 <code>Write</code> / <code>apply_patch</code> 工具把 <code>foo.ts</code> 写成版本 <code>C</code>（与 <code>B</code> 冲突）。</li>
                        <li>不向 IDE 发送保存；观察 bridge 是否推送「文件在磁盘已变」类事件。</li>
                    </ol>

                    <h3>期望结果（择一或组合，需在需求里写死）</h3>
                    <table class="options-table">
                        <tr><th>策略</th><th>断言</th></tr>
                        <tr><td>安全默认</td><td>IDE 提示「磁盘已在外部修改」，禁止静默用 <code>C</code> 覆盖 buffer <code>B</code>；用户选「重载丢本地」或「另存为」。</td></tr>
                        <tr><td>Diff 流（重建树中有 <code>openDiff</code> 思路）</td><td>打开 diff 页，左侧/右侧与 <code>B</code>/<code>C</code> 一致；用户 Accept 后 buffer 与磁盘对齐为选定版本。</td></tr>
                        <tr><td>宿主回读</td><td>工具链在写盘后若需继续对话，<code>read_file</code> 读到的是 <code>C</code>，且日志中可见「IDE 未保存」标记（若有）。</td></tr>
                    </table>

                    <h3>伪代码（集成测试骨架）</h3>
                    <div class="code-block">
                        <pre><code class="language-typescript">// 伪代码：用假 IDE client + 真文件系统即可跑通思路
test('host write while IDE buffer dirty', async () => {
  const path = 'src/foo.ts'
  await resetFile(path, 'A')
  const ide = await openInFakeIDE(path)
  ide.setBufferContents('B', { saved: false })

  await hostToolWrite(path, 'C') // 应走与正式产品相同的写入层

  const ev = await ide.waitForEvent('external_change' /* 或等价 RPC */, 3000)
  expect(ev).toBeDefined()
  expect(ide.getBufferContents()).not.toBe('C') // 未确认前不应静默等于磁盘
  // 用户点击「Reload from disk」后：
  ide.simulateReloadFromDisk()
  expect(await readDisk(path)).toBe(ide.getBufferContents())
})</code></pre>
                    </div>
                    <p>重建源码里与「在 IDE 里展示差异、等用户保存/关闭」相关的线索可见 <code>useDiffInIDE.ts</code> 中 <code>callIdeRpc('openDiff', …)</code> 及对 save / closed / rejected 消息的分支——测试用例应对照你的产品是否具备<strong>同等显式状态机</strong>。</p>
                </section>

                <section class="section-block" id="d09-why-tools-not-shell">
                    <h2>✏️ 自测 2 · 参考答案：Bridge 为何不应直接执行任意 shell？</h2>

                    <h3>核心结论</h3>
                    <p>Bridge / IDE 插件运行在<strong>另一信任边界</strong>（编辑器进程、扩展宿主），若在这里开「任意 shell 执行」旁路，会<strong>整体绕过</strong>终端侧已实现的 <code>canUseTool</code>、审计、配额与沙箱策略，形成<strong>双轨执行面</strong>——安全与可观测性都会塌缩。</p>

                    <h3>分点分析</h3>
                    <ol>
                        <li><strong>权限与同意</strong>：Bash 在 CLI 里走 D03 的 ask/auto/deny；若在 bridge 里直接 <code>exec</code>，用户永远看不到同一条确认链，「我明明没批准终端跑 rm」却发生删文件——责任界面断裂。</li>
                        <li><strong>审计与合规</strong>：企业场景要回答「谁、在什么会话、对哪条命令点了允许」；旁路 shell 不会进入同一 <code>tool_result</code> / 日志管道，事后无法复盘。</li>
                        <li><strong>一致的工具契约</strong>：正式路径是「模型 → tool_use → 校验 → 权限 → 执行 → tool_result → 下一轮」；bridge 直连 shell 会破坏消息顺序与重试语义（D01）。</li>
                        <li><strong>IDE 侧攻击面</strong>：扩展可能被恶意配置或供应链污染；若扩展能直接 shell，等于给攻击者多一个入口，而宿主无法统一限流与封禁。</li>
                        <li><strong>测试与复现</strong>：所有自动化应只断言「通过 MCP/RPC 触发了等价于某工具的调用」，而不是「机器上曾 spawn 过 sh」，否则 CI 与本地行为不可比。</li>
                    </ol>

                    <h3>反模式 vs 推荐模式（示意）</h3>
                    <div class="code-block">
                        <pre><code class="language-typescript">// ❌ 反模式：IDE / bridge 收到消息后偷偷 exec
bridge.on('runCommand', (cmd: string) => {
  child_process.exec(cmd) // 无 canUseTool、无 tool_result、无会话归因
})

// ✅ 推荐：bridge 只传「意图」或结构化 payload，由 CLI 宿主调度工具
bridge.on('requestAction', (payload) => {
  enqueueAsUserOrSystemMessage(/* … */)
  // 最终仍进入 QueryEngine → Tool 执行 → 权限门 → 与终端路径一致
})</code></pre>
                    </div>
                    <p>实务上，允许 IDE 触发<strong>有限、白名单</strong>动作（如「在终端里粘贴已生成命令」）可以讨论，但「任意 shell」应始终禁止；与 <a href="d03.html">D03</a>、<a href="d01.html#d01-q-tool-fail">D01 工具失败处理</a> 同读，可拼出完整宿主安全模型。</p>
                </section>

                <section class="section-block">
                    <h2>✏️ 自测（题干回顾）</h2>
                    <ul>
                        <li>设计一个「宿主覆盖 IDE 未保存 buffer」的测试用例。→ 见上文 <a href="#d09-test-buffer-override">自测 1 参考答案</a>。</li>
                        <li>解释为何 bridge 不应直接执行任意 shell。→ 见上文 <a href="#d09-why-tools-not-shell">自测 2 参考答案</a>。</li>
                    </ul>
                </section>
    """,
    # D10 Hooks Extension
    """
                <section class="section-block">
                    <h2>🔬 深挖目标</h2>
                    <p>Hooks 把固定流程变成可插拔管道。本讲要求你能对照<strong>真实调度代码</strong>回答：<strong>事件从哪进、匹配规则、并行还是串行、权限/改参如何合并、超时与信任门、失败是否阻断主流程</strong>——而不是只背事件名。</p>
                </section>

                <section class="section-block">
                    <h2>📂 源码锚点（本仓库 <code>ccsource/claude-code-main</code>）</h2>
                    <p>克隆课程仓库且已包含 <code>ccsource</code> 时，按下表打开文件即可；行号随上游变动可能漂移，以符号名搜索为准。</p>
                    <table class="options-table">
                        <tr><th>路径</th><th>读什么</th></tr>
                        <tr><td><code>src/utils/hooks.ts</code></td><td><code>executeHooks</code>、<code>executePreToolHooks</code> / <code>executePostToolHooks</code>、<code>TOOL_HOOK_EXECUTION_TIMEOUT_MS</code>、信任与 <code>CLAUDE_CODE_SIMPLE</code> 早退。</td></tr>
                        <tr><td><code>src/services/tools/toolHooks.ts</code></td><td><code>runPreToolUseHooks</code> / <code>runPostToolUseHooks</code>：把 hook 生成器产物映射成 <code>hookPermissionResult</code>、<code>hookUpdatedInput</code>、<code>stop</code> 等。</td></tr>
                        <tr><td><code>src/services/tools/toolExecution.ts</code></td><td><code>checkPermissionsAndCallTool</code> 里消费 pre-hook 的 <code>for await</code> 循环：<strong>每次 <code>hookUpdatedInput</code> 都会覆盖 <code>processedInput</code></strong>。</td></tr>
                        <tr><td><code>src/utils/hooks/execAgentHook.ts</code> 等</td><td>各 <code>type</code>（command / http / prompt / callback）如何落盘为子进程或 RPC。</td></tr>
                    </table>
                    <p>另有<strong>最小可读实现</strong>（教学用，非上游快照）：<a href="https://github.com/Harzva/learn-likecc/blob/main/course/examples/s10-hooks.ts" target="_blank" rel="noopener"><code>course/examples/s10-hooks.ts</code></a>，适合对照类型与注册表思路。</p>
                </section>

                <section class="section-block">
                    <h2>🪝 生命周期矩阵</h2>
                    <ul>
                        <li><strong>PreToolUse</strong>：可在进入 <code>canUseTool</code> 前改写 <code>processedInput</code>，或通过 <code>permissionBehavior</code> 走 allow / ask / deny；也可 <code>blockingError</code> 直接否决。</li>
                        <li><strong>PostToolUse</strong>：拿到真实 <code>tool_response</code> 后做审计、脱敏、替换 MCP 输出（见源码 <code>updatedMCPToolOutput</code>）；<strong>不能</strong>替代「尚未发生的批准」。</li>
                        <li><strong>匹配</strong>：<code>executePreToolHooks</code> 传入 <code>matchQuery: toolName</code>，配置侧按工具名过滤；具体合并顺序见下一节。</li>
                    </ul>
                </section>

                <section class="section-block">
                    <h2>⚡ 并行、权限合并与「最后一条改参获胜」</h2>
                    <p>与「hook 按注册顺序串行改同一个字段」的直觉不同，上游对<strong>一批匹配的 command/prompt/… hook</strong>采用<strong>并行启动 + 聚合结果</strong>：<code>matchingHooks.map(...)</code> 后为 <code>for await (const result of all(hookPromises))</code>。权限类结果有明确优先级：<strong>deny &gt; ask &gt; allow</strong>（见注释 <code>Apply precedence rules</code>）。</p>
                    <p>若多个 hook 仅返回 <code>updatedInput</code>（无 <code>permissionBehavior</code>），引擎会<strong>逐条 yield</strong>；在 <code>toolExecution.ts</code> 中每收到一条 <code>hookUpdatedInput</code> 就执行 <code>processedInput = result.updatedInput</code>——因此<strong>多 hook 改同一键时，最终生效值取决于异步完成顺序在生成器中的产出次序</strong>，一般应视为<strong>非确定性</strong>，产品侧应禁止多 hook 争用同一字段，或合并为单一 hook。</p>
                </section>

                <section class="section-block">
                    <h2>📎 源码摘录（<code>ccsource/.../hooks.ts</code>）</h2>
                    <p>下列片段与当前课程随附的 <code>ccsource/claude-code-main</code> 一致，便于你全文搜索时核对；上游更新后请以本地文件为准。</p>
                    <div class="code-block">
                        <pre><code class="language-typescript">// L2224 起：一批匹配到的 hook 并行执行（非 for 循环串行 await）
// Run all hooks in parallel with individual timeouts
const hookPromises = matchingHooks.map(async function* (...) { ... })

// L2903 起：聚合多条并行结果时的权限优先级
// Check for permission behavior with precedence: deny > ask > allow
switch (result.permissionBehavior) {
  case 'deny':
    permissionBehavior = 'deny' // deny always takes precedence
    break
  case 'ask':
    if (permissionBehavior !== 'deny') permissionBehavior = 'ask'
    break
  case 'allow':
    if (!permissionBehavior) permissionBehavior = 'allow'
    break
}</code></pre>
                    </div>
                    <div class="code-block">
                        <pre><code class="language-typescript">// toolExecution.ts（checkPermissionsAndCallTool）— hook 改参覆盖
case 'hookUpdatedInput':
  processedInput = result.updatedInput</code></pre>
                    </div>
                </section>

                <section class="section-block">
                    <h2>🧪 超时、信任门与环境开关</h2>
                    <table class="options-table">
                        <tr><th>主题</th><th>源码/行为要点</th></tr>
                        <tr><td>默认超时</td><td><code>TOOL_HOOK_EXECUTION_TIMEOUT_MS = 10 * 60 * 1000</code>（10 分钟）为常见默认值；单 hook 可自带 <code>timeout</code>。</td></tr>
                        <tr><td>工作区信任</td><td><code>executeHooks</code> 开头：未接受信任时直接跳过用户 hook，集中防止交互模式下的 RCE 面。</td></tr>
                        <tr><td><code>CLAUDE_CODE_SIMPLE</code></td><td>为真时整段 <code>executeHooks</code> 早退，等价于关闭复杂 hook 管线（调试/极简路径）。</td></tr>
                        <tr><td>Hook 再调模型</td><td>仍可能递归或拖死会话；应用层需配额、深度与「hook 内禁止再触发同类事件」的约定。</td></tr>
                        <tr><td>Hook 写磁盘</td><td>继承宿主权限与 D03；命令类 hook 本质是子进程，别把秘密写进日志。</td></tr>
                    </table>
                </section>

                <section class="section-block">
                    <h2>📖 走读顺序（带搜索关键词）</h2>
                    <ol>
                        <li><code>hooks.ts</code>：搜 <code>export async function* executePreToolHooks</code>，看 <code>hookInput</code> 结构与 <code>hasHookForEvent</code> 短路。</li>
                        <li>同文件搜 <code>async function* executeHooks</code>，读 <code>getMatchingHooks</code> → 并行 <code>hookPromises</code> → <code>permissionBehavior</code> 优先级与 <code>updatedInput</code> yield。</li>
                        <li><code>toolHooks.ts</code>：<code>runPreToolUseHooks</code> 分支表，对照 S10 配置 JSON 与真实 <code>AggregatedHookResult</code> 字段。</li>
                        <li><code>toolExecution.ts</code>：<code>case 'hookUpdatedInput'</code>，确认改参如何进入后续权限与工具执行。</li>
                        <li>本地跑一条真实 <code>PreToolUse</code> command（echo JSON），用日志验证只触发一次 Pre、一次 Post。</li>
                    </ol>
                </section>

                <section class="section-block" id="d10-q-hook-order">
                    <h2>✏️ 自测 1 · 参考答案：两个 hook 改同一参数，谁说了算？</h2>
                    <h3>题干</h3>
                    <p>配置了两个 <code>PreToolUse</code> hook，都对 <code>Bash</code> 生效，且都在 JSON 里返回 <code>hookSpecificOutput.updatedInput</code> 修改同一字段（例如 <code>command</code>）。最终进入工具执行的到底是哪一份？用户问「优先级」时你怎么解释？</p>
                    <h3>结论</h3>
                    <p>这批 hook 在引擎侧<strong>并行执行</strong>；聚合时每条 hook 的 <code>updatedInput</code> 会<strong>分别 yield</strong>。宿主在 <code>checkPermissionsAndCallTool</code> 中对 <code>hookUpdatedInput</code> 的处理是<strong>简单覆盖</strong>——后收到的那条覆盖先前的 <code>processedInput</code>。由于并行完成顺序不稳定，<strong>不应依赖「注册顺序」或「文件顺序」作为契约</strong>。</p>
                    <h3>向用户怎么说</h3>
                    <ul>
                        <li>文档写死：<strong>不要配置多个会改写同一键的 Pre hook</strong>；需要多段逻辑请合并为一个脚本或在脚本内自行合并。</li>
                        <li>若必须链式改写，应在<strong>单一 hook</strong>内顺序处理，或改上游引入显式全序（当前开源实现未保证）。</li>
                    </ul>
                    <p>代码锚点（覆盖语义，与仓库 <code>ccsource</code> 对齐）：</p>
                    <div class="code-block">
                        <pre><code class="language-typescript">// toolExecution.ts — 每来一条 hookUpdatedInput 就整体替换 processedInput
case 'hookUpdatedInput':
  processedInput = result.updatedInput</code></pre>
                    </div>
                </section>

                <section class="section-block" id="d10-q-post-approve">
                    <h2>✏️ 自测 2 · 参考答案：Post-hook 能「自动 approve」吗？</h2>
                    <h3>题干</h3>
                    <p>能否靠 <code>PostToolUse</code> hook 实现「某类工具一律自动批准」？安全代价是什么？</p>
                    <h3>结论</h3>
                    <p><strong>不能</strong>把 Post 当成批准门：批准发生在<strong>工具尚未执行</strong>之前，对应的是 <code>PreToolUse</code> 返回的 <code>permissionBehavior: 'allow'</code>（以及正常权限流里的 <code>canUseTool</code>）。<code>PostToolUse</code> 运行时工具已经完成，最多做日志、脱敏、改写展示给模型的 MCP 输出等。</p>
                    <h3>若强行「看起来像自动批准」</h3>
                    <p>只能用 <strong>PreToolUse</strong> 或策略引擎在 <code>canUseTool</code> 前放行。代价是：<strong>任何误匹配规则都会真实执行危险工具</strong>（磁盘、网络、子进程），且审计必须记录「由 hook 策略自动 allow」以供追责。</p>
                </section>

                <section class="section-block" id="d10-q-permission-merge">
                    <h2>✏️ 自测 3 · 参考答案：并行 hook 的 allow / ask / deny 谁赢？</h2>
                    <h3>题干</h3>
                    <p>同一 <code>PreToolUse</code>、同一工具，hook A 返回 allow，hook B 返回 ask，hook C 返回 deny。最终权限行为是什么？</p>
                    <h3>结论</h3>
                    <p>在 <code>executeHooks</code> 的结果聚合里，注释写明优先级：<strong>deny &gt; ask &gt; allow</strong>。因此最终为 <strong>deny</strong>。这与「最后一个改参获胜」是两套逻辑：权限走聚合优先级，纯 <code>updatedInput</code> 走多次覆盖。</p>
                    <p>教学提示：设计策略时，<strong>deny 应视为安全绳</strong>——任一子系统否决即不执行。</p>
                </section>

                <section class="section-block" id="d10-q-audit-post">
                    <h2>✏️ 自测 4 · 参考答案：Post 改写输出与审计链</h2>
                    <h3>题干</h3>
                    <p><code>PostToolUse</code> hook 若替换 MCP 工具返回体（源码中的 <code>updatedMCPToolOutput</code>），审计日志应记录「原始结果」还是「改写后结果」？模型看到的与落盘的一致吗？</p>
                    <h3>结论</h3>
                    <p>合规上应<strong>至少保留原始结果或哈希</strong>在不可篡改存储中，改写给模型的内容单独记为「hook 变换后」。若只记改写版，事后无法复盘数据泄露是否由 hook 引入。实现上需区分：<strong>工具真实返回值</strong>、<strong>进入对话上下文的值</strong>、<strong>用户可见附件</strong>是否三层一致——任何不一致都应在产品说明里写清。</p>
                </section>

                <section class="section-block">
                    <h2>✏️ 自测（题干回顾）</h2>
                    <ul>
                        <li>两 hook 改同一参数谁优先？→ <a href="#d10-q-hook-order">自测 1</a></li>
                        <li>Post 能否自动 approve？→ <a href="#d10-q-post-approve">自测 2</a></li>
                        <li>并行 allow/ask/deny 谁赢？→ <a href="#d10-q-permission-merge">自测 3</a></li>
                        <li>Post 改写输出如何审计？→ <a href="#d10-q-audit-post">自测 4</a></li>
                    </ul>
                </section>
    """,
    # D11 Vim Mode
    """
                <section class="section-block">
                    <h2>🔬 深挖目标</h2>
                    <p>Vim 模式是输入栈上的「第二套映射层」：要在 <strong>readline / prompt toolkit / 多行编辑</strong> 共存时不炸键，必须分清何时拦截、何时透传。</p>
                </section>

                <section class="section-block">
                    <h2>⌨️ 键位管线</h2>
                    <ol>
                        <li>底层捕获 keydown / char input。</li>
                        <li>Vim 状态机：Normal / Insert / Visual（若有）。</li>
                        <li>与全局快捷键（粘贴、历史、补全）优先级比较。</li>
                    </ol>
                </section>

                <section class="section-block">
                    <h2>⚠️ 常见冲突</h2>
                    <ul>
                        <li><code>Ctrl+C</code>：中断模型请求 vs Vim 操作。</li>
                        <li>多行块编辑：Esc 是退出插入还是取消补全？</li>
                        <li>IME 组合输入：是否在 Normal 模式误吞？</li>
                    </ul>
                </section>

                <section class="section-block">
                    <h2>📖 走读顺序</h2>
                    <ol>
                        <li>搜索 <code>vim</code>、<code>keymap</code>、<code>readline</code>，定位模式切换状态变量。</li>
                        <li>列一张表：10 个常用键在 Insert vs Normal 的行为。</li>
                        <li>在集成测试里模拟按键序列（若仓库无测例，手写伪代码）。</li>
                    </ol>
                </section>

                <section class="section-block" id="d11-q-vim-order">
                    <h2>✏️ 自测 1 · 参考答案：Vim 层在业务解析之前还是之后？</h2>
                    <h3>题干</h3>
                    <p>为何 Vim 层应在「业务命令解析」之前还是之后？</p>
                    <h3>结论</h3>
                    <p>应在<strong>业务命令解析之前</strong>（更靠近原始按键输入）：Vim 先决定当前键是「编辑命令」还是「插入文本」，再交给斜杠命令 / 提交逻辑。若顺序反了，<code>j</code>、<code>:</code> 等会被当成普通字符或错误命令，Normal 模式失效。</p>
                </section>

                <section class="section-block" id="d11-q-vim-off">
                    <h2>✏️ 自测 2 · 参考答案：中途关闭 Vim 模式如何重置？</h2>
                    <h3>题干</h3>
                    <p>用户 mid-session 关闭 vim 模式，状态应如何重置？</p>
                    <h3>结论</h3>
                    <ul>
                        <li>立即<strong>强制回到 Insert/默认输入态</strong>，清空 Normal/Visual 状态机；避免仍停留在 Normal 却已不再拦截键位导致「半残」行为。</li>
                        <li>若有多行缓冲或未完成操作，应<strong>刷新 keymap 绑定</strong>并可选提示用户「已退出 Vim」。</li>
                        <li>持久化：将偏好写入配置，下次启动一致；当前会话内切换应同步到 UI 指示器。</li>
                    </ul>
                </section>

                <section class="section-block">
                    <h2>✏️ 自测（题干回顾）</h2>
                    <ul>
                        <li>Vim 与业务解析顺序？→ <a href="#d11-q-vim-order">自测 1</a></li>
                        <li>中途关 Vim？→ <a href="#d11-q-vim-off">自测 2</a></li>
                    </ul>
                </section>
    """,
    # D12 Git Integration
    """
                <section class="section-block">
                    <h2>🔬 深挖目标</h2>
                    <p>Git 集成是「自动化刀锋」：<strong>何时只读、何时写索引、何时提交、冲突由谁解决</strong>。本讲对齐宿主命令与 git 状态机，避免静默破坏仓库。</p>
                </section>

                <section class="section-block">
                    <h2>📌 S 与 D 的分工（为何答案在 D12？）</h2>
                    <p><strong>S 线（如 S12）</strong>：讲清楚「是什么、典型流程、配置长什么样」，篇幅尽量短，一般<strong>不铺长篇标答</strong>，避免主线臃肿。</p>
                    <p><strong>D 线（如本页）</strong>：同一主题的<strong>深挖 + 边界 + 自测参考答案</strong>刻意放在这里——你可以先闭卷想，再展开下文对照。这不是「S 只出题、D 只给答案」的硬性协议，而是本站的<strong>排版约定</strong>：<strong>S 轻、D 重</strong>。</p>
                    <p><strong>不建议去掉 D 里的答案</strong>：去掉后 D 与 S 的差异被抹平，深挖页失去「对答案」这一用途；若你希望某讲在 S 侧多一句提示，更合适的是像 S12 那样<strong>链到对应的 D</strong>，而不是删掉 D 的解析。</p>
                </section>

                <section class="section-block">
                    <h2>🌳 操作分级</h2>
                    <table class="options-table">
                        <tr><th>级别</th><th>示例</th><th>权限建议</th></tr>
                        <tr><td>只读</td><td>status、diff、log</td><td>可默认 auto</td></tr>
                        <tr><td>索引变更</td><td>add、restore</td><td>ask 或项目策略</td></tr>
                        <tr><td>历史改写</td><td>commit --amend、push --force</td><td>强确认 + 日志</td></tr>
                    </table>
                </section>

                <section class="section-block">
                    <h2>🔀 合并与冲突</h2>
                    <ul>
                        <li>模型生成 patch 与 git 冲突 marker 同时出现时，优先让人类看清「三方」。</li>
                        <li>自动化 merge 失败必须<strong>非零退出</strong>并把冲突路径喂回上下文。</li>
                        <li>与 D09：IDE buffer 未保存 vs git checkout 冲突检测。</li>
                    </ul>
                </section>

                <section class="section-block">
                    <h2>📖 走读顺序</h2>
                    <ol>
                        <li>搜索 <code>git</code> 封装层（spawn 包装），列出所有子命令白名单。</li>
                        <li>确认是否过滤 <code>--force</code>、<code>update-ref</code> 等高危参数。</li>
                        <li>走读一次「自动 commit」：默认 message 规则、是否 GPG、是否 hook。</li>
                    </ol>
                </section>

                <section class="section-block" id="d12-q-commit-no-push">
                    <h2>✏️ 自测 1 · 参考答案：<code>git commit</code> 放行、<code>git push</code> 禁止</h2>
                    <h3>题干</h3>
                    <p>设计策略：允许模型 <code>git commit</code> 但禁止 <code>git push</code>，在<strong>权限层</strong>如何实现？</p>
                    <h3>思路概览</h3>
                    <p>权限函数（如 <code>canUseTool</code>）必须在<strong>真正 spawn 之前</strong>看到<strong>结构化或可解析的调用意图</strong>。实现上有三条常见路线，可叠加：</p>
                    <ol>
                        <li><strong>专用 Git 工具</strong>：不把「任意 shell」暴露给模型，而是 <code>git</code> 工具参数里带 <code>subcommand</code>（或等价枚举）。策略表：<code>commit</code> / <code>add</code> / <code>status</code> → auto 或 ask；<code>push</code>、<code>fetch</code>、含 <code>remote</code> 的网络写 → <strong>一律 deny</strong> 或未开放该枚举值。</li>
                        <li><strong>Bash 工具 + 命令解析</strong>：若仍走通用 Bash，必须在权限层对<strong>整行命令做 token 化</strong>（注意引号、<code>git -C path</code>、<code>env GIT_DIR=…</code>）：识别首个 <code>git</code> 子命令；<code>push</code>、<code>push --force</code>、<code>remote set-url</code> 等命中高危规则 → deny；<code>commit</code> 在允许列表 → 继续走工作区与路径校验。</li>
                        <li><strong>PreToolUse Hook（辅助）</strong>：对 Bash 的 <code>command</code> 字符串做二次审计（正则 / 小型解析器），命中 <code>git push</code> 返回 deny 或 <code>blockingError</code>。Hook 不能替代权限门，只做纵深防御。</li>
                    </ol>
                    <h3>务必兜住的坑</h3>
                    <ul>
                        <li><code>git -C ../outside-repo push</code>：除子命令外还要校验 <code>-C</code> 与当前工作目录是否落在<strong>允许的工作区根</strong>内。</li>
                        <li><code>git</code> 的别名、脚本包装：<code>alias gp=git push</code> —— 若无法静态解析，应对「未列入白名单的任意 git 调用」默认 ask/deny。</li>
                        <li><code>gh pr create</code> 等间接 push：若策略是「禁止出网写远程」，需在<strong>网络类工具</strong>另表约束，与 git 子命令策略<strong>合并考虑</strong>。</li>
                    </ul>
                    <div class="code-block">
                        <pre><code class="language-typescript">// 权限层伪代码：仅示意「在 spawn 之前」如何分支
function gitPolicyFromArgv(argv: string[]): 'allow' | 'deny' | 'ask' {
  // 1. 归一化：去掉 env 赋值、取到 git 与其子命令（需真实解析器，勿只靠 split）
  const sub = extractGitSubcommand(argv) // e.g. 'commit' | 'push' | null
  if (sub === 'push') return 'deny'
  if (sub === 'commit') return 'allow' // 还可再检查 -C、文件路径
  return 'ask'
}</code></pre>
                    </div>
                </section>

                <section class="section-block" id="d12-q-git-symlink">
                    <h2>✏️ 自测 2 · 参考答案：<code>.git</code> 在 workspace 外与 symlink</h2>
                    <h3>题干</h3>
                    <p>若 <code>.git</code> 在 workspace 外，工具应拒绝还是跟随 symlink？</p>
                    <h3>结论（教学上的安全默认）</h3>
                    <p><strong>默认应拒绝</strong>在未额外授权的情况下对「解析后真实路径不在工作区内的 Git 仓库」执行写操作。理由：跟随 symlink 会把<strong>工作区内的路径</strong>映射到<strong>盘外任意 Git 目录</strong>，等价于隐蔽的目录穿越 —— 模型以为在改课程仓库，实际在改用户别的项目。</p>
                    <h3>推荐实现步骤</h3>
                    <ol>
                        <li>对涉及仓库的路径（含 <code>.git</code>、<code>gitdir</code>、worktree）做 <code>realpath</code> / 等价解析，得到<strong>规范绝对路径</strong>。</li>
                        <li>校验 <code>realpath(repoRoot)</code> 是否以<strong>配置的 workspace 根</strong>为前缀（注意尾随 <code>/</code> 与大小写/Unicode 规范化）。不通过 → deny 或只读降级。</li>
                        <li>Symlink：可在「允许跟随」与「拒绝跟随」二选一作为产品策略；若跟随，<strong>必须在权限判断里用解析后的目标路径</strong>，而不是用户可见的 symlink 路径字符串。</li>
                    </ol>
                    <h3>何时可以「跟随」</h3>
                    <p>仅当产品明确把 workspace 定义为「逻辑视图」且用户<strong>显式勾选</strong>「允许通过 symlink 指向外部裸仓」并写入审计日志时，才可放行；否则一律按上面默认拒绝写、或仅允许 <code>status</code>/<code>log</code> 等只读且仍记录真实路径。</p>
                </section>

                <section class="section-block">
                    <h2>✏️ 自测（题干回顾）</h2>
                    <ul>
                        <li><code>commit</code> 放行、<code>push</code> 禁止如何实现？→ <a href="#d12-q-commit-no-push">自测 1</a></li>
                        <li><code>.git</code> 在外或 symlink？→ <a href="#d12-q-git-symlink">自测 2</a></li>
                    </ul>
                </section>
    """,
]

assert len(DEEP_BODIES) == 12
