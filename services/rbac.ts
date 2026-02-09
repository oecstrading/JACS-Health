/**
 * Role-Based Access Control (RBAC) System
 * 
 * Implements granular permissions and audit logging for HIPAA compliance.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserRole = "patient" | "provider" | "caregiver" | "admin";

export interface Permission {
  resource: string; // e.g., "intake_form", "medical_records", "user_management"
  action: "create" | "read" | "update" | "delete" | "share" | "*";
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization?: string;
  permissions?: Permission[]; // Custom permissions override role defaults
  createdAt: string;
  lastLogin?: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string; // e.g., "view_intake_form", "update_medication", "share_with_provider"
  resource: string; // e.g., "intake_form_123", "medication_456"
  resourceType: string; // e.g., "intake_form", "medication"
  timestamp: string;
  ipAddress?: string;
  deviceInfo?: string;
  success: boolean;
  deniedReason?: string;
  metadata?: Record<string, any>;
}

export interface AccessRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterRole: UserRole;
  resourceId: string;
  resourceType: string;
  requestedPermissions: Permission["action"][];
  reason: string;
  status: "pending" | "approved" | "denied";
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

class RBACService {
  private readonly STORAGE_KEY_USERS = "rbac_users";
  private readonly STORAGE_KEY_AUDIT_LOG = "rbac_audit_log";
  private readonly STORAGE_KEY_ACCESS_REQUESTS = "rbac_access_requests";
  private readonly STORAGE_KEY_CURRENT_USER = "rbac_current_user";

  /**
   * Role permission matrix
   */
  private rolePermissions: Record<UserRole, Permission[]> = {
    patient: [
      { resource: "intake_form", action: "create" },
      { resource: "intake_form", action: "read" },
      { resource: "intake_form", action: "update" },
      { resource: "intake_form", action: "share" },
      { resource: "medical_records", action: "read" },
      { resource: "medication", action: "create" },
      { resource: "medication", action: "read" },
      { resource: "medication", action: "update" },
      { resource: "vitals", action: "create" },
      { resource: "vitals", action: "read" },
      { resource: "health_knowledge", action: "read" },
      { resource: "my_health_center", action: "create" },
      { resource: "my_health_center", action: "read" },
      { resource: "my_health_center", action: "update" },
      { resource: "my_health_center", action: "delete" },
    ],
    provider: [
      { resource: "intake_form", action: "read" },
      { resource: "medical_records", action: "read" },
      { resource: "medical_records", action: "update" },
      { resource: "medication", action: "read" },
      { resource: "medication", action: "update" },
      { resource: "vitals", action: "read" },
      { resource: "health_knowledge", action: "read" },
      { resource: "patient_list", action: "read" },
      { resource: "clinic_settings", action: "read" },
    ],
    caregiver: [
      { resource: "intake_form", action: "read" },
      { resource: "intake_form", action: "share" },
      { resource: "medical_records", action: "read" },
      { resource: "medication", action: "read" },
      { resource: "medication", action: "update" },
      { resource: "vitals", action: "read" },
      { resource: "vitals", action: "create" },
      { resource: "health_knowledge", action: "read" },
      { resource: "my_health_center", action: "read" },
    ],
    admin: [
      { resource: "*", action: "create" },
      { resource: "*", action: "read" },
      { resource: "*", action: "update" },
      { resource: "*", action: "delete" },
      { resource: "*", action: "share" },
    ],
  };

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(this.STORAGE_KEY_CURRENT_USER);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  /**
   * Set current user
   */
  async setCurrentUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
      
      // Log login
      await this.logAccess({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: "login",
        resource: "system",
        resourceType: "system",
        timestamp: new Date().toISOString(),
        success: true,
      });
    } catch (error) {
      console.error("Error setting current user:", error);
      throw error;
    }
  }

  /**
   * Check if user has permission
   */
  async hasPermission(
    userId: string,
    resource: string,
    action: Permission["action"]
  ): Promise<boolean> {
    try {
      const user = await this.getUser(userId);
      if (!user) return false;

      // Admin has all permissions
      if (user.role === "admin") return true;

      // Check custom permissions first
      if (user.permissions) {
        const hasCustom = user.permissions.some(
          (p) =>
            (p.resource === resource || p.resource === "*") &&
            (p.action === action || p.action === "*")
        );
        if (hasCustom) return true;
      }

      // Check role-based permissions
      const rolePerms = this.rolePermissions[user.role];
      return rolePerms.some(
        (p) =>
          (p.resource === resource || p.resource === "*") &&
          (p.action === action || p.action === "*")
      );
    } catch (error) {
      console.error("Error checking permission:", error);
      return false;
    }
  }

  /**
   * Check permission and log access
   */
  async checkAndLogAccess(
    userId: string,
    action: string,
    resource: string,
    resourceType: string,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) {
      await this.logAccess({
        userId,
        userName: "Unknown",
        userRole: "patient",
        action,
        resource,
        resourceType,
        timestamp: new Date().toISOString(),
        success: false,
        deniedReason: "User not found",
        metadata,
      });
      return false;
    }

    // Parse action to get permission action
    const permAction = this.parseActionToPermission(action);
    const hasAccess = await this.hasPermission(userId, resourceType, permAction);

    await this.logAccess({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action,
      resource,
      resourceType,
      timestamp: new Date().toISOString(),
      success: hasAccess,
      deniedReason: hasAccess ? undefined : "Insufficient permissions",
      metadata,
    });

    return hasAccess;
  }

  /**
   * Parse action string to permission action
   */
  private parseActionToPermission(action: string): Permission["action"] {
    if (action.includes("view") || action.includes("read")) return "read";
    if (action.includes("create") || action.includes("add")) return "create";
    if (action.includes("update") || action.includes("edit")) return "update";
    if (action.includes("delete") || action.includes("remove")) return "delete";
    if (action.includes("share") || action.includes("send")) return "share";
    return "read"; // Default to read
  }

  /**
   * Log access attempt
   */
  private async logAccess(entry: Omit<AuditLogEntry, "id">): Promise<void> {
    try {
      const logJson = await AsyncStorage.getItem(this.STORAGE_KEY_AUDIT_LOG);
      const log: AuditLogEntry[] = logJson ? JSON.parse(logJson) : [];

      const newEntry: AuditLogEntry = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...entry,
      };

      log.push(newEntry);

      // Keep only last 10,000 entries
      if (log.length > 10000) {
        log.splice(0, log.length - 10000);
      }

      await AsyncStorage.setItem(this.STORAGE_KEY_AUDIT_LOG, JSON.stringify(log));
    } catch (error) {
      console.error("Error logging access:", error);
    }
  }

  /**
   * Get audit log
   */
  async getAuditLog(filters?: {
    userId?: string;
    resourceType?: string;
    startDate?: string;
    endDate?: string;
    successOnly?: boolean;
  }): Promise<AuditLogEntry[]> {
    try {
      const logJson = await AsyncStorage.getItem(this.STORAGE_KEY_AUDIT_LOG);
      if (!logJson) return [];

      let log: AuditLogEntry[] = JSON.parse(logJson);

      // Apply filters
      if (filters) {
        if (filters.userId) {
          log = log.filter((entry) => entry.userId === filters.userId);
        }
        if (filters.resourceType) {
          log = log.filter((entry) => entry.resourceType === filters.resourceType);
        }
        if (filters.startDate) {
          log = log.filter((entry) => entry.timestamp >= filters.startDate!);
        }
        if (filters.endDate) {
          log = log.filter((entry) => entry.timestamp <= filters.endDate!);
        }
        if (filters.successOnly) {
          log = log.filter((entry) => entry.success);
        }
      }

      // Sort by timestamp descending
      return log.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error("Error getting audit log:", error);
      return [];
    }
  }

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<User | null> {
    try {
      const usersJson = await AsyncStorage.getItem(this.STORAGE_KEY_USERS);
      if (!usersJson) return null;

      const users: User[] = JSON.parse(usersJson);
      return users.find((u) => u.id === userId) || null;
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  }

  /**
   * Create or update user
   */
  async saveUser(user: User): Promise<void> {
    try {
      const usersJson = await AsyncStorage.getItem(this.STORAGE_KEY_USERS);
      const users: User[] = usersJson ? JSON.parse(usersJson) : [];

      const index = users.findIndex((u) => u.id === user.id);
      if (index >= 0) {
        users[index] = user;
      } else {
        users.push(user);
      }

      await AsyncStorage.setItem(this.STORAGE_KEY_USERS, JSON.stringify(users));
    } catch (error) {
      console.error("Error saving user:", error);
      throw error;
    }
  }

  /**
   * Request access to resource
   */
  async requestAccess(
    requesterId: string,
    resourceId: string,
    resourceType: string,
    permissions: Permission["action"][],
    reason: string
  ): Promise<AccessRequest> {
    try {
      const requester = await this.getUser(requesterId);
      if (!requester) {
        throw new Error("Requester not found");
      }

      const request: AccessRequest = {
        id: `access_req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        requesterId: requester.id,
        requesterName: requester.name,
        requesterRole: requester.role,
        resourceId,
        resourceType,
        requestedPermissions: permissions,
        reason,
        status: "pending",
        requestedAt: new Date().toISOString(),
      };

      const requestsJson = await AsyncStorage.getItem(this.STORAGE_KEY_ACCESS_REQUESTS);
      const requests: AccessRequest[] = requestsJson ? JSON.parse(requestsJson) : [];
      requests.push(request);

      await AsyncStorage.setItem(this.STORAGE_KEY_ACCESS_REQUESTS, JSON.stringify(requests));

      return request;
    } catch (error) {
      console.error("Error requesting access:", error);
      throw error;
    }
  }

  /**
   * Review access request
   */
  async reviewAccessRequest(
    requestId: string,
    reviewerId: string,
    approved: boolean,
    notes?: string
  ): Promise<void> {
    try {
      const reviewer = await this.getUser(reviewerId);
      if (!reviewer) {
        throw new Error("Reviewer not found");
      }

      const requestsJson = await AsyncStorage.getItem(this.STORAGE_KEY_ACCESS_REQUESTS);
      if (!requestsJson) {
        throw new Error("Access request not found");
      }

      const requests: AccessRequest[] = JSON.parse(requestsJson);
      const request = requests.find((r) => r.id === requestId);
      if (!request) {
        throw new Error("Access request not found");
      }

      request.status = approved ? "approved" : "denied";
      request.reviewedBy = reviewer.id;
      request.reviewedAt = new Date().toISOString();
      request.reviewNotes = notes;

      await AsyncStorage.setItem(this.STORAGE_KEY_ACCESS_REQUESTS, JSON.stringify(requests));

      // If approved, grant permissions
      if (approved) {
        const requester = await this.getUser(request.requesterId);
        if (requester) {
          const newPermissions = request.requestedPermissions.map((action) => ({
            resource: request.resourceId,
            action,
          }));
          requester.permissions = [...(requester.permissions || []), ...newPermissions];
          await this.saveUser(requester);
        }
      }

      // Log the review
      await this.logAccess({
        userId: reviewer.id,
        userName: reviewer.name,
        userRole: reviewer.role,
        action: approved ? "approve_access_request" : "deny_access_request",
        resource: requestId,
        resourceType: "access_request",
        timestamp: new Date().toISOString(),
        success: true,
        metadata: { requesterId: request.requesterId, resourceId: request.resourceId },
      });
    } catch (error) {
      console.error("Error reviewing access request:", error);
      throw error;
    }
  }

  /**
   * Get pending access requests
   */
  async getPendingAccessRequests(): Promise<AccessRequest[]> {
    try {
      const requestsJson = await AsyncStorage.getItem(this.STORAGE_KEY_ACCESS_REQUESTS);
      if (!requestsJson) return [];

      const requests: AccessRequest[] = JSON.parse(requestsJson);
      return requests
        .filter((r) => r.status === "pending")
        .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
    } catch (error) {
      console.error("Error getting pending access requests:", error);
      return [];
    }
  }
}

export default new RBACService();
