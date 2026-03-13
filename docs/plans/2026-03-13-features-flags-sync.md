# Features Flags Sync Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 补齐官方 sample 的 `[features]` 布尔开关，页面显式展示；`features.flags` 作为已废弃只读兼容区保留。

**Architecture:** 用 `OptionalBooleanValue ("" | "true" | "false")` 表示官方 feature 三态。解析时显式字段优先，未知布尔 key 收敛到 `features.flags`；生成时显式字段写回布尔值并合并 flags（不覆盖显式 key）。UI 分为“官方开关”和“已废弃只读”。

**Tech Stack:** Next.js (App Router), React, TypeScript, smol-toml, Vitest + Testing Library.

---

### Task 1: 修复测试环境 localStorage（基线失败）

**Files:**
- Modify: `src/test/setup.ts`

**Step 1: 复现当前失败**

Run: `pnpm test -- src/components/config-editor.test.tsx`
Expected: FAIL with `TypeError: window.localStorage.clear is not a function`.

**Step 2: 增加测试端 localStorage shim**

```ts
// src/test/setup.ts
import "@testing-library/jest-dom/vitest";

const localStorageShim = (() => {
  let store = new Map<string, string>();
  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store = new Map();
    },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageShim,
  configurable: true,
});
```

**Step 3: 验证通过**

Run: `pnpm test -- src/components/config-editor.test.tsx`
Expected: PASS for the localStorage error.

**Step 4: Commit**

```bash
git add src/test/setup.ts
git commit -m "test: add localStorage shim"
```

---

### Task 2: TOML 解析/生成支持官方 features key（三态）

**Files:**
- Modify: `src/lib/config/types.ts`
- Modify: `src/lib/config/defaults.ts`
- Modify: `src/lib/config/toml.ts`
- Test: `src/lib/config/toml.test.ts`

**Step 1: 写失败用例（官方 features round-trip）**

```ts
// src/lib/config/toml.test.ts
it("round-trips explicit official feature flags", () => {
  const draft = createSampleDraft();
  draft.features.fastMode = "false";
  draft.features.unifiedExec = "true";
  draft.features.shellTool = "true";
  draft.features.responsesWebsocketsV2 = "false";

  const generated = generateConfigToml(draft);

  expect(generated.toml).toContain("fast_mode = false");
  expect(generated.toml).toContain("unified_exec = true");
  expect(generated.toml).toContain("shell_tool = true");
  expect(generated.toml).toContain("responses_websockets_v2 = false");

  const parsed = parseConfigToml(generated.toml);
  expect(parsed.draft.features.fastMode).toBe("false");
  expect(parsed.draft.features.unifiedExec).toBe("true");
  expect(parsed.draft.features.shellTool).toBe("true");
  expect(parsed.draft.features.responsesWebsocketsV2).toBe("false");
});

it("captures unknown feature flags into deprecated list", () => {
  const parsed = parseConfigToml(
    ["[features]", "fast_mode = false", "custom_flag = true"].join("\n"),
  );

  expect(parsed.draft.features.fastMode).toBe("false");
  expect(parsed.draft.features.flags).toEqual([
    { key: "custom_flag", value: "true" },
  ]);
});
```

**Step 2: 运行测试确认失败**

Run: `pnpm test -- src/lib/config/toml.test.ts`
Expected: FAIL with missing fields or undefined mappings.

**Step 3: 实现三态 feature 字段与解析/生成**

```ts
// src/lib/config/types.ts (FeaturesSettings)
export interface FeaturesSettings {
  // official features (optional boolean)
  shellTool: OptionalBooleanValue;
  apps: OptionalBooleanValue;
  appsMcpGateway: OptionalBooleanValue;
  unifiedExec: OptionalBooleanValue;
  shellSnapshot: OptionalBooleanValue;
  multiAgent: OptionalBooleanValue;
  personality: OptionalBooleanValue;
  useLinuxSandboxBwrap: OptionalBooleanValue;
  runtimeMetrics: OptionalBooleanValue;
  powershellUtf8: OptionalBooleanValue;
  childAgentsMd: OptionalBooleanValue;
  sqlite: OptionalBooleanValue;
  fastMode: OptionalBooleanValue;
  enableRequestCompression: OptionalBooleanValue;
  imageGeneration: OptionalBooleanValue;
  skillMcpDependencyInstall: OptionalBooleanValue;
  skillEnvVarDependencyPrompt: OptionalBooleanValue;
  defaultModeRequestUserInput: OptionalBooleanValue;
  artifact: OptionalBooleanValue;
  preventIdleSleep: OptionalBooleanValue;
  responsesWebsockets: OptionalBooleanValue;
  responsesWebsocketsV2: OptionalBooleanValue;
  imageDetailOriginal: OptionalBooleanValue;

  // legacy/compat
  disableFastModel: OptionalBooleanValue;
  useExperimentalReasoningSummary: OptionalBooleanValue;

  // deprecated unknown flags
  flags: KeyValueItem[];
}
```

