import { Permission } from '../../../types/role.types';

export interface ActionItem {
  key: string;
  actionName: string;
  description: string;
  permission: Permission;
}

export interface SubmoduleNode {
  id: string;
  name: string;
  actions: ActionItem[];
}

export interface ModuleNode {
  id: string;
  name: string;
  submodules: SubmoduleNode[];
}

export interface RbacDiagnostics {
  modulesLoaded: number;
  submodulesLoaded: number;
  permissionsLoaded: number;
  missingPermissions: string[];
  duplicatePermissions: string[];
  permissionMappingCompleted: boolean;
}

const formatModuleName = (group: string): string => {
  const g = (group || '').trim().toUpperCase();
  switch (g) {
    case 'ADMIN_MANAGEMENT':
      return 'Admin Management';
    case 'MASTER_CONFIGURATION':
      return 'Master Configuration';
    case 'LEADS_MANAGEMENT':
      return 'Leads Management';
    case 'SHEETS':
      return 'Sheets';
    case 'REPORTS_ANALYTICS':
      return 'Reports & Analytics';
    case 'ATTENDANCE_MANAGEMENT':
      return 'Attendance & Field Tracking';
    case 'SYSTEM_SETTINGS':
      return 'System Settings';
    case 'OFFICE_LOCATION':
      return 'Office Location';
    case 'DASHBOARD':
      return 'Dashboard';
    default:
      if (!g) return 'General';
      return g
        .toLowerCase()
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
  }
};

