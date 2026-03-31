# Voice 模式分析

## 概述

Voice 模式提供语音输入功能，支持按键说话 (Push-to-Talk)。

## 技术实现

### 音频捕获

```typescript
// 采样率配置
const RECORDING_SAMPLE_RATE = 16000
const RECORDING_CHANNELS = 1

// 静音检测
const SILENCE_DURATION_SECS = '2.0'  // 2 秒静音停止
const SILENCE_THRESHOLD = '3%'
```

### 多平台支持

| 平台 | 方式 |
|------|------|
| macOS | Native Audio (CoreAudio) |
| Windows | Native Audio |
| Linux | Native / SoX `rec` / arecord |

### Native 模块

```typescript
// 惰性加载 audio-capture-napi
let audioNapi: AudioNapi | null = null

function loadAudioNapi(): Promise<AudioNapi> {
  audioNapiPromise ??= (async () => {
    const mod = await import('audio-capture-napi')
    mod.isNativeAudioAvailable()
    return mod
  })()
  return audioNapiPromise
}
```

### 依赖检测

```typescript
// 检查命令可用性
function hasCommand(cmd: string): boolean {
  const result = spawnSync(cmd, ['--version'], {
    stdio: 'ignore',
    timeout: 3000,
  })
  return result.error === undefined
}

// 检测 arecord 设备可用性
function probeArecord(): Promise<ArecordProbeResult>
```

## 语音识别

### STT 服务

- 文件: `services/voiceStreamSTT.ts` (21KB)
- 流式语音转文字

### 关键词检测

- 文件: `services/voiceKeyterms.ts` (3KB)
- 检测特定关键词触发操作

## 设计亮点

### 1. 惰性加载
Native 模块首次使用时才加载，避免启动延迟

### 2. 多后端支持
Native → SoX → arecord 渐进回退

### 3. 静音检测
自动检测静音停止录制

### 4. WSL 兼容
检测 WSLg PulseAudio 可用性