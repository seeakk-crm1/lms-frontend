/**
 * Centralized Overlay Z-Index Hierarchy
 *
 * Ensures consistent stacking order across drawers, popups, modals, and tooltips.
 */
export const OVERLAY_Z_INDEX = {
  DROPDOWN: 1000,
  VIEW_DRAWER: 10200,          // LeadViewDrawer, LeadHistoryDrawer
  FORM_DRAWER: 10350,          // LeadFormDrawer (Edit Lead / Create Lead)
  CHILD_MODAL_OVERLAY: 10490,  // Backdrop for child modals opened over drawers
  CHILD_MODAL: 10500,          // LOBModal, AdvancePaymentModal, StageRulesTransitionModal, LOBExitReasonModal
  CRITICAL_MODAL: 10600,       // DeleteLeadModal, Image Preview Modal
} as const;
