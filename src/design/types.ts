/**
 * Hell-x: The AI-Native Operating System for Software Engineering
 * Phase 3: Design Engine & Designer Curated Loop Types
 */

export interface DesignTokens {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
  typography: {
    fontFamilySans: string;
    fontFamilyMono: string;
    fontSizeScale: Record<string, string>; // xs, sm, base, lg, xl, 2xl, 3xl
    lineHeightScale: Record<string, string>;
    fontWeightScale: Record<string, number>;
  };
  spacing: Record<string, string>; // 1: 4px, 2: 8px, 4: 16px, 8: 32px, etc.
  radii: Record<string, string>; // sm, md, lg, full
  shadows: Record<string, string>;
  breakpoints: Record<string, string>; // sm: 640px, md: 768px, lg: 1024px, xl: 1280px
}

export interface UserJourneyStep {
  stepNumber: number;
  name: string;
  userGoal: string;
  screenId: string;
  actionTaken: string;
  nextStepOnSuccess: number | "COMPLETE";
  nextStepOnError: number | "RETRY" | "ABORT";
}

export interface UserJourney {
  id: string;
  title: string;
  actor: string;
  description: string;
  steps: UserJourneyStep[];
  traceRequirementCodes: string[];
}

export type UIComponentType =
  | "BUTTON"
  | "TEXT_INPUT"
  | "SELECT"
  | "DATA_TABLE"
  | "CARD"
  | "MODAL"
  | "BADGE"
  | "TOAST"
  | "HEADER"
  | "NAVBAR"
  | "FOOTER";

export type ComponentState = "IDLE" | "HOVER" | "ACTIVE" | "LOADING" | "DISABLED" | "ERROR" | "SUCCESS";

export interface ComponentAction {
  trigger: "CLICK" | "INPUT" | "SUBMIT" | "BLUR" | "HOVER" | "FOCUS";
  targetState: ComponentState;
  apiBinding?: {
    endpointId: string;
    method: string;
    path: string;
  };
  navigationTargetScreenId?: string;
  errorRecoveryAction?: string;
}

export interface UIComponent {
  id: string;
  name: string;
  type: UIComponentType;
  label: string;
  ariaRole: string;
  ariaLabel: string;
  defaultState: ComponentState;
  supportedStates: ComponentState[];
  actions: ComponentAction[];
  dataBindingField?: string;
}

export interface ScreenModel {
  id: string;
  name: string;
  routePath: string;
  boundedContext: string;
  title: string;
  layout: "SINGLE_COLUMN" | "TWO_COLUMN" | "DASHBOARD" | "MODAL_OVERLAY";
  components: UIComponent[];
  traceRequirementCodes: string[];
  traceApiContractIds: string[];
}

export interface AccessibilityReport {
  screenId: string;
  wcagLevel: "A" | "AA" | "AAA";
  contrastRatioPassed: boolean;
  minCalculatedContrast: number;
  missingAriaLabels: string[];
  keyboardFocusOrderValid: boolean;
  score: number; // 0.0 - 1.0
  violations: string[];
}

export interface DesignContract {
  id: string;
  projectId: string;
  version: number;
  tokens: DesignTokens;
  journeys: UserJourney[];
  screens: ScreenModel[];
  accessibilityScore: number;
  traceRequirementCodes: string[];
  createdAt: string;
  updatedAt: string;
}
