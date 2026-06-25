---
name: video-cover-image
description: Generate paired vertical and horizontal short-video cover images from toBeBetterJavaer video scripts or AI/Java technical topics. Use when the user asks for 视频封面, 封面图, 横版和竖版, 小红书/抖音/B站/快手封面, or wants a repeatable cover workflow for Markdown scripts under docs/src/ai/video/.
---

# Video Cover Image

## Overview

Create a matched cover pair for one technical short-video script:

- Vertical cover: `3:4`, for 小红书、抖音、快手 and mobile feeds.
- Horizontal cover: `16:9`, for B站 and video thumbnails.

Use the `itwanger-image` style rules when available. Keep prompt context isolated: use only the target script, user-provided reference images, and this skill's rules. Do not pull in unrelated browser/editor/window/history content.

## Workflow

1. Resolve exactly one script or topic.
   - If the user provides a file path, read that file.
   - If the user gives a filename under `docs/src/ai/video/`, resolve it there.
   - If several files match, ask which one.
   - If the user asks to batch a directory, process one file at a time and produce one vertical/horizontal pair per script.

2. Extract cover material from the script.
   - Topic: one short phrase, usually the article/interview question.
   - Main title: 1 English or Chinese phrase that can be read at thumbnail size.
   - Two big punch lines: 2-6 Chinese characters each if possible.
   - Small tag: one short promise or rule of thumb.
   - Visual metaphor: one simple icon or scene, such as Agent flow, checklist, tool call, loop, search, or error trap.

3. Select one style preset.
   - If the user names a style, use it.
   - If the user asks for variety or does not specify a style, pick a preset that fits the script topic and differs from the last successful cover.
   - Use one preset for both vertical and horizontal covers in the same pair.
   - Keep the 二哥 presenter consistent across all presets.

4. Keep text short enough for image generation.
   - Prefer 3-5 visible text blocks total.
   - Avoid long Chinese sentences, dense labels, and small body text.
   - If exact wording is critical, simplify the generated text first; if still unstable, generate a cleaner illustration and add text in a separate deterministic editing step.

5. Generate the vertical cover first with `image_gen`.
   - Ratio: `3:4`, target size similar to `1086 x 1448`.
   - Composition: top title, central visual icon, presenter in lower/right area, bottom tag.
   - Apply the selected style preset.

6. Generate the horizontal cover with `image_gen`.
   - Ratio: `16:9`, target size similar to `1672 x 941` or `1920 x 1080`.
   - Composition: left icon, center/right presenter, right or top punch lines.
   - Reuse the same title, punch lines, icon, character, color system, and topic framing as the vertical cover.

7. Run a quick visual quality gate before final response.
   - Aspect ratio is correct for each image.
   - The main topic is obvious at a glance.
   - Chinese text has no obvious garbling in the large title/punch lines.
   - The presenter is the correct 二哥 cartoon: short hair, glasses, yellow shirt, dark tie.
   - No female avatar, no unrelated fantasy costume, no real brand logo unless explicitly requested.
   - No outer frame, no rounded screenshot container, no dense small text.

8. Deliver both images.
   - Show both images with Markdown image tags.
   - Include absolute generated file paths and dimensions.
   - Do not move images into the repo unless the user explicitly asks.

## Style Presets

Choose one preset per cover pair.

### 1. Sky Sprint

Use for upbeat concepts, capability breakdowns, or "ultimate guide" style topics.

- Bright blue sky/cloud background with speed lines or a clean energetic gradient.
- Thick white English or Chinese title, black 3D shadow.
- Large yellow Chinese punch lines with black outline.
- One glowing white rounded square icon with a blue/purple technical symbol.
- 二哥 cartoon presenter: Q-version big head, short hair, glasses, yellow shirt, dark tie, holding a pointer or laptop.
- Knowledge-zone feel: normal, clean, platform-ready, not neon cyberpunk, not overly AI-looking.

### 2. Red Alert Debug

Use for failure modes, dead loops, incidents, retries, crashes, and "what went wrong" topics.

- Clean red/orange alert background with a simple gradient or subtle radial glow.
- Thick white or yellow title with black shadow; red warning accents.
- Main icon: choose only one clear warning metaphor, such as a warning triangle with loop arrow, a stuck task card, or a broken progress bar.
- 二哥 presenter looks serious and points to the warning icon or a "STOP" style intervention sign.
- Keep it clean and knowledge-zone ready; avoid horror, excessive darkness, dense code walls, busy debug panels, repeated warning stripes, and too many floating cards.

