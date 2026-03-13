# 2026-03-13-features-flags-sync-design

## 背景
当前项目的 features 配置仍使用旧的 `flags` 键值列表，未显式覆盖官方 sample 中的 `[features]` 布尔开关，导致“配置项齐全”的认知与实际不一致。

## 目标
- 补齐官方 sample 的全部 `[features]` 布尔开关，并在页面显式展示。
- `features.flags` 保留兼容，但在页面标记为“已废弃/只读”，让用户感知变化。
- 解析与生成保持语义一致：显式支持的键可写入/清除；未知键保留但不可编辑。

## 非目标
- 不改动其他 section 的字段与默认值。
- 不调整配置生效逻辑或后端验证规则，仅做覆盖与展示同步。

## 方案（推荐）
### 数据结构
- 在 `ConfigDraft.features` 中新增官方 sample 的 23 个 feature key，使用三态值（`"" | "true" | "false"`）。
- 继续保留 `features.flags`（KeyValueItem[]），用于承载未知/旧布尔 key。

### 解析策略
- 读取 `[features]` 时：
  - 若 key 在官方列表中，映射到显式字段。
  - 其余布尔值写入 `features.flags`，用于只读展示。

### 生成策略
- 显式字段生成 `true/false`。
- `features.flags` 原样合并回 `[features]`（仅布尔值）。

### UI 展示
- Features 分为两块：
  - **官方开关（可编辑）**：三态下拉（Unset/True/False）。
  - **已废弃（只读）**：展示 `features.flags` 列表，并明确“仅展示、不可编辑”。

## 组件与文件范围
- `src/lib/config/types.ts`：新增 `FeaturesSettings` 的三态字段。
- `src/lib/config/defaults.ts`：初始化三态字段为空字符串。
- `src/lib/config/toml.ts`：解析/生成/unsupported 逻辑调整。
- `src/lib/config/comments.ts`：新增 features key 的注释映射。
- `src/components/config-editor.tsx`：新增 Features UI，旧 flags 改为只读展示。
- `src/lib/i18n/dictionaries/en.ts`、`zh-CN.ts`：新增字段文案与“已废弃”说明。

## 数据流
1. 解析 TOML → `draft.features`（显式字段 + flags）。
2. UI 编辑显式字段 → `draft.features`。
3. 生成 TOML：显式字段 + flags 合并写回 `[features]`。

## 错误处理与边界
- 对非布尔值的未知 feature key 不做迁移，仅保留在高级 TOML（保持现有行为）。
- flags 只读展示不允许写回非布尔值。

## 测试
- 更新 `toml.test.ts`：覆盖显式字段的 true/false 写回与解析。
- 补充 flags 只读场景的解析与生成回归。

## 验收标准
- 页面可见并可编辑 23 个官方 feature key。
- `features.flags` 显示为“已废弃只读”。
- 导入/导出 TOML 后，显式 key 与 flags 均不丢失。
