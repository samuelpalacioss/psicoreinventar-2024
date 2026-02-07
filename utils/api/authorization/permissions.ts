import { Role } from "@/src/types";

/**
 * Permission matrix defining access control for all resources
 * Based on the authorization matrix from api_implementation.md
 */

export type Resource =
  | "person"
  | "doctor"
  | "appointment"
  | "payment"
  | "payment-method"
  | "payout-method"
  | "review"
  | "service"
  | "condition"
  | "language"
  | "place"
  | "institution"
  | "treatment-method"
  | "progress"
  | "phone"
  | "education"
  | "schedule"
  | "age-group"
  | "doctor-service"
  | "doctor-treatment-method"
  | "doctor-condition"
  | "doctor-language";

// List vs Read:
// - list: Getting a collection of resources (e.g., GET /api/persons - returns array of persons)
// - read: Getting a single resource (e.g., GET /api/persons/123 - returns one person)

export type Action = "create" | "read" | "update" | "delete" | "list";

export type PermissionScope = "all" | "own" | "assigned" | "none";

// If the user has x role and that role has x permission, then the user has x access to the resource.
type PermissionMatrix = {
  [key in Role]: {
    [resource in Resource]?: {
      [action in Action]?: PermissionScope;
    };
  };
};

/**
 * Permission matrix defining what each role can do with each resource
 * Legend:
 * - all: Access all resources of this type
 * - own: Access only resources owned by the user
 * - assigned: Access only resources assigned to the user (doctors see their patients)
 * - none: No access
 *
 * Action types:
 * - list: Get a collection of resources (GET /api/resource) - returns array
 * - read: Get a single resource (GET /api/resource/123) - returns one item
 * - create: Create a new resource (POST /api/resource)
 * - update: Update a resource (PATCH /api/resource/123)
 * - delete: Delete a resource (DELETE /api/resource/123)
 */