```ts
// src/lib/config/defaults.ts (createEmptyDraft/createSampleDraft)
features: {
  shellTool: "",
  apps: "",
  appsMcpGateway: "",
  unifiedExec: "",
  shellSnapshot: "",
  multiAgent: "",
  personality: "",
  useLinuxSandboxBwrap: "",
  runtimeMetrics: "",
  powershellUtf8: "",
  childAgentsMd: "",
  sqlite: "",
  fastMode: "",
  enableRequestCompression: "",
  imageGeneration: "",
  skillMcpDependencyInstall: "",
  skillEnvVarDependencyPrompt: "",
  defaultModeRequestUserInput: "",
  artifact: "",
  preventIdleSleep: "",
  responsesWebsockets: "",
  responsesWebsocketsV2: "",
  imageDetailOriginal: "",
  disableFastModel: "",
  useExperimentalReasoningSummary: "",
  flags: [],
},
```

```ts
// src/lib/config/toml.ts
function parseOptionalBoolean(value: unknown): OptionalBooleanValue {
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  return "";
}

function maybeAssignOptionalBoolean(
  target: TomlObject,
  key: string,
  value: OptionalBooleanValue,
) {
  if (value === "true") {
    target[key] = true;
  } else if (value === "false") {
    target[key] = false;
  }
}

const OFFICIAL_FEATURE_KEYS = [
  "shell_tool",
  "apps",
  "apps_mcp_gateway",
  "unified_exec",
  "shell_snapshot",
  "multi_agent",
  "personality",
  "use_linux_sandbox_bwrap",
  "runtime_metrics",
  "powershell_utf8",
  "child_agents_md",
  "sqlite",
  "fast_mode",
  "enable_request_compression",
  "image_generation",
  "skill_mcp_dependency_install",
  "skill_env_var_dependency_prompt",
  "default_mode_request_user_input",
  "artifact",
  "prevent_idle_sleep",
  "responses_websockets",
  "responses_websockets_v2",
  "image_detail_original",
] as const;

const LEGACY_FEATURE_KEYS = ["disable_fast_model", "use_experimental_reasoning_summary"] as const;
const KNOWN_FEATURE_KEYS = new Set([...OFFICIAL_FEATURE_KEYS, ...LEGACY_FEATURE_KEYS]);
```

```ts
// generate features
const features: TomlObject = {};
maybeAssignOptionalBoolean(features, "shell_tool", draft.features.shellTool);
maybeAssignOptionalBoolean(features, "apps", draft.features.apps);
maybeAssignOptionalBoolean(features, "apps_mcp_gateway", draft.features.appsMcpGateway);
maybeAssignOptionalBoolean(features, "unified_exec", draft.features.unifiedExec);
maybeAssignOptionalBoolean(features, "shell_snapshot", draft.features.shellSnapshot);
maybeAssignOptionalBoolean(features, "multi_agent", draft.features.multiAgent);
maybeAssignOptionalBoolean(features, "personality", draft.features.personality);
maybeAssignOptionalBoolean(features, "use_linux_sandbox_bwrap", draft.features.useLinuxSandboxBwrap);
maybeAssignOptionalBoolean(features, "runtime_metrics", draft.features.runtimeMetrics);
maybeAssignOptionalBoolean(features, "powershell_utf8", draft.features.powershellUtf8);
maybeAssignOptionalBoolean(features, "child_agents_md", draft.features.childAgentsMd);
maybeAssignOptionalBoolean(features, "sqlite", draft.features.sqlite);
maybeAssignOptionalBoolean(features, "fast_mode", draft.features.fastMode);
maybeAssignOptionalBoolean(features, "enable_request_compression", draft.features.enableRequestCompression);
maybeAssignOptionalBoolean(features, "image_generation", draft.features.imageGeneration);
maybeAssignOptionalBoolean(features, "skill_mcp_dependency_install", draft.features.skillMcpDependencyInstall);
maybeAssignOptionalBoolean(features, "skill_env_var_dependency_prompt", draft.features.skillEnvVarDependencyPrompt);
maybeAssignOptionalBoolean(features, "default_mode_request_user_input", draft.features.defaultModeRequestUserInput);
maybeAssignOptionalBoolean(features, "artifact", draft.features.artifact);
maybeAssignOptionalBoolean(features, "prevent_idle_sleep", draft.features.preventIdleSleep);
maybeAssignOptionalBoolean(features, "responses_websockets", draft.features.responsesWebsockets);
maybeAssignOptionalBoolean(features, "responses_websockets_v2", draft.features.responsesWebsocketsV2);
maybeAssignOptionalBoolean(features, "image_detail_original", draft.features.imageDetailOriginal);

// legacy
maybeAssignOptionalBoolean(features, "disable_fast_model", draft.features.disableFastModel);
maybeAssignOptionalBoolean(
  features,
  "use_experimental_reasoning_summary",
  draft.features.useExperimentalReasoningSummary,
);

const featureFlags = keyValueItemsToBooleanRecord(
  draft.features.flags.filter((item) => !KNOWN_FEATURE_KEYS.has(item.key)),
  warnings,
  "features",
);
if (featureFlags) {
  Object.assign(features, featureFlags);
}
```

