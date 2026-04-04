// 应用脚本
// Mermaid 流程图定义（key 对应 data-mermaid-diagram）
const MERMAID_DIAGRAMS = {
    'agent-loop': `graph TD
    classDef yellowBox fill:#2d2a1e,stroke:#e2b953,stroke-width:2px,color:#e2b953;
    classDef blueBox fill:#1e2838,stroke:#3b82f6,stroke-width:2px,color:#3b82f6;
    classDef greenBox fill:#1c2d26,stroke:#10b981,stroke-width:2px,color:#10b981;

    Step1[1 用户输入]:::blueBox --> Step2[2 查询初始化]:::blueBox
    Step2 --> Step3[3 上下文准备]:::yellowBox
    Step3 --> Step4[4 API 调用]:::greenBox

    subgraph Loop [循环执行]
        Step4 --> Step5[5 流式处理]:::greenBox
    end

    style Loop fill:#313244,stroke:#89b4fa,stroke-dasharray: 5 5`,

    /** 12 章源码课程总览：运行时主链 + Part1–3 + Source Map 契机 + Agent 生态扩展 */
    'course-map': `graph TB
    classDef yellowBox fill:#2d2a1e,stroke:#e2b953,stroke-width:2px,color:#e2b953;
    classDef blueBox fill:#1e2838,stroke:#3b82f6,stroke-width:2px,color:#3b82f6;
    classDef greenBox fill:#1c2d26,stroke:#10b981,stroke-width:2px,color:#10b981;
    classDef purpleBox fill:#2b2035,stroke:#cba6f7,stroke-width:2px,color:#cba6f7;

    SM["Source Map 事件 2026.03<br/>约 57MB cli.js.map 误入正式包"]:::purpleBox

    subgraph RT ["运行时主链 · 对照 S01"]
        R1["1 用户输入"]:::blueBox --> R2["2 查询初始化"]:::blueBox
        R2 --> R3["3 上下文准备"]:::yellowBox
        R3 --> R4["4 API 调用"]:::greenBox
        R4 --> R5["5 流式处理 · 循环"]:::greenBox
    end

    SM -.->|学习契机| R1

    subgraph P1 ["Part 1 · 核心架构"]
        S01["S01 Agent Loop<br/>主循环与状态"]:::blueBox --> S02["S02 Tool System<br/>工具定义与调用"]:::blueBox
        S02 --> S03["S03 Permission Model<br/>权限与用户交互"]:::yellowBox --> S04["S04 Command Interface<br/>CLI 命令处理"]:::greenBox
    end

    R5 --> S01

    subgraph P2 ["Part 2 · 高级特性"]
        S05["S05 Context Compression<br/>消息压缩"]:::yellowBox --> S06["S06 Subagent Fork<br/>子代理与分支"]:::blueBox
        S06 --> S07["S07 MCP Protocol<br/>模型上下文协议"]:::greenBox --> S08["S08 Task Management<br/>任务队列与调度"]:::greenBox
    end

    subgraph P3 ["Part 3 · 扩展集成"]
        S09["S09 Bridge IDE<br/>IDE 集成与通信"]:::blueBox --> S10["S10 Hooks Extension<br/>钩子扩展"]:::yellowBox
        S10 --> S11["S11 Vim Mode<br/>Vim 键绑定"]:::greenBox --> S12["S12 Git Integration<br/>Git 工作流"]:::greenBox
    end

    S04 --> S05
    S08 --> S09

    EXT["Agent 生态对比<br/>技能包 · Subagents / Teams"]:::purpleBox
    S06 -.->|扩展阅读| EXT

    style RT fill:#181825,stroke:#89b4fa,stroke-width:1px
    style P1 fill:#13131a,stroke:#e2b953,stroke-dasharray:5 4
    style P2 fill:#13131a,stroke:#3b82f6,stroke-dasharray:5 4
    style P3 fill:#13131a,stroke:#10b981,stroke-dasharray:5 4`,

    'course-24': `graph TB
    classDef sBox fill:#1e2838,stroke:#3b82f6,stroke-width:2px,color:#93c5fd;
    classDef dBox fill:#1c2d26,stroke:#14b8a6,stroke-width:2px,color:#5eead4;

    subgraph P1 ["Part 1 · 第 1–8 讲"]
        direction LR
        A1[S01]:::sBox --> B1[D01]:::dBox --> A2[S02]:::sBox --> B2[D02]:::dBox
        A3[S03]:::sBox --> B3[D03]:::dBox --> A4[S04]:::sBox --> B4[D04]:::dBox
    end

    subgraph P2 ["Part 2 · 第 9–16 讲"]
        direction LR
        A5[S05]:::sBox --> B5[D05]:::dBox --> A6[S06]:::sBox --> B6[D06]:::dBox
        A7[S07]:::sBox --> B7[D07]:::dBox --> A8[S08]:::sBox --> B8[D08]:::dBox
    end

    subgraph P3 ["Part 3 · 第 17–24 讲"]
        direction LR
        A9[S09]:::sBox --> B9[D09]:::dBox --> A10[S10]:::sBox --> B10[D10]:::dBox
        A11[S11]:::sBox --> B11[D11]:::dBox --> A12[S12]:::sBox --> B12[D12]:::dBox
    end

    P1 --> P2
    P2 --> P3

    style P1 fill:#13131a,stroke:#e2b953,stroke-dasharray:5 4
    style P2 fill:#13131a,stroke:#3b82f6,stroke-dasharray:5 4
    style P3 fill:#13131a,stroke:#10b981,stroke-dasharray:5 4`,

    'devlog-loop': `graph TB
    classDef yellowBox fill:#2d2a1e,stroke:#e2b953,stroke-width:2px,color:#e2b953;
    classDef blueBox fill:#1e2838,stroke:#3b82f6,stroke-width:2px,color:#3b82f6;
    classDef greenBox fill:#1c2d26,stroke:#10b981,stroke-width:2px,color:#10b981;
    classDef purpleBox fill:#2b2035,stroke:#cba6f7,stroke-width:2px,color:#cba6f7;
    classDef pinkBox fill:#2d1f28,stroke:#f472b6,stroke-width:2px,color:#f9a8d4;

    subgraph BOOT ["① 可迭代工程基座"]
        A[仓库与构建目标]:::blueBox --> B[".claude 技能 / 命令"]:::yellowBox
        B --> C[reference 仓库与论文]:::yellowBox
        C --> D[长期规划 v.x.x_plan.md]:::greenBox
    end

    subgraph OUTER ["② 外层 Loop（计划驱动）"]
        D --> L["/loop 时间盒执行"]:::purpleBox
        L --> Q{当前计划条目<br/>是否全部完成?}:::pinkBox
        Q -->|否| W[按条目改代码 / 编译 / 记录]:::blueBox
        W --> Q
        Q -->|是| R[复盘结果与实验目标]:::greenBox
        R --> N[撰写下一版 v.x+1_plan.md<br/>开篇承上启下]:::greenBox
    end

    subgraph INNER ["③ 内层 Loop（递归）"]
        N --> X[新计划尾部约定<br/>再次触发完整 /loop]:::purpleBox
        X --> L
    end

    style BOOT fill:#13131a,stroke:#89b4fa,stroke-dasharray:5 4
    style OUTER fill:#16161e,stroke:#e2b953,stroke-dasharray:5 4
    style INNER fill:#16161e,stroke:#f472b6,stroke-dasharray:5 4`,

    /** 仅双层循环：不含基座；与 devlog.html「Loop-in-Loop」小节配套 */
    'loop-in-loop': `flowchart TB
    classDef act fill:#1e2838,stroke:#3b82f6,stroke-width:2px,color:#93c5fd;
    classDef done fill:#1c2d26,stroke:#10b981,stroke-width:2px,color:#5eead4;
    classDef ask fill:#2d1f28,stroke:#f472b6,stroke-width:2px,color:#f9a8d4;
    classDef nest fill:#2b2035,stroke:#cba6f7,stroke-width:2px,color:#e9d5ff;

    subgraph OUTER ["外层 Loop · 锁在「当前这一版」plan 上"]
        A[以 plan vN 为清单<br/>时间盒内推进]:::act --> Q{条目是否<br/>全部完成?}:::ask
        Q -->|否| W[按条目实现 · 编译验证 · 落记录]:::act
        W --> A
        Q -->|是| R[复盘：结果 · 实验 · 遗留]:::done
        R --> N[撰写 plan vN+1<br/>开篇承上启下 + 新条目]:::done
    end

    N --> T[内层 Loop<br/>文末显式约定：再跑同一套规程]:::nest
    T -->|套用到新文件<br/>Loop-in-Loop| A

    style OUTER fill:#13131a,stroke:#e2b953,stroke-dasharray:5 4`,

    'course-s01': `graph LR
    classDef b fill:#1e2838,stroke:#3b82f6,stroke-width:2px,color:#3b82f6;
    classDef g fill:#1c2d26,stroke:#10b981,stroke-width:2px,color:#10b981;
    U[User 输入]:::b --> M[LLM 推理]:::b --> T[Tool 执行]:::g
    T -->|tool_result| M
    M -->|无 tool_use 则结束| E[结束回合]:::g`,

    'course-s02': `graph TB
    classDef b fill:#1e2838,stroke:#3b82f6,stroke-width:2px,color:#3b82f6;
    classDef y fill:#2d2a1e,stroke:#e2b953,stroke-width:2px,color:#e2b953;
    classDef g fill:#1c2d26,stroke:#10b981,stroke-width:2px,color:#10b981;
    D[Tool 定义 schema]:::b --> P[权限检查]:::y --> X[execute]:::g --> R[ToolResult]:::g`,

    'course-s03': `graph LR
    classDef b fill:#1e2838,stroke:#3b82f6,stroke-width:2px,color:#3b82f6;
    classDef y fill:#2d2a1e,stroke:#e2b953,stroke-width:2px,color:#e2b953;
    classDef g fill:#1c2d26,stroke:#10b981,stroke-width:2px,color:#10b981;
    R[工具请求]:::b --> C{策略}:::y
    C -->|需确认| U[用户]:::y
    C -->|放行| O[执行]:::g`,

    'course-s04': `graph TB
    classDef b fill:#1e2838,stroke:#3b82f6,stroke-width:2px,color:#3b82f6;
    classDef g fill:#1c2d26,stroke:#10b981,stroke-width:2px,color:#10b981;
    argv[argv / stdin]:::b --> mode{交互 / -p 管道}:::b --> core[命令内核]:::g --> api[进入 Agent 会话]:::g`,

    'course-s05': `graph LR
    classDef y fill:#2d2a1e,stroke:#e2b953,stroke-width:2px,color:#e2b953;
    classDef g fill:#1c2d26,stroke:#10b981,stroke-width:2px,color:#10b981;
    H[消息历史]:::y --> K[压缩策略]:::y --> S[保留摘要 + 尾部]:::g --> N[下一轮上下文]:::g`,

    'course-s06': `graph TB
    classDef b fill:#1e2838,stroke:#3b82f6,stroke-width:2px,color:#3b82f6;
    classDef g fill:#1c2d26,stroke:#10b981,stroke-width:2px,color:#10b981;
    P[Parent Agent]:::b --> A1[Subagent 1]:::g
    P --> A2[Subagent 2]:::g
    A1 --> M[合并摘要]:::b
    A2 --> M`,

    'course-s07': `graph LR
    classDef b fill:#1e2838,stroke:#3b82f6,stroke-width:2px,color:#3b82f6;
    classDef g fill:#1c2d26,stroke:#10b981,stroke-width:2px,color:#10b981;
    CC[Claude Code]:::b <-->|MCP| S[外部 Tool Server]:::g`,

    'course-s08': `graph TB
    classDef b fill:#1e2838,stroke:#3b82f6,stroke-width:2px,color:#3b82f6;
    classDef g fill:#1c2d26,stroke:#10b981,stroke-width:2px,color:#10b981;
    T[Task 队列]:::b --> D{依赖就绪?}:::b
    D -->|是| R[运行]:::g
    D -->|否| W[等待]:::g`,

    'course-s09': `graph LR
    classDef b fill:#1e2838,stroke:#3b82f6,stroke-width:2px,color:#3b82f6;
    classDef g fill:#1c2d26,stroke:#10b981,stroke-width:2px,color:#10b981;
    IDE[VS Code 扩展]:::b <-->|WebSocket| BR[Bridge Server]:::g --> CLI[Claude CLI]:::b`,

    'course-s10': `graph TB
    classDef y fill:#2d2a1e,stroke:#e2b953,stroke-width:2px,color:#e2b953;
    classDef g fill:#1c2d26,stroke:#10b981,stroke-width:2px,color:#10b981;
    E[事件点]:::y --> H[Hook 脚本]:::g --> F[继续主流程]:::g`,

    'course-s11': `graph LR
    classDef b fill:#1e2838,stroke:#3b82f6,stroke-width:2px,color:#3b82f6;
    classDef g fill:#1c2d26,stroke:#10b981,stroke-width:2px,color:#10b981;
    K[按键]:::b --> V{Vim 状态机}:::g --> A[动作]:::g`,

    'course-s12': `graph TB
    classDef b fill:#1e2838,stroke:#3b82f6,stroke-width:2px,color:#3b82f6;
    classDef g fill:#1c2d26,stroke:#10b981,stroke-width:2px,color:#10b981;
    A[对话意图]:::b --> G[git 读状态]:::g --> C[commit / branch / PR]:::g`,

    /** column-agent-journey.html：个人工具链重心迁移（示意） */
    'column-agent-flow': `flowchart LR
    classDef old fill:#2d2a1e,stroke:#e2b953,stroke-width:2px,color:#e2b953;
    classDef mid fill:#1e2838,stroke:#3b82f6,stroke-width:2px,color:#93c5fd;
    classDef now fill:#1c2d26,stroke:#10b981,stroke-width:2px,color:#5eead4;
    A[插件试玩<br/>多宿主尝鲜]:::old --> B[反代链路<br/>折腾 TUN/SSH]:::mid
    B --> C[CLI 扎根<br/>Claude Code + Agent IDE]:::now`,

    /** topic-memory-harness.html：Memory 写入 / 整合 / 检索 / 安全（示意，非官方逐行实现） */
    'memory-write-p1': `flowchart TD
    classDef b fill:#1e2838,stroke:#3b82f6,stroke-width:2px,color:#93c5fd;
    classDef g fill:#1c2d26,stroke:#10b981,stroke-width:2px,color:#5eead4;
    classDef p fill:#2d1f28,stroke:#f472b6,stroke-width:2px,color:#f9a8d4;
    A[后台 Agent 浏览最近 N 条消息]:::b --> B[接收现有记忆<br/>避免重复创建]:::b
    B --> Q{值得记住?}:::p
    Q -->|否| S[跳过]:::g
    Q -->|是| F{新建或更新?}:::p
    F -->|新建| N[新建 .md 记忆文件]:::g
    F -->|更新| U[更新已有文件]:::g
    N --> I[写入 MEMORY.md 索引<br/>目录与单行摘要]:::g
    U --> I`,

    'memory-types': `flowchart TD
    classDef b fill:#1e2838,stroke:#3b82f6,stroke-width:2px,color:#93c5fd;
    classDef g fill:#1c2d26,stroke:#10b981,stroke-width:2px,color:#5eead4;
    ROOT[frontmatter.type]:::b --> U[用户 user<br/>角色与偏好]:::g
    ROOT --> PR[项目 project<br/>截止与决策]:::g
    ROOT --> FB[反馈 feedback<br/>纠错与规范]:::g
    ROOT --> RF[参考 ref<br/>外部系统指引]:::g`,

    'memory-consolidate': `flowchart TD
    classDef b fill:#1e2838,stroke:#3b82f6,stroke-width:2px,color:#93c5fd;
    classDef g fill:#1c2d26,stroke:#10b981,stroke-width:2px,color:#5eead4;
    classDef p fill:#2d1f28,stroke:#f472b6,stroke-width:2px,color:#f9a8d4;
    classDef y fill:#2d2a1e,stroke:#e2b953,stroke-width:2px,color:#e2b953;
    T{距上次整合≥24h<br/>且会话≥5?}:::y -->|否| X[不触发]:::g
    T -->|是| SA[分叉子 Agent<br/>示意名 autoDream]:::b
    SA --> R1[读 MEMORY.md<br/>浏览主题文件]:::g
    R1 --> R2[日志与会话<br/>关键词检索信号]:::g
    R2 --> MG[合并<br/>相对日期改绝对<br/>删与代码矛盾事实]:::p
    MG --> PRU[修剪<br/>无效索引冗长<br/>矛盾消解]:::p
    PRU --> D[完成]:::g`,

    'memory-retrieve': `flowchart TD
    classDef b fill:#1e2838,stroke:#3b82f6,stroke-width:2px,color:#93c5fd;
    classDef g fill:#1c2d26,stroke:#10b981,stroke-width:2px,color:#5eead4;
    classDef p fill:#2d1f28,stroke:#f472b6,stroke-width:2px,color:#f9a8d4;
    classDef y fill:#2d2a1e,stroke:#e2b953,stroke-width:2px,color:#e2b953;
    IDX[MEMORY.md 恒入系统提示<br/>约 200 行或 25KB 上限]:::b --> SCAN[扫描至多 200 个文件 frontmatter<br/>按时间排序]:::b
    SCAN --> LIST[列表 type 文件名 时间 description]:::g
    LIST --> SON[独立模型做相关性过滤<br/>示意 Sonnet]:::p
    SON --> TOP[至多 5 个文件<br/>不确定则不选]:::g
    TOP --> LOAD[载入上下文<br/>本会话已展示的不重复]:::g
    LOAD --> ST{单条早于约 1 天?}:::y
    ST -->|是| WARN[注入陈旧警告<br/>先 grep 或读文件再行动]:::p
    ST -->|否| OK[可参考仍建议 spot-check]:::g`,

    'memory-security': `flowchart LR
    classDef r fill:#3f1d1d,stroke:#f87171,stroke-width:2px,color:#fecaca;
    classDef y fill:#2d2a1e,stroke:#e2b953,stroke-width:2px,color:#e2b953;
    classDef g fill:#1c2d26,stroke:#10b981,stroke-width:2px,color:#5eead4;
    L1[全局锁定存储路径]:::r --> L2[路径校验<br/>拦截 .. 与越权]:::y
    L2 --> L3[沙箱白名单写入]:::g
    L3 --> W[安全写入]:::g`,

    /** topic-superpowers-autoresearch.html：市场目录 vs autoresearch 单包 */
    'sp-marketplace-vs-autoresearch': `flowchart LR
    classDef b fill:#1e2838,stroke:#3b82f6,stroke-width:2px,color:#93c5fd;
    classDef g fill:#1c2d26,stroke:#10b981,stroke-width:2px,color:#5eead4;
    classDef p fill:#2b2035,stroke:#cba6f7,stroke-width:2px,color:#e9d5ff;
    subgraph MP[Superpowers Marketplace]
        MJ[marketplace.json]:::b
        MJ --> P1[superpowers 等]:::g
        MJ --> P2[更多插件条目]:::g
    end
    subgraph AR[autoresearch 单包]
        ONE[plugin + SKILL]:::p
        ONE --> CMD[10 条斜杠命令]:::g
    end`,

    'autoresearch-verify-loop': `flowchart TD
    classDef b fill:#1e2838,stroke:#3b82f6,stroke-width:2px,color:#93c5fd;
    classDef g fill:#1c2d26,stroke:#10b981,stroke-width:2px,color:#5eead4;
    classDef p fill:#2d1f28,stroke:#f472b6,stroke-width:2px,color:#f9a8d4;
    A[读上下文 git 日志]:::b --> B[一次一处改动]:::b
    B --> C[commit]:::g
    C --> D[Verify 指标]:::g
    D --> E{改进且 Guard?}:::p
    E -->|是| F[保留]:::g
    E -->|否| G[revert]:::g
    F --> H[TSV 日志]:::b
    G --> H
    H --> A`
}

