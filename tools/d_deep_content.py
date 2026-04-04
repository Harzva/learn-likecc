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

                <section class="section-block">
                    <h2>✏️ 自测</h2>
                    <ul>
                        <li>不看源码：用笔画一条「用户一句话 → 两轮 tool → 结束」的时序，标出 4 条消息类型。</li>
                        <li>回答：若第二次模型返回空 tool 块，宿主应在哪一层停止循环？</li>
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
                </section>

                <section class="section-block">
                    <h2>🔗 与相邻章节</h2>
                    <ul>
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

                <section class="section-block">
                    <h2>✏️ 自测</h2>
                    <ul>
                        <li>解释：为什么 execute 不应吞掉异常而返回「假成功」？</li>
                        <li>设计：若同一 tool name 被 MCP 与内置同时注册，你会如何在代码层消歧？</li>
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

                <section class="section-block">
                    <h2>✏️ 自测</h2>
                    <ul>
                        <li>用三句话说明 <code>dontAsk</code> 与 <code>bypassPermissions</code> 的差异（语义与实现位置）。</li>
                        <li>若要把「只允许 workspace 内写」做成硬策略，你会挂在权限层还是工具层？理由？</li>
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

                <section class="section-block">
                    <h2>✏️ 自测</h2>
                    <ul>
                        <li>设计一个命令「只打印当前有效配置」，应读取合并后的哪一数据结构？</li>
                        <li>若 <code>/command</code> 与用户消息解析冲突，你会如何在词法层消除歧义？</li>
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

                <section class="section-block">
                    <h2>📖 走读顺序</h2>
                    <ol>
                        <li>搜索 <code>compress</code>、<code>truncate</code>、<code>summary</code>、<code>token</code> 相关函数，列调用栈。</li>
                        <li>构造一条超长工具输出，打日志看压缩前后消息长度与结构变化。</li>
                        <li>回答：压缩后的消息是否仍满足 API schema？</li>
                    </ol>
                </section>

                <section class="section-block">
                    <h2>✏️ 自测</h2>
                    <ul>
                        <li>给出一种「压缩后模型必然做错」的场景，并说明如何改策略避免。</li>
                        <li>比较：摘要由「小模型」与「规则」各有什么工程代价？</li>
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

                <section class="section-block">
                    <h2>✏️ 自测</h2>
                    <ul>
                        <li>若子代理读到 <code>.env</code> 而父未显式传入，这是泄露还是特性？你会怎么修？</li>
                        <li>设计一个「子任务成功但父任务应失败」的验收测试。</li>
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

                <section class="section-block">
                    <h2>✏️ 自测</h2>
                    <ul>
                        <li>解释为何 MCP 不宜在每次 tool call 时重新 handshake。</li>
                        <li>若两个 server 提供同名 tool，你会选前缀还是 UUID？利弊？</li>
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

                <section class="section-block">
                    <h2>✏️ 自测</h2>
                    <ul>
                        <li>若允许并行 3 个 running 任务，如何避免同一文件被双写？</li>
                        <li>任务持久化若只存 title 不存 acceptance criteria，会有什么问题？</li>
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

                <section class="section-block">
                    <h2>✏️ 自测</h2>
                    <ul>
                        <li>设计一个「宿主覆盖 IDE 未保存 buffer」的测试用例。</li>
                        <li>解释为何 bridge 不应直接执行任意 shell（应走工具+权限）。</li>
                    </ul>
                </section>
    """,
    # D10 Hooks Extension
    """
                <section class="section-block">
                    <h2>🔬 深挖目标</h2>
                    <p>Hooks 把固定流程变成可插拔管道：<strong>何时触发、入参上下文、可否阻断、失败是否致命、是否幂等</strong>，必须在文档与代码里一致。</p>
                </section>

                <section class="section-block">
                    <h2>🪝 生命周期矩阵</h2>
                    <ul>
                        <li><strong>Pre</strong>：能否修改即将执行的参数？改坏谁来背锅？</li>
                        <li><strong>Post</strong>：能否改写 ToolResult？若改写，审计链怎么记？</li>
                        <li><strong>全局 vs 每工具</strong>：注册顺序与短路规则。</li>
                    </ul>
                </section>

                <section class="section-block">
                    <h2>🧪 幂等与沙箱</h2>
                    <table class="options-table">
                        <tr><th>风险</th><th>缓解</th></tr>
                        <tr><td>Hook 再调模型 → 递归</td><td>深度计数 / 禁止重入</td></tr>
                        <tr><td>Hook 写磁盘</td><td>权限继承 D03 + 路径白名单</td></tr>
                        <tr><td>Hook 抛错</td><td>明确：阻断主流程 vs 仅记录</td></tr>
                    </table>
                </section>

                <section class="section-block">
                    <h2>📖 走读顺序</h2>
                    <ol>
                        <li>找到 hook 注册与调度器，列出所有事件名。</li>
                        <li>为每个事件标注：同步还是 async、超时默认值。</li>
                        <li>写一个小 hook 插件，验证 pre/post 各触发一次。</li>
                    </ol>
                </section>

                <section class="section-block">
                    <h2>✏️ 自测</h2>
                    <ul>
                        <li>若两个 hook 修改同一参数，顺序由谁决定？如何向用户解释？</li>
                        <li>Post-hook 能否实现「自动 approve 某类工具」？安全代价？</li>
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

                <section class="section-block">
                    <h2>✏️ 自测</h2>
                    <ul>
                        <li>解释：为何 Vim 层应在「业务命令解析」之前还是之后？</li>
                        <li>若用户关闭 vim 模式 mid-session，状态应如何重置？</li>
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

                <section class="section-block">
                    <h2>✏️ 自测</h2>
                    <ul>
                        <li>设计策略：允许模型 <code>git commit</code> 但禁止 <code>git push</code>，在权限层如何实现？</li>
                        <li>若 .git 在 workspace 外，工具应拒绝还是跟随 symlink？</li>
                    </ul>
                </section>
    """,
]

assert len(DEEP_BODIES) == 12