```ts
// parse features
if (isPlainObject(value.features)) {
  draft.features.shellTool = parseOptionalBoolean(value.features.shell_tool);
  draft.features.apps = parseOptionalBoolean(value.features.apps);
  draft.features.appsMcpGateway = parseOptionalBoolean(value.features.apps_mcp_gateway);
  draft.features.unifiedExec = parseOptionalBoolean(value.features.unified_exec);
  draft.features.shellSnapshot = parseOptionalBoolean(value.features.shell_snapshot);
  draft.features.multiAgent = parseOptionalBoolean(value.features.multi_agent);
  draft.features.personality = parseOptionalBoolean(value.features.personality);
  draft.features.useLinuxSandboxBwrap = parseOptionalBoolean(
    value.features.use_linux_sandbox_bwrap,
  );
  draft.features.runtimeMetrics = parseOptionalBoolean(value.features.runtime_metrics);
  draft.features.powershellUtf8 = parseOptionalBoolean(value.features.powershell_utf8);
  draft.features.childAgentsMd = parseOptionalBoolean(value.features.child_agents_md);
  draft.features.sqlite = parseOptionalBoolean(value.features.sqlite);
  draft.features.fastMode = parseOptionalBoolean(value.features.fast_mode);
  draft.features.enableRequestCompression = parseOptionalBoolean(
    value.features.enable_request_compression,
  );
  draft.features.imageGeneration = parseOptionalBoolean(value.features.image_generation);
  draft.features.skillMcpDependencyInstall = parseOptionalBoolean(
    value.features.skill_mcp_dependency_install,
  );
  draft.features.skillEnvVarDependencyPrompt = parseOptionalBoolean(
    value.features.skill_env_var_dependency_prompt,
  );
  draft.features.defaultModeRequestUserInput = parseOptionalBoolean(
    value.features.default_mode_request_user_input,
  );
  draft.features.artifact = parseOptionalBoolean(value.features.artifact);
  draft.features.preventIdleSleep = parseOptionalBoolean(value.features.prevent_idle_sleep);
  draft.features.responsesWebsockets = parseOptionalBoolean(value.features.responses_websockets);
  draft.features.responsesWebsocketsV2 = parseOptionalBoolean(
    value.features.responses_websockets_v2,
  );
  draft.features.imageDetailOriginal = parseOptionalBoolean(value.features.image_detail_original);

  draft.features.disableFastModel = parseOptionalBoolean(value.features.disable_fast_model);
  draft.features.useExperimentalReasoningSummary = parseOptionalBoolean(
    value.features.use_experimental_reasoning_summary,
  );

  draft.features.flags = Object.entries(value.features)
    .filter(([key]) => !KNOWN_FEATURE_KEYS.has(key))
    .filter(([, entry]) => typeof entry === "boolean")
    .map(([key, entry]) => ({ key, value: entry ? "true" : "false" }));
}
```

```ts
// unsupported TOML stripping
if (isPlainObject(clone.features)) {
  stripKnownKeys(clone.features, [
    ...OFFICIAL_FEATURE_KEYS,
    ...LEGACY_FEATURE_KEYS,
  ]);
  Object.entries(clone.features).forEach(([key, entry]) => {
    if (typeof entry === "boolean") {
      delete clone.features?.[key];
    }
  });
  if (Object.keys(clone.features).length === 0) {
    delete clone.features;
  }
}
```