function fillMermaidPlaceholders() {
    document.querySelectorAll('[data-mermaid-diagram]').forEach((host) => {
        const key = host.getAttribute('data-mermaid-diagram')
        const text = MERMAID_DIAGRAMS[key]
        if (!text) return
        host.replaceChildren()
        const el = document.createElement('div')
        el.className = 'mermaid mermaid-flowchart'
        el.textContent = text.trim()
        host.appendChild(el)
    })
}

function initMermaidFlowcharts() {
    if (typeof mermaid === 'undefined') return
    const hasHost = document.querySelector('[data-mermaid-diagram]')
    if (!hasHost) return
    fillMermaidPlaceholders()
    mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        securityLevel: 'loose',
        themeVariables: {
            background: '#11111b',
            primaryColor: '#1e1e2e',
            primaryTextColor: '#cdd6f4',
            primaryBorderColor: '#89b4fa',
            lineColor: '#f5e0dc',
            secondaryColor: '#313244',
            tertiaryColor: '#11111b',
            fontSize: '14px',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
        }
    })
    mermaid.run({ querySelector: '.mermaid-flowchart' }).catch((err) => {
        console.warn('Mermaid render failed:', err)
    })
}

/** 可收缩站点侧栏：html 根节点设 data-site-sidebar 启用 */
function initSiteSidebar() {
    const root = document.documentElement
    if (!root.hasAttribute('data-site-sidebar')) return
    if (document.getElementById('site-sidebar')) return

    const collapsed = localStorage.getItem('site-sidebar-collapsed') === '1'
    document.body.classList.add('has-site-sidebar')
    if (collapsed) document.body.classList.add('sidebar-collapsed')

    const aside = document.createElement('aside')
    aside.id = 'site-sidebar'
    aside.className = 'site-sidebar' + (collapsed ? ' site-sidebar--collapsed' : '')
    aside.setAttribute('aria-label', '站点导航')

    const chapters = []
    for (let i = 1; i <= 12; i++) {
        const n = String(i).padStart(2, '0')
        chapters.push(
            '<a class="site-sidebar__link site-sidebar__link--sub" href="s' +
                n +
                '.html">S' +
                n +
                ' 主线</a>' +
                '<a class="site-sidebar__link site-sidebar__link--sub site-sidebar__link--deep" href="d' +
                n +
                '.html">D' +
                n +
                ' 深挖</a>'
        )
    }

    // 侧栏 <details> 默认折叠，只显示 summary 大标题；读者点击再展开子项
    aside.innerHTML =
        '<button type="button" class="site-sidebar__collapse" aria-label="收起或展开侧栏" title="展开/收起">' +
        (collapsed ? '⟩' : '⟨') +
        '</button>' +
        '<div class="site-sidebar__scroll">' +
        '<a class="site-sidebar__link site-sidebar__link--brand" href="index.html"><span class="site-sidebar__ico">🧠</span><span class="site-sidebar__txt">首页</span></a>' +
        '<details class="site-sidebar__details">' +
        '<summary class="site-sidebar__summary"><span class="site-sidebar__ico">🗺️</span><span class="site-sidebar__txt">Source Map 源码专题</span></summary>' +
        '<a class="site-sidebar__link site-sidebar__link--sub" href="topic-sourcemap.html"><span class="site-sidebar__ico">📌</span><span class="site-sidebar__txt">专题导读</span></a>' +
        '<a class="site-sidebar__link site-sidebar__link--sub" href="index.html#courses"><span class="site-sidebar__ico">📚</span><span class="site-sidebar__txt">24 讲目录</span></a>' +
        '<a class="site-sidebar__link site-sidebar__link--sub" href="index.html#source-map-event"><span class="site-sidebar__ico">🔥</span><span class="site-sidebar__txt">Source Map 事件</span></a>' +
        '<a class="site-sidebar__link site-sidebar__link--sub" href="topic-source-derived.html"><span class="site-sidebar__ico">🔍</span><span class="site-sidebar__txt">源码反推思想</span></a>' +
        '<a class="site-sidebar__link site-sidebar__link--sub" href="https://github.com/Harzva/learn-likecc/blob/main/awesome-claude-code-source.md" target="_blank" rel="noopener noreferrer"><span class="site-sidebar__ico">✨</span><span class="site-sidebar__txt">Awesome 源码汇总</span></a>' +
        '<details class="site-sidebar__details site-sidebar__details--nested">' +
        '<summary class="site-sidebar__summary"><span class="site-sidebar__ico">🔬</span><span class="site-sidebar__txt">十二章列表</span></summary>' +
        '<div class="site-sidebar__chapters">' +
        chapters.join('') +
        '</div></details></details>' +
        '<a class="site-sidebar__link" href="tutorial.html"><span class="site-sidebar__ico">📖</span><span class="site-sidebar__txt">官方教程</span></a>' +
        '<a class="site-sidebar__link" href="tutorial.html#skills"><span class="site-sidebar__ico">🔧</span><span class="site-sidebar__txt">Skills</span></a>' +
        '<a class="site-sidebar__link" href="handbook.html"><span class="site-sidebar__ico">📘</span><span class="site-sidebar__txt">完全手册</span></a>' +
        '<details class="site-sidebar__details">' +
        '<summary class="site-sidebar__summary"><span class="site-sidebar__ico">📎</span><span class="site-sidebar__txt">RAG 专题</span></summary>' +
        '<a class="site-sidebar__link site-sidebar__link--sub" href="topic-rag.html"><span class="site-sidebar__ico">📌</span><span class="site-sidebar__txt">专题首页</span></a>' +
        '<a class="site-sidebar__link site-sidebar__link--sub" href="https://github.com/Harzva/learn-likecc/blob/main/awesome-rag.md" target="_blank" rel="noopener noreferrer"><span class="site-sidebar__ico">✨</span><span class="site-sidebar__txt">Awesome RAG</span></a>' +
        '</details>' +
        '<details class="site-sidebar__details">' +
        '<summary class="site-sidebar__summary"><span class="site-sidebar__ico">🤖</span><span class="site-sidebar__txt">Agent 专题</span></summary>' +
        '<a class="site-sidebar__link site-sidebar__link--sub" href="topic-agent.html"><span class="site-sidebar__ico">📌</span><span class="site-sidebar__txt">专题首页</span></a>' +
        '<a class="site-sidebar__link site-sidebar__link--sub" href="topic-memory-harness.html"><span class="site-sidebar__ico">🧠</span><span class="site-sidebar__txt">Memory 机制</span></a>' +
        '<a class="site-sidebar__link site-sidebar__link--sub" href="topic-superpowers-autoresearch.html"><span class="site-sidebar__ico">🧩</span><span class="site-sidebar__txt">Superpowers vs Autoresearch</span></a>' +
        '<a class="site-sidebar__link site-sidebar__link--sub" href="https://github.com/Harzva/learn-likecc/blob/main/awesome-agent.md" target="_blank" rel="noopener noreferrer"><span class="site-sidebar__ico">✨</span><span class="site-sidebar__txt">Awesome Agent</span></a>' +
        '</details>' +
        '<a class="site-sidebar__link" href="column-agent-journey.html"><span class="site-sidebar__ico">🧭</span><span class="site-sidebar__txt">工具链阅历</span></a>' +
        '<a class="site-sidebar__link" href="column-shangshou-cikeng.html"><span class="site-sidebar__ico">🛠️</span><span class="site-sidebar__txt">上手与踩坑</span></a>' +
        '<a class="site-sidebar__link" href="devlog.html"><span class="site-sidebar__ico">📝</span><span class="site-sidebar__txt">开发日志</span></a>' +
        '<a class="site-sidebar__link" href="https://github.com/Harzva/learn-likecc" target="_blank" rel="noopener noreferrer"><span class="site-sidebar__ico">🐙</span><span class="site-sidebar__txt">GitHub</span></a>' +
        '</div>'

    const backdrop = document.createElement('div')
    backdrop.className = 'site-sidebar__backdrop'
    backdrop.hidden = true
    backdrop.setAttribute('aria-hidden', 'true')

    const fab = document.createElement('button')
    fab.type = 'button'
    fab.className = 'site-sidebar__fab'
    fab.setAttribute('aria-label', '打开导航')
    fab.textContent = '☰'

    document.body.insertBefore(aside, document.body.firstChild)
    aside.after(backdrop)
    document.body.appendChild(fab)

    const collapseBtn = aside.querySelector('.site-sidebar__collapse')

    function setCollapsed(next) {
        if (next) {
            aside.classList.add('site-sidebar--collapsed')
            document.body.classList.add('sidebar-collapsed')
            collapseBtn.textContent = '⟩'
        } else {
            aside.classList.remove('site-sidebar--collapsed')
            document.body.classList.remove('sidebar-collapsed')
            collapseBtn.textContent = '⟨'
        }
        localStorage.setItem('site-sidebar-collapsed', next ? '1' : '0')
    }

    collapseBtn.addEventListener('click', () => {
        if (window.matchMedia('(max-width: 900px)').matches) {
            aside.classList.toggle('site-sidebar--open')
            const open = aside.classList.contains('site-sidebar--open')
            backdrop.hidden = !open
            return
        }
        setCollapsed(!aside.classList.contains('site-sidebar--collapsed'))
    })

    backdrop.addEventListener('click', () => {
        aside.classList.remove('site-sidebar--open')
        backdrop.hidden = true
    })

    fab.addEventListener('click', () => {
        aside.classList.add('site-sidebar--open')
        backdrop.hidden = false
    })

    aside.querySelectorAll('a.site-sidebar__link').forEach((a) => {
        a.addEventListener('click', () => {
            if (window.matchMedia('(max-width: 900px)').matches) {
                aside.classList.remove('site-sidebar--open')
                backdrop.hidden = true
            }
        })
    })
}

