---
name: video-cover-image
description: Generate paired vertical and horizontal short-video cover images from toBeBetterJavaer video scripts or AI/Java technical topics. Use when the user asks for 视频封面, 封面图, 横版和竖版, 小红书/抖音/B站/快手封面, or wants a repeatable cover workflow for Markdown scripts under docs/src/ai/video/.
---

# Video Cover Image

## Overview

Create a matched cover pair for one technical short-video script:

- Vertical cover: `3:4`, for 小红书、抖音、快手 and mobile feeds.
- Horizontal cover: `4:3`, for B站 and video thumbnails.

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

3. Keep text short enough for image generation.
   - Prefer 3-5 visible text blocks total.
   - Avoid long Chinese sentences, dense labels, and small body text.
   - If exact wording is critical, simplify the generated text first; if still unstable, generate a cleaner illustration and add text in a separate deterministic editing step.

4. Generate the vertical cover first with `image_gen`.
   - Ratio: `3:4`, target size similar to `1086 x 1448`.
   - Composition: top title, central visual icon, presenter in lower/right area, bottom tag.
   - Apply the default high-impact blue-sky knowledge-cover style.

5. Generate the horizontal cover with `image_gen`.
   - Ratio: `4:3`, target size similar to `1440 x 1080` or `1600 x 1200`.
   - Composition: left icon, center/right presenter, right or top punch lines.
   - Reuse the same title, punch lines, icon, character, color system, and topic framing as the vertical cover.

6. Run a quick visual quality gate before final response.
   - Aspect ratio is correct for each image.
   - The main topic is obvious at a glance.
   - Chinese text has no obvious garbling in the large title/punch lines.
   - The presenter is the correct 二哥 cartoon: short hair, glasses, yellow shirt, dark tie.
   - No female avatar, no unrelated fantasy costume, no real brand logo unless explicitly requested.
   - No outer frame, no rounded screenshot container, no dense small text.

7. Deliver both images.
   - Show both images with Markdown image tags.
   - Include absolute generated file paths and dimensions.
   - Do not move images into the repo unless the user explicitly asks.

## Default Style

- Bright blue sky/cloud background with speed lines or a clean energetic gradient.
- Thick white English or Chinese title, black 3D shadow.
- Large yellow Chinese punch lines with black outline.
- One glowing white rounded square icon with a blue/purple technical symbol.
- 二哥 cartoon presenter: Q-version big head, short hair, glasses, yellow shirt, dark tie, holding a pointer or laptop.
- Knowledge-zone feel: normal, clean, platform-ready, not neon cyberpunk, not overly AI-looking.

## Prompt Pattern

Build two prompts from the same extracted payload.

Vertical prompt outline:

```text
生成一张竖版中文短视频封面图，比例 3:4，适合小红书、抖音、快手和B站竖版物料。
主题来自口播稿：{topic}
核心关键词：{keywords}
画面风格：高冲击中文知识封面，明亮蓝色天空和云层背景，速度线和光效，厚重立体字。
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
生成一张横版中文短视频封面图，比例 4:3，适合B站横版视频封面。
主题来自口播稿：{topic}
核心关键词：{keywords}
画面风格：延续竖版同一套风格，明亮蓝色天空和云层背景，速度线和放射光效。
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
- Icon: glowing loop arrow plus stuck task card or STOP hand symbol

For a script about Skill hit rate:

- Topic: Skills 太多如何保证命中率
- Main title: `Skill 命中率`
- Punch lines: `别靠硬匹配` / `要看语义`
- Small tag: `description 决定入口`
- Icon: search radar selecting one highlighted skill card