**Step 4: 运行测试确认通过**

Run: `pnpm test -- src/lib/config/toml.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/lib/config/types.ts src/lib/config/defaults.ts src/lib/config/toml.ts src/lib/config/toml.test.ts
git commit -m "feat: add official feature flags to toml"
```

---

### Task 3: 注释映射与双语文案

**Files:**
- Modify: `src/lib/config/comments.ts`
- Modify: `src/lib/i18n/dictionaries/en.ts`
- Modify: `src/lib/i18n/dictionaries/zh-CN.ts`

**Step 1: 写失败用例（注释存在）**

```ts
// src/lib/config/toml.test.ts
it("adds comments for official feature flags", () => {
  const draft = createSampleDraft();
  draft.features.shellTool = "true";

  const generated = generateConfigToml(draft, "", { includeComments: true, locale: "en" });
  expect(generated.toml).toContain("# Shell tool: Enable the shell tool in Codex.");
});
```

**Step 2: 运行测试确认失败**

Run: `pnpm test -- src/lib/config/toml.test.ts`
Expected: FAIL (comment missing).

**Step 3: 实现注释映射与文案**

```ts
// src/lib/config/comments.ts (features mapping)
features: {
  shell_tool: "featureShellTool",
  apps: "featureApps",
  apps_mcp_gateway: "featureAppsMcpGateway",
  unified_exec: "featureUnifiedExec",
  shell_snapshot: "featureShellSnapshot",
  multi_agent: "featureMultiAgent",
  personality: "featurePersonality",
  use_linux_sandbox_bwrap: "featureUseLinuxSandboxBwrap",
  runtime_metrics: "featureRuntimeMetrics",
  powershell_utf8: "featurePowershellUtf8",
  child_agents_md: "featureChildAgentsMd",
  sqlite: "featureSqlite",
  fast_mode: "featureFastMode",
  enable_request_compression: "featureEnableRequestCompression",
  image_generation: "featureImageGeneration",
  skill_mcp_dependency_install: "featureSkillMcpDependencyInstall",
  skill_env_var_dependency_prompt: "featureSkillEnvVarDependencyPrompt",
  default_mode_request_user_input: "featureDefaultModeRequestUserInput",
  artifact: "featureArtifact",
  prevent_idle_sleep: "featurePreventIdleSleep",
  responses_websockets: "featureResponsesWebsockets",
  responses_websockets_v2: "featureResponsesWebsocketsV2",
  image_detail_original: "featureImageDetailOriginal",
  disable_fast_model: "featureDisableFastModel",
  use_experimental_reasoning_summary: "featureUseExperimentalReasoningSummary",
},
```

```ts
// src/lib/i18n/dictionaries/en.ts (fields)
featureShellTool: ["Shell tool", "Enable the shell tool in Codex."],
featureApps: ["Apps", "Enable ChatGPT Apps/connectors support."],
featureAppsMcpGateway: ["Apps MCP gateway", "Route Apps MCP calls through the OpenAI gateway."],
featureUnifiedExec: ["Unified exec", "Use the unified PTY-backed exec tool."],
featureShellSnapshot: ["Shell snapshot", "Snapshot shell env to speed up repeated commands."],
featureMultiAgent: ["Multi-agent", "Enable multi-agent collaboration tools."],
featurePersonality: ["Personality", "Enable personality selection controls."],
featureUseLinuxSandboxBwrap: ["Linux sandbox bwrap", "Use bubblewrap-based Linux sandbox."],
featureRuntimeMetrics: ["Runtime metrics", "Show runtime metrics summary in TUI."],
featurePowershellUtf8: ["PowerShell UTF-8", "Force PowerShell UTF-8 output."],
featureChildAgentsMd: ["Child AGENTS.md", "Append AGENTS.md scope guidance even when missing."],
featureSqlite: ["SQLite", "Enable SQLite-backed state persistence."],
featureFastMode: ["Fast mode", "Enable Fast mode selection and service_tier=fast."],
featureEnableRequestCompression: ["Request compression", "Compress streaming request bodies with zstd."],
featureImageGeneration: ["Image generation", "Enable built-in image generation tool."],
featureSkillMcpDependencyInstall: ["Skill MCP dependency install", "Allow prompting/installing missing MCP deps."],
featureSkillEnvVarDependencyPrompt: ["Skill env var prompt", "Prompt for missing env var dependencies."],
featureDefaultModeRequestUserInput: ["Default mode request_user_input", "Allow request_user_input in default mode."],
featureArtifact: ["Artifacts", "Enable native artifact tools (slides/spreadsheets)."],
featurePreventIdleSleep: ["Prevent idle sleep", "Prevent machine sleep during runs."],
featureResponsesWebsockets: ["Responses websockets", "Prefer Responses API WebSocket transport."],
featureResponsesWebsocketsV2: ["Responses websockets v2", "Enable Responses WebSocket v2 mode."],
featureImageDetailOriginal: ["Image detail original", "Allow image outputs with detail=original."],
featureDisableFastModel: ["Disable fast model (legacy)", "Legacy flag; prefer fast_mode."],
featureUseExperimentalReasoningSummary: ["Experimental reasoning summary (legacy)", "Legacy flag; prefer model_reasoning_summary."],
```