/** 页脚展示全站访问计数（hits.sh，各页共用同一 key 即累计全站） */
function initSiteViewCounter() {
    if (document.getElementById('site-view-counter-wrap')) return

    const statsUrl = 'https://hits.sh/github.com/Harzva/learn-likecc/'
    const imgSrc =
        'https://hits.sh/github.com/Harzva/learn-likecc.svg?' +
        new URLSearchParams({ label: '本站访问', style: 'flat-square' }).toString()

    const wrap = document.createElement('p')
    wrap.id = 'site-view-counter-wrap'
    wrap.className = 'footer-views'
    wrap.setAttribute(
        'title',
        '统计页面打开次数（含刷新），由第三方 hits.sh 提供，仅供参考；点击可打开统计页'
    )
    wrap.innerHTML =
        '<span class="footer-views__label" aria-hidden="true">本站访问</span>' +
        '<a href="' +
        statsUrl +
        '" target="_blank" rel="noopener noreferrer" aria-label="在 hits.sh 查看访问统计（新窗口打开）">' +
        '<img id="site-view-counter" class="footer-views__img" src="' +
        imgSrc +
        '" alt="本站累计访问次数" height="20" loading="lazy" decoding="async">' +
        '</a>'

    const mainBottom = document.querySelector('footer.footer-main .footer-bottom-main')
    if (mainBottom) {
        mainBottom.appendChild(wrap)
        return
    }

    const innerBottom = document.querySelector('footer.footer .footer-bottom')
    if (innerBottom) {
        innerBottom.appendChild(wrap)
        return
    }

    const simpleContainer = document.querySelector('footer.footer .container')
    if (simpleContainer) {
        simpleContainer.appendChild(wrap)
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 主题切换 - 支持8种主题
    const themeToggle = document.getElementById('theme-toggle')
    const themes = ['warm', 'light', 'dark', 'ocean', 'forest', 'lavender', 'sunset', 'midnight']
    const themeNames = {
        'warm': '☀️ 暖光',
        'light': '🌞 明亮',
        'dark': '🌙 暗夜',
        'ocean': '🌊 海洋',
        'forest': '🌲 森林',
        'lavender': '💜 薰衣草',
        'sunset': '🌅 日落',
        'midnight': '🌃 午夜'
    }
    let currentThemeIndex = 0

    // 从 localStorage 加载主题
    const savedTheme = localStorage.getItem('theme') || 'warm'
    currentThemeIndex = themes.indexOf(savedTheme)
    if (currentThemeIndex === -1) currentThemeIndex = 0
    document.documentElement.setAttribute('data-theme', savedTheme)
    updateThemeIcon(savedTheme)

    function updateThemeIcon(theme) {
        const themeToggle = document.getElementById('theme-toggle')
        if (themeToggle) {
            themeToggle.innerHTML = `<span>${themeNames[theme] || '🎨'}</span>`
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            currentThemeIndex = (currentThemeIndex + 1) % themes.length
            const newTheme = themes[currentThemeIndex]
            document.documentElement.setAttribute('data-theme', newTheme)
            localStorage.setItem('theme', newTheme)
            updateThemeIcon(newTheme)

            // 添加切换动画
            document.body.style.transition = 'background 0.3s ease, color 0.3s ease'
        })
    }

    // 初始化主题图标
    updateThemeIcon(savedTheme)

    // 代码语言切换 - 从 localStorage 加载
    const savedLang = localStorage.getItem('codeLang') || 'typescript'
    switchCodeLanguage(savedLang)
    const langSwitch = document.getElementById('code-lang-switch')
    if (langSwitch) {
        langSwitch.value = savedLang
    }

    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault()
            const target = document.querySelector(this.getAttribute('href'))
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
        })
    })

    // 导航栏滚动效果
    let lastScroll = 0
    const navbar = document.querySelector('.navbar')

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset

        if (currentScroll > lastScroll && currentScroll > 100) {
            navbar.style.transform = 'translateY(-100%)'
        } else {
            navbar.style.transform = 'translateY(0)'
        }

        lastScroll = currentScroll
    })

    // 课程卡片动画
    document.querySelectorAll('.course-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`
        card.classList.add('animate-fade-in')
    })

    // 代码窗口动画
    const codeWindow = document.querySelector('.code-window')
    if (codeWindow) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate')
                }
            })
        }, { threshold: 0.3 })

        observer.observe(codeWindow)
    }

    // 语言切换
    const langSelect = document.getElementById('lang-switch')
    if (langSelect) {
        langSelect.addEventListener('change', (e) => {
            console.log(`Language switched to: ${e.target.value}`)
            // TODO: 实现语言切换
        })
    }

    // 添加滚动动画
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.overview-card, .course-card, .resource-card')
        elements.forEach(el => {
            const rect = el.getBoundingClientRect()
            if (rect.top < window.innerHeight - 100) {
                el.style.opacity = '1'
                el.style.transform = 'translateY(0)'
            }
        })
    }

    window.addEventListener('scroll', animateOnScroll)
    animateOnScroll() // 初始检查
})

