import React from "react";

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ConfigEditor } from "@/components/config-editor";
import { createSampleDraft } from "@/lib/config/defaults";
import { generateConfigToml } from "@/lib/config/toml";
import { getDictionary } from "@/lib/i18n/config";

function mockGenerateFetch() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const body = init?.body ? JSON.parse(String(init.body)) : {};
      const payload = generateConfigToml(body.draft, body.unsupportedToml);

      return new Response(JSON.stringify(payload), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }),
  );
}

describe("ConfigEditor", () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockGenerateFetch();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("persists edited draft across locale remounts", async () => {
    const { unmount } = render(
      <ConfigEditor
        locale="en"
        dictionary={getDictionary("en")}
        initialDraft={createSampleDraft()}
        initialPreview={generateConfigToml(createSampleDraft()).toml}
        initialUnsupportedToml=""
      />,
    );

    const generalSection = screen.getByRole("heading", { name: "General" }).closest("section");
    expect(generalSection).not.toBeNull();
    if (!generalSection) {
      return;
    }

    const modelInput = within(generalSection).getAllByRole("textbox")[0];
    await userEvent.clear(modelInput);
    await userEvent.type(modelInput, "gpt-custom");

    await waitFor(() => {
      expect(window.localStorage.getItem("codex-config-viewer-state:v1")).toContain("gpt-custom");
    });

    unmount();

    render(
      <ConfigEditor
        locale="zh-CN"
        dictionary={getDictionary("zh-CN")}
        initialDraft={createSampleDraft()}
        initialPreview={generateConfigToml(createSampleDraft()).toml}
        initialUnsupportedToml=""
      />,
    );

    const zhGeneralSection = screen
      .getByRole("heading", { name: "通用设置" })
      .closest("section");
    expect(zhGeneralSection).not.toBeNull();
    if (!zhGeneralSection) {
      return;
    }

    expect(within(zhGeneralSection).getAllByRole("textbox")[0]).toHaveValue("gpt-custom");
  });

  it("adds and removes a model provider row", async () => {
    render(
      <ConfigEditor
        locale="en"
        dictionary={getDictionary("en")}
        initialDraft={createSampleDraft()}
        initialPreview={generateConfigToml(createSampleDraft()).toml}
        initialUnsupportedToml=""
      />,
    );

    const section = screen.getByRole("heading", { name: "Model Providers" }).closest("section");
    expect(section).not.toBeNull();
    if (!section) {
      return;
    }

    await userEvent.click(within(section).getByRole("button", { name: "Add" }));
    const providerIdInput = within(section).getAllByRole("textbox")[0];
    await userEvent.type(providerIdInput, "azure");
    expect(within(section).getByDisplayValue("azure")).toBeInTheDocument();

    await userEvent.click(within(section).getAllByRole("button", { name: "Remove" })[0]);

    await waitFor(() => {
      expect(within(section).queryByDisplayValue("azure")).not.toBeInTheDocument();
    });
  });
});