### 3. Whiteboard Coach

Use for principle explanations, architecture decomposition, and interview-answer teaching.

- Warm whiteboard or paper texture, hand-drawn arrows and sticky notes.
- Black hand-written title with red/green/blue/orange emphasis.
- Main structure: 3-step flow, comparison, loop, or layered diagram.
- 二哥 presenter stands beside the board with a pointer.
- This is calmer than the platform-cover presets; use larger text and fewer nodes when used as a cover.

### 4. Terminal Hacker

Use for CLI, tool calling, logs, command errors, model routing, and engineering workflow topics.

- Dark terminal or IDE-inspired background, but with enough brightness and contrast for mobile thumbnails.
- Big title over a terminal card, with green/cyan status lines and one red error badge.
- Main icon: command prompt, tool-call stack, API request card, or log timeline.
- 二哥 presenter holds a laptop or points at a command output panel.
- Avoid tiny code snippets; use abstract log blocks instead of readable dense code.

### 5. Comic Punch

Use for myths, wrong answers, interview traps, and strongly opinionated hooks.

- Manga/comic burst background, halftone texture, impact lines, sticker-like labels.
- Huge title, exaggerated warning badge, and one clear "wrong vs right" visual.
- 二哥 presenter has a stronger reaction pose but stays recognizable and professional.
- Avoid cluttered speech bubbles; keep to one punch-line badge plus one main title.

### 6. Clean Studio

Use for product comparisons, ranked lists, calm tutorials, and polished B站 knowledge thumbnails.

- Clean studio background with soft geometric shapes, desk/dashboard elements, and balanced lighting.
- White or yellow title with subtle shadow, less explosive than Sky Sprint.
- Main icon: comparison cards, checklist, dashboard, or workflow board.
- 二哥 presenter is front-facing or three-quarter view, holding a pointer or laptop.
- Use when the previous cover was visually loud and the next one needs a quieter professional look.

## Prompt Pattern

Build two prompts from the same extracted payload.

Vertical prompt outline:

```text
生成一张竖版中文短视频封面图，比例 3:4，适合小红书、抖音、快手和B站竖版物料。
主题来自口播稿：{topic}
核心关键词：{keywords}
画面风格：高冲击中文知识封面，明亮蓝色天空和云层背景，速度线和光效，厚重立体字。
风格预设：{style_preset}
主视觉：二哥卡通讲解员，短发、眼镜、黄色衬衫、深色领带，拿教鞭指向 {visual_icon}。
封面文字必须少而大：
顶部主标题：{main_title}
中部黄色大字：{punch_line_1}
下一行黄色大字：{punch_line_2}
底部小标签：{small_tag}
要求：文字清楚，人物脸不被挡，安全边距足够，不要白底，不要外层边框，不要密集小字。
```

Horizontal prompt outline:

```text
生成一张横版中文短视频封面图，比例 16:9，适合B站横版视频封面。
主题来自口播稿：{topic}
核心关键词：{keywords}
画面风格：延续竖版同一套风格，明亮蓝色天空和云层背景，速度线和放射光效。
风格预设：{style_preset}
横版构图：左侧 {visual_icon}，中间偏右二哥卡通讲解员，右侧或顶部放大标题和黄色中文爆点。
封面文字必须少而大：
主标题：{main_title}
黄色大字：{punch_line_1} / {punch_line_2}
底部小标签：{small_tag}
要求：中文清楚，人物脸不被挡，横版安全区充足，不要白底，不要外层边框，不要密集小字。
```

## Extraction Examples

For `docs/src/ai/video/plan-and-execute.md`:

- Topic: Agent 面试题 Plan-and-Execute
- Main title: `Plan & Execute`
- Punch lines: `强模型想` / `弱模型干`
- Small tag: `五步以上先规划`
- Icon: glowing Agent flow icon with Planner / Executor / Replanner nodes

For a script about ReAct death loops:

- Topic: Agent 为什么会死循环
- Main title: `ReAct 死循环`
- Punch lines: `越跑越偏` / `怎么打断`
- Small tag: `观察不等于修正`
- Icon: red warning loop arrow plus stuck task card
- Style preset: Red Alert Debug

For a script about Skill hit rate:

- Topic: Skills 太多如何保证命中率
- Main title: `Skill 命中率`
- Punch lines: `别靠硬匹配` / `要看语义`
- Small tag: `description 决定入口`
- Icon: search radar selecting one highlighted skill card