// 代码语言切换函数
function switchCodeLanguage(lang) {
    localStorage.setItem('codeLang', lang)

    // 切换所有代码块
    document.querySelectorAll('code[data-lang]').forEach(code => {
        if (code.getAttribute('data-lang') === lang) {
            code.style.display = 'block'
        } else {
            code.style.display = 'none'
        }
    })

    // 更新代码块标签
    document.querySelectorAll('.code-lang').forEach(label => {
        label.textContent = lang === 'typescript' ? 'TypeScript' : 'Python'
    })
}

// 教程选项卡切换
function initTutorialsTabs() {
    const tabBtns = document.querySelectorAll('.tutorials-tabs .tab-btn')
    const tabContents = document.querySelectorAll('.tutorials-content .tab-content')

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab')

            // 移除所有 active
            tabBtns.forEach(b => b.classList.remove('active'))
            tabContents.forEach(c => c.classList.remove('active'))

            // 添加 active
            btn.classList.add('active')
            document.getElementById(targetTab)?.classList.add('active')
        })
    })
}

// 面试问题分类切换
function initInterviewCategories() {
    const categoryBtns = document.querySelectorAll('.interview-categories .category-btn')
    const categoryContents = document.querySelectorAll('.interview-content .category-content')

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetCategory = btn.getAttribute('data-category')

            // 移除所有 active
            categoryBtns.forEach(b => b.classList.remove('active'))
            categoryContents.forEach(c => c.classList.remove('active'))

            // 添加 active
            btn.classList.add('active')
            document.getElementById(targetCategory)?.classList.add('active')
        })
    })
}

// 展开答案按钮
function initExpandButtons() {
    document.querySelectorAll('.expand-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.question-card')
            const preview = card.querySelector('.answer-preview')

            if (btn.textContent.includes('展开')) {
                // 展开逻辑
                preview.style.maxHeight = 'none'
                btn.textContent = '收起答案'
            } else {
                // 收起逻辑
                preview.style.maxHeight = '200px'
                btn.textContent = '展开完整答案'
            }
        })
    })
}

// 初始化新功能
document.addEventListener('DOMContentLoaded', () => {
    initSiteSidebar()
    initSiteViewCounter()
    initTutorialsTabs()
    initInterviewCategories()
    initExpandButtons()
    initMermaidFlowcharts()
})