const parsePermissionKey = (permission: Permission): { submoduleName: string; actionName: string } => {
  const key = permission.key || '';
  const upperKey = key.toUpperCase();

  let submoduleName = '';
  let actionSuffix = '';

  if (upperKey.startsWith('OFFICE_LOCATION_')) {
    submoduleName = 'Office Location';
    actionSuffix = upperKey.replace('OFFICE_LOCATION_', '');
  } else if (upperKey.startsWith('DASHBOARD_')) {
    submoduleName = 'Dashboard';
    actionSuffix = upperKey.replace('DASHBOARD_', '');
  } else if (upperKey.startsWith('USERS_')) {
    submoduleName = 'Users';
    actionSuffix = upperKey.replace('USERS_', '');
  } else if (upperKey.startsWith('ROLES_')) {
    submoduleName = 'Roles';
    actionSuffix = upperKey.replace('ROLES_', '');
  } else if (upperKey.startsWith('DEPARTMENTS_')) {
    submoduleName = 'Departments';
    actionSuffix = upperKey.replace('DEPARTMENTS_', '');
  } else if (upperKey.startsWith('LEAD_SOURCES_')) {
    submoduleName = 'Lead Sources';
    actionSuffix = upperKey.replace('LEAD_SOURCES_', '');
  } else if (upperKey.startsWith('LEAD_STAGE_RULES_')) {
    submoduleName = 'Stage Rules';
    actionSuffix = upperKey.replace('LEAD_STAGE_RULES_', '');
  } else if (upperKey.startsWith('LEAD_STAGES_')) {
    submoduleName = 'Lead Stages';
    actionSuffix = upperKey.replace('LEAD_STAGES_', '');
  } else if (upperKey.startsWith('TARGET_CYCLES_') || key.includes('target_cycle')) {
    submoduleName = 'Target Cycles';
    actionSuffix = upperKey.replace('TARGET_CYCLES_', '');
  } else if (key.includes('target') || key.includes('grace_period')) {
    submoduleName = 'Target Compliance & Locking';
    actionSuffix = key;
  } else if (upperKey.startsWith('LEAD_DYNAMICS_')) {
    submoduleName = 'Lead Dynamic Fields';
    actionSuffix = upperKey.replace('LEAD_DYNAMICS_', '');
  } else if (upperKey.startsWith('LOB_REASONS_')) {
    submoduleName = 'LOB Reasons';
    actionSuffix = upperKey.replace('LOB_REASONS_', '');
  } else if (key.includes('followup_extension') || key.includes('followup_settings') || key.includes('followups') || key.includes('followup_capacity')) {
    submoduleName = 'Followup & Extension Management';
    actionSuffix = key;
  } else if (upperKey.startsWith('HOLIDAY_')) {
    submoduleName = 'Holidays';
    actionSuffix = upperKey.replace('HOLIDAY_', '');
  } else if (upperKey.startsWith('PRODUCTS_') || upperKey.startsWith('PRODUCT_PRICES_')) {
    submoduleName = 'Products';
    actionSuffix = upperKey.replace('PRODUCTS_', '').replace('PRODUCT_PRICES_', '');
  } else if (upperKey.startsWith('FINANCE_')) {
    submoduleName = 'Finance';
    actionSuffix = upperKey.replace('FINANCE_', '');
  } else if (upperKey.startsWith('INVENTORY_')) {
    submoduleName = 'Inventory';
    actionSuffix = upperKey.replace('INVENTORY_', '');
  } else if (upperKey.startsWith('LEAD_APPROVAL_')) {
    submoduleName = 'Lead Stage Approvals';
    actionSuffix = upperKey.replace('LEAD_APPROVAL_', '');
  } else if (upperKey.startsWith('LEADS_')) {
    submoduleName = 'Leads Core';
    actionSuffix = upperKey.replace('LEADS_', '');
  } else if (upperKey.startsWith('SHEETS_')) {
    submoduleName = 'Sheets Workspace';
    actionSuffix = upperKey.replace('SHEETS_', '');
  } else if (upperKey.startsWith('REPORT_TYPE_') || upperKey.startsWith('REPORTS_') || upperKey.startsWith('REPORT_LOGS_')) {
    submoduleName = 'Reports Management';
    actionSuffix = upperKey.replace('REPORT_TYPE_', '').replace('REPORTS_', '').replace('REPORT_LOGS_', '');
  } else if (key.includes('ACTIVITY_REPORTS')) {
    submoduleName = 'Activity Reports';
    actionSuffix = key;
  } else if (key.includes('LOB_ANALYSIS') || key.includes('REVENUE')) {
    submoduleName = 'Revenue & LOB Analytics';
    actionSuffix = key;
  } else if (upperKey.startsWith('LOCATION_TRACKING_')) {
    submoduleName = 'Location Tracking';
    actionSuffix = upperKey.replace('LOCATION_TRACKING_', '');
  } else if (key.includes('attendance_settings') || key.includes('attendance_network') || key.includes('attendance_locations') || key.includes('office_branch') || key.includes('attendance_locked')) {
    submoduleName = 'Attendance Policy & Offices';
    actionSuffix = key;
  } else if (key.toLowerCase().includes('attendance')) {
    submoduleName = 'Attendance Core';
    actionSuffix = key;
  } else if (upperKey === 'SYSTEM_CONFIG') {
    submoduleName = 'System Settings';
    actionSuffix = 'CONFIG';
  } else {
    const parts = key.split('_');
    if (parts.length > 1) {
      submoduleName = parts.slice(0, -1).map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
      actionSuffix = parts[parts.length - 1];
    } else {
      submoduleName = formatModuleName(permission.group);
      actionSuffix = key;
    }
  }

  const formatActionName = (suffix: string, fullKey: string, desc?: string | null): string => {
    const s = suffix.toUpperCase();

    if (fullKey === 'DASHBOARD_VIEW_OWN') return 'View Own Dashboard';
    if (fullKey === 'DASHBOARD_VIEW_ASSIGNED') return 'View Assigned Users Dashboard';
    if (fullKey === 'DASHBOARD_VIEW_ALL') return 'View All Users Dashboard';
    if (fullKey === 'DASHBOARD_VIEW_OWN_OFFICE') return 'View Own Office Dashboard';
    if (fullKey === 'DASHBOARD_VIEW_ASSIGNED_OFFICES') return 'View Assigned Users Offices Dashboard';
    if (fullKey === 'DASHBOARD_VIEW_ALL_OFFICES') return 'View All Offices Dashboard';

    switch (s) {
      case 'VIEW':
        return 'View';
      case 'VIEW_ALL':
        return 'View All';
      case 'VIEW_OWN':
        return 'View Own';
      case 'VIEW_TEAM':
        return 'View Team';
      case 'CREATE':
        return 'Create';
      case 'EDIT':
      case 'UPDATE':
        return 'Edit';
      case 'DELETE':
        return 'Delete';
      case 'EXPORT':
        return 'Export';
      case 'IMPORT':
        return 'Import';
      case 'APPROVE':
        return 'Approve';
      case 'DENY':
      case 'REJECT':
        return 'Reject';
      case 'ASSIGN':
        return 'Assign';
      case 'BULK_ASSIGN':
        return 'Bulk Assign';
      case 'CLOSE':
        return 'Close';
      case 'REOPEN':
        return 'Reopen';
      case 'UNLOCK':
        return 'Unlock';
      case 'SYNC_LEADS':
        return 'Sync Leads';
      case 'FORMAT_MANAGE':
        return 'Format Layout';
      case 'AI':
        return 'AI Suggestions';
      case 'SHARE':
        return 'Share Location';
      case 'VIEW_LIVE':
        return 'View Live';
      case 'VIEW_HISTORY':
        return 'View Route History';
      case 'REPLAY':
        return 'Replay Movement';
      case 'MANAGE':
        return 'Manage';
      case 'GENERATE':
        return 'Generate';
      case 'CONFIG':
        return 'Manage Configuration';
      default:
        if (desc && desc.length > 0 && desc.length < 32) {
          return desc;
        }
        return suffix
          .toLowerCase()
          .split('_')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
    }
  };

  return {
    submoduleName,
    actionName: formatActionName(actionSuffix, key, permission.description),
  };
};