export const PERMISSIONS: PermissionMatrix = {
  [Role.PATIENT]: {
    person: {
      create: "own",
      read: "own",
      update: "own",
      delete: "own",
      list: "own",
    },
    doctor: {
      read: "all",
      list: "all",
    },
    appointment: {
      create: "own",
      read: "own",
      update: "own",
      delete: "own",
      list: "own",
    },
    payment: {
      create: "own",
      read: "own",
      list: "own",
    },
    "payment-method": {
      create: "own",
      read: "own",
      update: "own",
      delete: "own",
      list: "own",
    },
    "payout-method": {
      read: "none",
      list: "none",
    },
    review: {
      create: "own",
      read: "all",
      update: "own",
      list: "all",
    },
    service: {
      read: "all",
      list: "all",
    },
    condition: {
      read: "all",
      list: "all",
    },
    language: {
      read: "all",
      list: "all",
    },
    place: {
      read: "all",
      list: "all",
    },
    institution: {
      read: "all",
      list: "all",
    },
    "treatment-method": {
      read: "all",
      list: "all",
    },
    progress: {
      read: "own",
      list: "own",
    },
    phone: {
      create: "own",
      read: "own",
      update: "own",
      delete: "own",
      list: "own",
    },
  },
  [Role.DOCTOR]: {
    person: {
      read: "assigned",
      list: "assigned",
    },
    doctor: {
      read: "own",
      update: "own",
      list: "all",
    },
    appointment: {
      read: "assigned",
      update: "assigned",
      list: "assigned",
    },
    payment: {
      read: "assigned",
      list: "assigned",
    },
    "payment-method": {
      read: "none",
      list: "none",
    },
    "payout-method": {
      create: "own",
      read: "own",
      update: "own",
      delete: "own",
      list: "own",
    },
    review: {
      read: "assigned",
      list: "assigned",
    },
    service: {
      read: "all",
      list: "all",
    },
    condition: {
      read: "all",
      list: "all",
    },
    language: {
      read: "all",
      list: "all",
    },
    place: {
      read: "all",
      list: "all",
    },
    institution: {
      create: "own", // Doctors can suggest institutions (will be isPending: true)
      read: "all",
      list: "all",
    },
    "treatment-method": {
      read: "all",
      list: "all",
    },
    progress: {
      create: "assigned",
      read: "assigned",
      update: "assigned",
      delete: "assigned",
      list: "assigned",
    },
    phone: {
      create: "own",
      read: "own",
      update: "own",
      delete: "own",
      list: "own",
    },
    education: {
      create: "own",
      read: "own",
      update: "own",
      delete: "own",
      list: "own",
    },
    schedule: {
      create: "own",
      read: "own",
      update: "own",
      delete: "own",
      list: "own",
    },
    "age-group": {
      create: "own",
      read: "own",
      update: "own",
      delete: "own",
      list: "own",
    },
    "doctor-service": {
      create: "own",
      read: "own",
      update: "own",
      delete: "own",
      list: "own",
    },
    "doctor-treatment-method": {
      create: "own",
      read: "own",
      update: "own",
      delete: "own",
      list: "own",
    },
    "doctor-condition": {
      create: "own",
      read: "own",
      update: "own",
      delete: "own",
      list: "own",
    },
    "doctor-language": {
      create: "own",
      read: "own",
      update: "own",
      delete: "own",
      list: "own",
    },
  },
  [Role.ADMIN]: {
    person: {
      create: "all",
      read: "all",
      update: "all",
      delete: "all",
      list: "all",
    },
    doctor: {
      create: "all",
      read: "all",
      update: "all",
      delete: "all",
      list: "all",
    },
    appointment: {
      create: "all",
      read: "all",
      update: "all",
      delete: "all",
      list: "all",
    },
    payment: {
      read: "all",
      list: "all",
    },
    "payment-method": {
      read: "all",
      list: "all",
    },
    "payout-method": {
      read: "all",
      delete: "all",
      list: "all",
    },
    review: {
      create: "all",
      read: "all",
      update: "all",
      delete: "all",
      list: "all",
    },
    service: {
      create: "all",
      read: "all",
      update: "all",
      delete: "all",
      list: "all",
    },
    condition: {
      create: "all",
      read: "all",
      update: "all",
      delete: "all",
      list: "all",
    },
    language: {
      create: "all",
      read: "all",
      update: "all",
      delete: "all",
      list: "all",
    },
    place: {
      create: "all",
      read: "all",
      update: "all",
      delete: "all",
      list: "all",
    },
    institution: {
      create: "all",
      read: "all",
      update: "all",
      delete: "all",
      list: "all",
    },
    "treatment-method": {
      create: "all",
      read: "all",
      update: "all",
      delete: "all",
      list: "all",
    },
    progress: {
      // Sensitive data, only patients and doctors can see it
      create: "none",
      read: "none",
      update: "none",
      delete: "none",
      list: "none",
    },
    phone: {
      create: "all",
      read: "all",
      update: "all",
      delete: "all",
      list: "all",
    },
    education: {
      create: "all",
      read: "all",
      update: "all",
      delete: "all",
      list: "all",
    },
    schedule: {
      create: "all",
      read: "all",
      update: "all",
      delete: "all",
      list: "all",
    },
    "age-group": {
      create: "all",
      read: "all",
      update: "all",
      delete: "all",
      list: "all",
    },
    "doctor-service": {
      create: "all",
      read: "all",
      update: "all",
      delete: "all",
      list: "all",
    },
    "doctor-treatment-method": {
      create: "all",
      read: "all",
      update: "all",
      delete: "all",
      list: "all",
    },
    "doctor-condition": {
      create: "all",
      read: "all",
      update: "all",
      delete: "all",
      list: "all",
    },
    "doctor-language": {
      create: "all",
      read: "all",
      update: "all",
      delete: "all",
      list: "all",
    },
  },
};

/**
 * Check if a role has permission to perform an action on a resource
 * @param role - User's role
 * @param resource - Resource being accessed
 * @param action - Action being performed
 * @returns Permission scope (all, own, assigned, none) or undefined if not defined
 */
export function hasPermission(
  role: Role,
  resource: Resource,
  action: Action
): PermissionScope | undefined {
  return PERMISSIONS[role]?.[resource]?.[action];
}
