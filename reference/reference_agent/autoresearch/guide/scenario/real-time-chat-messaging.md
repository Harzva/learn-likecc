# Scenario: Real-Time Chat Messaging

> Explore failure modes in WebSocket-based chat: message delivery, typing indicators, read receipts, presence detection, and reconnection handling.

---

## The Command

```
/autoresearch:scenario --domain software --depth deep --focus concurrent
Scenario: User sends messages in a real-time chat application with typing indicators, read receipts, and online presence
Iterations: 35
```

---

## What This Explores

Real-time chat is a concurrency minefield. Multiple clients connected simultaneously, messages that must arrive in order, presence states that can flip between online/offline in milliseconds, and reconnection logic that must recover gracefully from network drops.

**Key dimensions weighted:**
- **Concurrent** — two users typing simultaneously, message ordering across clients
- **Recovery** — reconnection after network loss, message replay, gap detection
- **Temporal** — typing indicator timeout, presence heartbeat expiry, message delivery delay
- **Scale** — group chat with 500 members, message fanout, presence broadcast storm
- **Edge case** — empty message, message exactly at character limit, emoji-only message

---

## Example Situations Generated

### Situation #1 — Message ordering during network partition
**Dimension:** Concurrent | **Severity:** Critical

**Preconditions:**
- User A and User B are in a 1:1 conversation
- User A's connection drops for 3 seconds, then reconnects

**Situation:**
User A sends messages M1, M2, M3 while offline (queued locally). User B sends M4 during the same window. User A reconnects — all four messages must arrive in correct causal order on both clients.

**Expected Outcome:**
Messages display in causal order (M1, M4, M2, M3 or similar based on timestamps) on both clients. No duplicates.

**Failure Signal:**
Messages appear out of order, duplicates show, or messages are lost entirely after reconnection.

**Mitigations:**
- Vector clocks or Lamport timestamps for causal ordering
- Client-side message queue with server-assigned sequence numbers
- Deduplication by client-generated message ID (UUID)

---

### Situation #2 — Typing indicator ghost after tab close
**Dimension:** Temporal | **Severity:** Medium

**Preconditions:**
- User A starts typing in a chat with User B
- Typing indicator event is sent to server

**Situation:**
User A closes the browser tab without sending the message. The WebSocket `close` event fires but is not guaranteed to propagate before the TCP connection is severed.

**Expected Outcome:**
User B sees "User A is typing..." disappear within 5 seconds (timeout-based fallback).

**Failure Signal:**
"User A is typing..." persists indefinitely. User B sees a ghost typing indicator for a user who left.

**Mitigations:**
- Server-side typing timeout (5s) that auto-clears if no refresh
- Client-side `beforeunload` sending explicit stop-typing event
- Presence heartbeat clearing stale typing indicators

---

### Situation #3 — Read receipt in group chat with 200 members
**Dimension:** Scale | **Severity:** High

**Preconditions:**
- Group chat with 200 active members
- User A sends a message

**Situation:**
All 200 members open the chat within 10 seconds. Each triggers a read receipt event. Server must fan out 200 × 199 = 39,800 receipt notifications.

**Expected Outcome:**
Read receipts are batched and delivered with acceptable latency (<2s). No message queue backlog.

**Failure Signal:**
WebSocket connections timeout, read receipt delivery lags >10s, or server OOM from unbatched fanout.

**Mitigations:**
- Batch read receipts (aggregate every 2s, send summary)
- Limit read receipt fanout to "read by N" count instead of individual notifications
- Lazy-load individual read-by list only on user request

---

### Situation #4 — Reconnection with 500 unread messages
**Dimension:** Recovery | **Severity:** High

**Preconditions:**
- User has been offline for 6 hours
- 500 messages accumulated across 15 conversations

**Situation:**
User opens the app. Client must sync 500 messages, update all conversation previews, recalculate unread counts, and restore scroll positions — without freezing the UI.