export const buildRbacTree = (
  permissions: Permission[],
): { modules: ModuleNode[]; diagnostics: RbacDiagnostics } => {
  const moduleMap = new Map<string, Map<string, ActionItem[]>>();
  const seenKeys = new Set<string>();
  const duplicateKeys: string[] = [];

  permissions.forEach((permission) => {
    if (!permission || !permission.key) return;

    if (seenKeys.has(permission.key)) {
      duplicateKeys.push(permission.key);
      return;
    }
    seenKeys.add(permission.key);

    const moduleName = formatModuleName(permission.group || 'GENERAL');
    const { submoduleName, actionName } = parsePermissionKey(permission);

    if (!moduleMap.has(moduleName)) {
      moduleMap.set(moduleName, new Map<string, ActionItem[]>());
    }

    const submoduleMap = moduleMap.get(moduleName)!;
    if (!submoduleMap.has(submoduleName)) {
      submoduleMap.set(submoduleName, []);
    }

    submoduleMap.get(submoduleName)!.push({
      key: permission.key,
      actionName,
      description: permission.description || permission.key,
      permission,
    });
  });

  const modules: ModuleNode[] = [];
  let totalSubmodulesCount = 0;

  moduleMap.forEach((submoduleMap, moduleName) => {
    const submodules: SubmoduleNode[] = [];
    submoduleMap.forEach((actions, submoduleName) => {
      totalSubmodulesCount++;
      submodules.push({
        id: `${moduleName}::${submoduleName}`,
        name: submoduleName,
        actions,
      });
    });

    modules.push({
      id: moduleName,
      name: moduleName,
      submodules,
    });
  });

  const diagnostics: RbacDiagnostics = {
    modulesLoaded: modules.length,
    submodulesLoaded: totalSubmodulesCount,
    permissionsLoaded: seenKeys.size,
    missingPermissions: [],
    duplicatePermissions: duplicateKeys,
    permissionMappingCompleted: true,
  };

  return { modules, diagnostics };
};
