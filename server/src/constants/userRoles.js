const USER_ROLES = Object.freeze({
    CUSTOMER: '0',
    ADMIN: '1',
    WAREHOUSE_MANAGER: '2',
    STAFF: '3',
});

const ADMIN_ACCESS_ROLES = Object.freeze([
    USER_ROLES.ADMIN,
    USER_ROLES.WAREHOUSE_MANAGER,
    USER_ROLES.STAFF,
]);

const ROLE_LABELS = Object.freeze({
    [USER_ROLES.CUSTOMER]: 'User',
    [USER_ROLES.ADMIN]: 'Admin',
    [USER_ROLES.WAREHOUSE_MANAGER]: 'Quản lý kho',
    [USER_ROLES.STAFF]: 'Nhân viên',
});

module.exports = {
    USER_ROLES,
    ADMIN_ACCESS_ROLES,
    ROLE_LABELS,
};