**Step 4: 运行测试确认通过**

Run: `pnpm test -- src/lib/config/toml.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/lib/config/comments.ts src/lib/i18n/dictionaries/en.ts src/lib/i18n/dictionaries/zh-CN.ts src/lib/config/toml.test.ts
git commit -m "feat: add feature comments and i18n"
```

---

### Task 4: UI 显式展示官方 features + 已废弃只读区

**Files:**
- Modify: `src/components/config-editor.tsx`
- Modify: `src/lib/i18n/dictionaries/en.ts`
- Modify: `src/lib/i18n/dictionaries/zh-CN.ts`
- Test: `src/components/config-editor.test.tsx`

**Step 1: 写失败用例（页面体现变化）**

```ts
// src/components/config-editor.test.tsx
it("renders official feature toggles and deprecated flags block", async () => {
  render(<ConfigEditor locale="en" />);

  expect(await screen.findByText("Official feature toggles")).toBeInTheDocument();
  expect(screen.getByText("Shell tool")).toBeInTheDocument();
  expect(screen.getByText("Deprecated feature flags")).toBeInTheDocument();
});
```

**Step 2: 运行测试确认失败**

Run: `pnpm test -- src/components/config-editor.test.tsx`
Expected: FAIL (labels missing).

**Step 3: 实现 UI 分区与只读展示**

```tsx
// src/components/config-editor.tsx (Features section)
<div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3">
  <div className="text-sm font-semibold text-emerald-50">
    {dictionary.helpers.featuresOfficialTitle}
  </div>
  <p className="mt-1 text-xs text-emerald-100/80">
    {dictionary.helpers.featuresOfficialHint}
  </p>
</div>

<div className="grid gap-3 md:grid-cols-2">
  {FEATURE_FIELDS.map((key) => (
    <Field key={key} {...fieldText(key)}>
      <select
        className={inputClassName}
        value={draft.features[key]}
        onChange={(event) => updateFeatures(key, event.target.value as OptionalBooleanValue)}
      >
        {sharedOptionBlank}
        {OPTIONAL_BOOLEAN_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {dictionary.options.optionalBoolean[option]}
          </option>
        ))}
      </select>
    </Field>
  ))}
</div>

<div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3">
  <div className="text-sm font-semibold text-amber-100">
    {dictionary.helpers.featuresDeprecatedTitle}
  </div>
  <p className="mt-1 text-xs text-amber-100/80">
    {dictionary.helpers.featuresDeprecatedHint}
  </p>
  {draft.features.flags.length === 0 ? (
    <div className="mt-3 text-xs text-amber-100/60">{dictionary.app.emptyStates.pairs}</div>
  ) : (
    <div className="mt-3 grid gap-2">
      {draft.features.flags.map((item, index) => (
        <div key={`${item.key}-${index}`} className="grid grid-cols-[1fr_auto] gap-2 text-xs">
          <code className="rounded bg-black/30 px-2 py-1 text-amber-50">{item.key}</code>
          <code className="rounded bg-black/30 px-2 py-1 text-amber-50">{item.value}</code>
        </div>
      ))}
    </div>
  )}
</div>
```

**Step 4: 运行测试确认通过**

Run: `pnpm test -- src/components/config-editor.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/config-editor.tsx src/components/config-editor.test.tsx src/lib/i18n/dictionaries/en.ts src/lib/i18n/dictionaries/zh-CN.ts
git commit -m "feat: show official features and deprecated flags"
```

---

### Task 5: 全量回归

**Files:**
- Test: `src/lib/config/toml.test.ts`
- Test: `src/components/config-editor.test.tsx`

**Step 1: 运行全量测试**

Run: `pnpm test`
Expected: PASS.

**Step 2: Commit（如有残余修复）**

```bash
git add -A
git commit -m "test: stabilize feature flags sync"
```
