export const USER_ROLES = Object.freeze({
    CUSTOMER: '0',
    ADMIN: '1',
    WAREHOUSE_MANAGER: '2',
    STAFF: '3',
});

export const ADMIN_ACCESS_ROLES = Object.freeze([
    USER_ROLES.ADMIN,
    USER_ROLES.WAREHOUSE_MANAGER,
    USER_ROLES.STAFF,
]);

export const ROLE_LABELS = Object.freeze({
    [USER_ROLES.CUSTOMER]: 'User',
    [USER_ROLES.ADMIN]: 'Admin',
    [USER_ROLES.WAREHOUSE_MANAGER]: 'Quản lý kho',
    [USER_ROLES.STAFF]: 'Nhân viên',
});

export const ROLE_OPTIONS = Object.freeze(
    Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label })),
);