**Expected Outcome:**
App shows conversation list within 1s with accurate unread badges. Messages load progressively per conversation as user taps in.

**Failure Signal:**
App hangs on splash screen, unread counts are wrong, messages load in wrong order, or scroll jumps as messages insert.

**Mitigations:**
- Paginated sync: fetch conversation summaries first, messages on-demand
- Last-read cursor per conversation stored server-side
- Background sync with UI rendering on first page of results

---

### Situation #5 — Emoji reaction on a deleted message
**Dimension:** State transition | **Severity:** Medium

**Preconditions:**
- User A sends a message in a group chat
- User B has the message visible on screen

**Situation:**
User A deletes the message. Before the delete event reaches User B's client, User B taps the emoji reaction button on that message.

**Expected Outcome:**
Reaction request fails with a clear error ("message no longer available"). Client removes the message from view and shows a brief toast.

**Failure Signal:**
Reaction succeeds on a deleted message, creating an orphaned reaction. Or client crashes due to referencing a nil message object.

**Mitigations:**
- Server-side check: reject reactions on deleted messages (409 Conflict)
- Optimistic UI with rollback on server rejection
- Real-time delete events processed before user action queue

---

### Situation #6 — Presence flapping on unstable mobile network
**Dimension:** Temporal | **Severity:** Medium

**Preconditions:**
- User is on a mobile device with intermittent connectivity (e.g., subway)
- Connection drops and reconnects every 5-15 seconds

**Situation:**
Each reconnect triggers an "online" presence event. Each drop triggers "offline" after heartbeat timeout (10s). Other users see rapid online/offline/online flapping.

**Expected Outcome:**
Presence system debounces status changes — user shows as "online" with brief interruptions not surfaced to contacts.

**Failure Signal:**
Contacts see "User came online" / "User went offline" notifications repeatedly. Presence badge flickers.

**Mitigations:**
- Debounce presence changes (30s grace period before showing "offline")
- "Away" intermediate state instead of immediate offline
- Suppress presence notifications during flapping detection window

---

## Chain It

### scenario → debug → fix
```bash
# Step 1: Generate scenarios (already done above)
# Step 2: Hunt bugs in discovered risk areas
/autoresearch:debug
Scope: src/chat/**, src/websocket/**
Symptom: Concurrency issues from scenario exploration — message ordering, reconnection, presence flapping
Iterations: 15

# Step 3: Fix what was found
/autoresearch:fix --from-debug
Guard: npm test
Iterations: 20
```

### scenario → security
```bash
# Audit WebSocket endpoints for injection, auth bypass, rate limiting
/autoresearch:security
Scope: src/chat/**, src/websocket/**, src/auth/**
Focus: WebSocket authentication, message injection, presence spoofing
Iterations: 15
```

### predict → scenario
```bash
# Get expert analysis first, then explore edge cases
/autoresearch:predict --chain scenario,debug,fix
Scope: src/chat/**
Goal: Ensure chat handles all concurrency edge cases before launch
```

---

## Tips

**WebSocket testing is inherently non-deterministic.** When chaining to `/autoresearch:debug`, set `Noise: high` on any latency-based metric — network timing varies between runs.

**Focus on `concurrent` dimension for chat.** The highest-severity bugs in real-time systems are almost always race conditions. Use `--focus concurrent` to weight sampling toward these.

**Presence is harder than messaging.** Message delivery has well-known solutions (queues, sequence numbers). Presence has no standard — debounce thresholds, heartbeat intervals, and grace periods all need tuning. Run a separate shallow scenario just for presence: `/autoresearch:scenario --depth shallow --focus temporal` with `Scenario: User presence detection across web and mobile clients`.

---

<div align="center">

**[Scenario Guides](README.md)** | **[Scenario Command Reference](../autoresearch-scenario.md)** | **[Chains & Combinations](../chains-and-combinations.md)**

</div>
