import type {
  ConfigDraft,
  McpServerDraft,
  ModelProviderDraft,
  ProfileDraft,
  ProjectDraft,
} from "@/lib/config/types";

export const SAMPLE_REVIEWED_ON = "2026-03-15";
export const SAMPLE_REFERENCE_URL = "https://developers.openai.com/codex/config-sample/";
export const CODEX_REPOSITORY_URL = "https://github.com/openai/codex";
export const CODEX_RELEASE_VERSION = "0.114.0";
export const CODEX_RELEASE_TAG = "rust-v0.114.0";
export const REPOSITORY_URL = "https://github.com/depressi0n/codex-config-viewer";
export const VERCEL_DEPLOY_URL = `https://vercel.com/new/clone?${new URLSearchParams({
  "repository-url": REPOSITORY_URL,
}).toString()}`;

export function createEmptyModelProvider(): ModelProviderDraft {
  return {
    id: "",
    name: "",
    baseUrl: "",
    wireApi: "",
    queryParams: [],
    envKey: "",
    envKeyInstructions: "",
    requestMaxRetries: "",
    streamMaxRetries: "",
    streamIdleTimeoutMs: "",
    supportsWebsockets: false,
    experimentalBearerToken: "",
    httpHeaders: [],
    envHttpHeaders: [],
  };
}

export function createEmptyMcpServer(): McpServerDraft {
  return {
    id: "",
    transport: "stdio",
    enabled: true,
    required: false,
    command: "",
    args: [],
    env: [],
    cwd: "",
    url: "",
    bearerTokenEnvVar: "",
    httpHeaders: [],
    envHttpHeaders: [],
    startupTimeoutSec: "",
    toolTimeoutSec: "",
    enabledTools: [],
    disabledTools: [],
    scopes: [],
    oauthResource: "",
  };
}

export function createEmptyProfile(): ProfileDraft {
  return {
    id: "",
    model: "",
    modelProvider: "",
    approvalPolicy: "",
    sandboxMode: "",
    serviceTier: "",
    ossProvider: "",
    modelReasoningEffort: "",
    planModeReasoningEffort: "",
    modelReasoningSummary: "",
  };
}

export function createEmptyProject(): ProjectDraft {
  return {
    path: "",
    trustLevel: "",
  };
}

export function createEmptyDraft(): ConfigDraft {
  return {
    general: {
      model: "",
      reviewModel: "",
      modelProvider: "",
      approvalPolicy: "",
      sandboxMode: "",
      serviceTier: "",
      webSearch: "",
      activeProfile: "",
      modelReasoningEffort: "",
      planModeReasoningEffort: "",
      modelReasoningSummary: "",
      ossProvider: "",
      cliAuthCredentialsStore: "",
      chatgptBaseUrl: "",
      forcedChatgptWorkspaceId: "",
      forcedLoginMethod: "",
      mcpOauthCredentialsStore: "",
      fileOpener: "",
      hideAgentReasoning: false,
      showRawAgentReasoning: false,
      disablePasteBurst: false,
      suppressUnstableFeaturesWarning: false,
    },
    history: {
      persistence: "",
      maxBytes: "",
    },
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
    sandboxWorkspaceWrite: {
      writableRoots: [],
      networkAccess: false,
    },
    shellEnvironmentPolicy: {
      inherit: "",
      ignoreDefaultExcludes: false,
      exclude: [],
      includeOnly: [],
    },
    tools: {
      viewImage: false,
    },
    modelProviders: [],
    mcpServers: [],
    profiles: [],
    projects: [],
  };
}

export function createSampleDraft(): ConfigDraft {
  return {
    general: {
      model: "gpt-5.4",
      reviewModel: "gpt-5.4",
      modelProvider: "openai",
      approvalPolicy: "on-request",
      sandboxMode: "read-only",
      serviceTier: "",
      webSearch: "cached",
      activeProfile: "",
      modelReasoningEffort: "",
      planModeReasoningEffort: "",
      modelReasoningSummary: "",
      ossProvider: "",
      cliAuthCredentialsStore: "file",
      chatgptBaseUrl: "https://chatgpt.com/backend-api/",
      forcedChatgptWorkspaceId: "",
      forcedLoginMethod: "",
      mcpOauthCredentialsStore: "auto",
      fileOpener: "vscode",
      hideAgentReasoning: false,
      showRawAgentReasoning: false,
      disablePasteBurst: false,
      suppressUnstableFeaturesWarning: false,
    },
    history: {
      persistence: "save-all",
      maxBytes: "",
    },
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
    sandboxWorkspaceWrite: {
      writableRoots: [],
      networkAccess: false,
    },
    shellEnvironmentPolicy: {
      inherit: "all",
      ignoreDefaultExcludes: false,
      exclude: [],
      includeOnly: [],
    },
    tools: {
      viewImage: true,
    },
    modelProviders: [],
    mcpServers: [],
    profiles: [],
    projects: [],
  };
}

export function createRecommendedDraft(): ConfigDraft {
  const draft = createSampleDraft();

  draft.general.approvalPolicy = "on-request";
  draft.general.sandboxMode = "workspace-write";
  draft.general.webSearch = "live";
  draft.history.persistence = "save-all";
  draft.sandboxWorkspaceWrite.networkAccess = true;
  draft.shellEnvironmentPolicy.inherit = "core";
  draft.tools.viewImage = true;

  return draft;
}
