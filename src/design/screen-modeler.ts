/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Screen Architecture & Component Hierarchy Modeler
 */

import { RequirementArtifact } from "../core/artifacts.js";
import { APIEndpointContract } from "../blueprint/types.js";
import { ScreenModel, UIComponent } from "./types.js";

export class ScreenModeler {
  /**
   * Derives screen architecture and UI component hierarchies from requirements and API contracts
   */
  public modelScreens(
    requirements: RequirementArtifact[],
    apiContracts: APIEndpointContract[] = []
  ): ScreenModel[] {
    const screens: ScreenModel[] = [];

    for (const req of requirements) {
      const tag = req.tags[0] || "core";
      const screenId = `screen-${req.code.toLowerCase()}-main`;
      const linkedApis = apiContracts.filter((api) =>
        api.traceRequirementCodes.includes(req.code) || req.tags.some((t) => api.path.includes(t))
      );

      const components: UIComponent[] = [
        {
          id: `cmp-header-${screenId}`,
          name: "ScreenHeader",
          type: "HEADER",
          label: req.title,
          ariaRole: "heading",
          ariaLabel: `${req.title} Header`,
          defaultState: "IDLE",
          supportedStates: ["IDLE"],
          actions: [],
        },
        {
          id: `cmp-input-${screenId}-query`,
          name: "MainInputField",
          type: "TEXT_INPUT",
          label: `Enter details for ${req.title}`,
          ariaRole: "textbox",
          ariaLabel: `Input field for ${req.title}`,
          defaultState: "IDLE",
          supportedStates: ["IDLE", "HOVER", "ACTIVE", "ERROR", "DISABLED"],
          actions: [
            { trigger: "INPUT", targetState: "ACTIVE" },
            { trigger: "BLUR", targetState: "IDLE" },
          ],
          dataBindingField: "payload",
        },
        {
          id: `cmp-btn-${screenId}-submit`,
          name: "SubmitButton",
          type: "BUTTON",
          label: `Submit ${req.title}`,
          ariaRole: "button",
          ariaLabel: `Submit ${req.title} button`,
          defaultState: "IDLE",
          supportedStates: ["IDLE", "HOVER", "ACTIVE", "LOADING", "DISABLED", "ERROR", "SUCCESS"],
          actions: [
            {
              trigger: "CLICK",
              targetState: "LOADING",
              apiBinding: linkedApis[0]
                ? {
                    endpointId: linkedApis[0].id,
                    method: linkedApis[0].method,
                    path: linkedApis[0].path,
                  }
                : undefined,
              errorRecoveryAction: "Reset form and show error toast.",
            },
          ],
        },
      ];

      screens.push({
        id: screenId,
        name: `${req.title} Screen`,
        routePath: `/${tag.toLowerCase()}/${req.code.toLowerCase()}`,
        boundedContext: tag.toUpperCase(),
        title: req.title,
        layout: "SINGLE_COLUMN",
        components,
        traceRequirementCodes: [req.code],
        traceApiContractIds: linkedApis.map((a) => a.id),
      });
    }

    return screens;
  }
}
