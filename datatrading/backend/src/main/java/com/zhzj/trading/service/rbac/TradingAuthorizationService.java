package com.zhzj.trading.service.rbac;

import com.zhzj.trading.model.User;
import com.zhzj.trading.dao.fund.UserIdentityProfileMapper;
import com.zhzj.trading.model.fund.UserIdentityProfile;
import com.zhzj.trading.model.rbac.MenuModule;
import com.zhzj.trading.shiro.dao.DBSessionMapper;
import org.apache.commons.lang3.StringUtils;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authz.UnauthorizedException;
import org.apache.shiro.session.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Trading platform authorization service.
 *
 * @author Connector Team
 * @since 2026-05-21
 */
@Service
public class TradingAuthorizationService {

    public static final String PERM_AUTHZ_CURRENT_VIEW = "authz:current:view";
    public static final String PERM_COMMODITY_MANAGEMENT_VIEW = "commodity-management:view";
    public static final String PERM_COMMODITY_MANAGEMENT_SAVE = "commodity-management:save";
    public static final String PERM_COMMODITY_MANAGEMENT_PUBLISH = "commodity-management:publish";
    public static final String PERM_COMMODITY_MANAGEMENT_DELETE = "commodity-management:delete";
    public static final String PERM_MARKETPLACE_VIEW = "marketplace:view";
    public static final String PERM_DEMAND_VIEW = "demand:view";
    public static final String PERM_DEMAND_CREATE = "demand:create";
    public static final String PERM_DEMAND_UPDATE = "demand:update";
    public static final String PERM_DEMAND_CLOSE = "demand:close";
    public static final String PERM_DEMAND_RESPOND = "demand:respond";
    public static final String PERM_DEMAND_RESPONSE_REVIEW = "demand:response:review";
    public static final String PERM_BILLING_VIEW = "billing:view";
    public static final String PERM_FUND_VIEW = "fund:view";
    public static final String PERM_FUND_ADMIN_VIEW = "fund:admin:view";
    public static final String PERM_FUND_ADMIN_RECHARGE = "fund:admin:recharge";
    public static final String PERM_FUND_ADMIN_RECHARGE_VOID = "fund:admin:recharge:void";
    public static final String PERM_FUND_ADMIN_DEBIT_VOID = "fund:admin:debit:void";
    public static final String PERM_ORDER_VIEW = "order:view";
    public static final String PERM_ORDER_CREATE = "order:create";
    public static final String PERM_ORDER_UPDATE = "order:update";
    public static final String PERM_ORDER_CANCEL = "order:cancel";
    public static final String PERM_ORDER_CONFIRM = "order:confirm";
    public static final String PERM_ORDER_COMPLETE = "order:complete";
    public static final String PERM_SYSTEM_MANAGE = "system:manage";

    private static final String MENU_PERMISSION_PREFIX = "menu:";
    private static final String MENU_PERMISSION_SUFFIX = ":view";

    private static final Map<String, List<String>> ROLE_MODULE_MAPPING = new LinkedHashMap<>();
    private static final Map<String, List<String>> ROLE_PERMISSION_MAPPING = new LinkedHashMap<>();
    private static final Map<String, MenuModule> MODULE_MAP = new LinkedHashMap<>();

    static {
        ROLE_MODULE_MAPPING.put("SUPER_ADMIN", Arrays.asList("01", "02", "03", "04"));
        ROLE_MODULE_MAPPING.put("ADMIN", Arrays.asList("01", "02", "03", "04"));
        ROLE_MODULE_MAPPING.put("VERIFIED_USER", Arrays.asList("01", "02", "03", "04"));
        ROLE_MODULE_MAPPING.put("VERIFIED_SUB_ACCOUNT", Arrays.asList("01", "03"));
        ROLE_MODULE_MAPPING.put("REGISTER_UNVERIFIED_USER", Collections.singletonList("01"));

        ROLE_PERMISSION_MAPPING.put("SUPER_ADMIN", Arrays.asList(
                PERM_AUTHZ_CURRENT_VIEW,
                PERM_COMMODITY_MANAGEMENT_VIEW,
                PERM_COMMODITY_MANAGEMENT_PUBLISH,
                PERM_MARKETPLACE_VIEW,
                PERM_DEMAND_VIEW,
                PERM_DEMAND_CREATE,
                PERM_DEMAND_UPDATE,
                PERM_DEMAND_CLOSE,
                PERM_DEMAND_RESPOND,
                PERM_DEMAND_RESPONSE_REVIEW,
                PERM_BILLING_VIEW,
                PERM_FUND_VIEW,
                PERM_FUND_ADMIN_VIEW,
                PERM_FUND_ADMIN_RECHARGE,
                PERM_FUND_ADMIN_RECHARGE_VOID,
                PERM_FUND_ADMIN_DEBIT_VOID,
                PERM_ORDER_VIEW,
                PERM_ORDER_CREATE,
                PERM_ORDER_UPDATE,
                PERM_ORDER_CANCEL,
                PERM_ORDER_CONFIRM,
                PERM_ORDER_COMPLETE,
                PERM_SYSTEM_MANAGE
        ));
        ROLE_PERMISSION_MAPPING.put("ADMIN", Arrays.asList(
                PERM_AUTHZ_CURRENT_VIEW,
                PERM_COMMODITY_MANAGEMENT_VIEW,
                PERM_COMMODITY_MANAGEMENT_PUBLISH,
                PERM_MARKETPLACE_VIEW,
                PERM_DEMAND_VIEW,
                PERM_DEMAND_CREATE,
                PERM_DEMAND_UPDATE,
                PERM_DEMAND_CLOSE,
                PERM_DEMAND_RESPOND,
                PERM_DEMAND_RESPONSE_REVIEW,
                PERM_BILLING_VIEW,
                PERM_FUND_VIEW,
                PERM_FUND_ADMIN_VIEW,
                PERM_FUND_ADMIN_RECHARGE,
                PERM_FUND_ADMIN_RECHARGE_VOID,
                PERM_FUND_ADMIN_DEBIT_VOID,
                PERM_ORDER_VIEW,
                PERM_ORDER_CREATE,
                PERM_ORDER_UPDATE,
                PERM_ORDER_CANCEL,
                PERM_ORDER_CONFIRM,
                PERM_ORDER_COMPLETE,
                PERM_SYSTEM_MANAGE
        ));
        ROLE_PERMISSION_MAPPING.put("VERIFIED_USER", Arrays.asList(
                PERM_AUTHZ_CURRENT_VIEW,
                PERM_COMMODITY_MANAGEMENT_VIEW,
                PERM_COMMODITY_MANAGEMENT_SAVE,
                PERM_COMMODITY_MANAGEMENT_PUBLISH,
                PERM_COMMODITY_MANAGEMENT_DELETE,
                PERM_MARKETPLACE_VIEW,
                PERM_DEMAND_VIEW,
                PERM_DEMAND_CREATE,
                PERM_DEMAND_UPDATE,
                PERM_DEMAND_CLOSE,
                PERM_DEMAND_RESPOND,
                PERM_DEMAND_RESPONSE_REVIEW,
                PERM_BILLING_VIEW,
                PERM_FUND_VIEW,
                PERM_ORDER_VIEW,
                PERM_ORDER_CREATE,
                PERM_ORDER_UPDATE,
                PERM_ORDER_CANCEL,
                PERM_ORDER_CONFIRM,
                PERM_ORDER_COMPLETE
        ));
        ROLE_PERMISSION_MAPPING.put("VERIFIED_SUB_ACCOUNT", Arrays.asList(
                PERM_AUTHZ_CURRENT_VIEW,
                PERM_MARKETPLACE_VIEW,
                PERM_BILLING_VIEW,
                PERM_FUND_VIEW
        ));
        ROLE_PERMISSION_MAPPING.put("REGISTER_UNVERIFIED_USER", Arrays.asList(
                PERM_AUTHZ_CURRENT_VIEW,
                PERM_MARKETPLACE_VIEW
        ));

        registerModule(1L, "01", "数据市场", "/marketplace", 1);
        registerModule(2L, "02", "需求中心", "/demand-center", 2);
        registerModule(3L, "03", "计量计费", "/billing", 3);
        registerModule(4L, "04", "交易订单", "/trade-order", 4);
    }

    @Autowired
    private DBSessionMapper dbSessionMapper;

    @Autowired(required = false)
    private UserIdentityProfileMapper userIdentityProfileMapper;

    public User getCurrentUser() {
        User user = getCurrentUserOrNull();
        if (user == null) {
            throw new IllegalArgumentException("用户不存在");
        }
        return user;
    }

    public User getCurrentUserOrNull() {
        Object principal = SecurityUtils.getSubject().getPrincipal();
        if (!(principal instanceof User)) {
            return null;
        }
        User user = (User) principal;
        enrichIdentityProfileIfMissing(user);
        return user;
    }

    private void enrichIdentityProfileIfMissing(User user) {
        if (user == null
                || user.getId() == null
                || user.getId() <= 0
                || userIdentityProfileMapper == null
                || StringUtils.isNotBlank(user.getSubjectName())) {
            return;
        }
        try {
            UserIdentityProfile profile = userIdentityProfileMapper.selectByUserId(user.getId());
            if (profile == null) {
                return;
            }
            user.setUserIdentityCode(StringUtils.trimToNull(profile.getUserIdentityCode()));
            user.setSubjectName(StringUtils.trimToNull(profile.getSubjectName()));
        } catch (Exception ignored) {
            // Subject display is auxiliary and must not block authz loading.
        }
    }

    public List<String> getCurrentRoleCodes() {
        return resolveRoleCodes(getCurrentUser());
    }

    public List<String> getCurrentPermissionCodes() {
        return resolvePermissionCodes(getCurrentRoleCodes());
    }

    public List<MenuModule> getCurrentMenuModules() {
        List<String> moduleIds = resolveAllowedModuleIds(getCurrentRoleCodes());
        List<MenuModule> modules = new ArrayList<>();
        for (String moduleId : moduleIds) {
            MenuModule module = MODULE_MAP.get(moduleId);
            if (module != null) {
                modules.add(module);
            }
        }
        modules.sort(Comparator.comparing(MenuModule::getSortOrder));
        return modules;
    }

    public List<String> resolveRoleCodes(User user) {
        if (user == null) {
            return Collections.emptyList();
        }

        Session session = SecurityUtils.getSubject().getSession(false);
        if (session != null) {
            Object cachedRoleCodes = session.getAttribute("roleCodes");
            if (cachedRoleCodes instanceof List) {
                @SuppressWarnings("unchecked")
                List<String> roleCodes = (List<String>) cachedRoleCodes;
                if (!roleCodes.isEmpty()) {
                    return roleCodes;
                }
            }
        }

        Set<String> resolvedRoleCodes = new LinkedHashSet<>();
        String platformUserId = resolvePlatformUserId(user, session);
        if (StringUtils.isNotBlank(platformUserId)) {
            try {
                Set<String> dbRoleCodes = dbSessionMapper.loadUserRole(platformUserId);
                if (dbRoleCodes != null) {
                    dbRoleCodes.stream()
                            .filter(StringUtils::isNotBlank)
                            .map(StringUtils::trim)
                            .forEach(resolvedRoleCodes::add);
                }
            } catch (Exception ignored) {
                // fall back to accountType/accountRole mapping
            }
        }

        if (resolvedRoleCodes.isEmpty()) {
            resolvedRoleCodes.addAll(resolveFallbackRoleCodes(user));
        }

        List<String> roleCodes = resolvedRoleCodes.stream().sorted().collect(Collectors.toList());
        if (session != null) {
            session.setAttribute("roleCodes", roleCodes);
        }
        return roleCodes;
    }

    public List<String> resolvePermissionCodes(List<String> roleCodes) {
        LinkedHashSet<String> permissions = new LinkedHashSet<>();
        for (String roleCode : roleCodes) {
            List<String> configured = ROLE_PERMISSION_MAPPING.get(roleCode);
            if (configured != null) {
                permissions.addAll(configured);
            }
        }
        for (String moduleId : resolveAllowedModuleIds(roleCodes)) {
            permissions.add(MENU_PERMISSION_PREFIX + moduleId + MENU_PERMISSION_SUFFIX);
        }
        return new ArrayList<>(permissions);
    }

    public void assertAnyRole(String... allowedRoleCodes) {
        List<String> currentRoleCodes = getCurrentRoleCodes();
        for (String allowedRoleCode : allowedRoleCodes) {
            if (currentRoleCodes.contains(allowedRoleCode)) {
                return;
            }
        }
        throw new UnauthorizedException("无权限访问");
    }

    private List<String> resolveAllowedModuleIds(List<String> roleCodes) {
        Set<String> moduleIds = new LinkedHashSet<>();
        for (String roleCode : roleCodes) {
            List<String> configured = ROLE_MODULE_MAPPING.get(roleCode);
            if (configured != null) {
                moduleIds.addAll(configured);
            }
        }
        return new ArrayList<>(moduleIds);
    }

    private List<String> resolveFallbackRoleCodes(User user) {
        if (user != null && StringUtils.equalsIgnoreCase(user.getAccountRole(), "admin")) {
            return Collections.singletonList("ADMIN");
        }

        Integer accountType = user == null ? null : user.getAccountType();
        if (accountType != null && accountType == 3) {
            return Collections.singletonList("VERIFIED_SUB_ACCOUNT");
        }
        if (accountType != null && accountType == 2) {
            return Collections.singletonList("VERIFIED_USER");
        }
        return Collections.singletonList("REGISTER_UNVERIFIED_USER");
    }

    private String resolvePlatformUserId(User user, Session session) {
        if (session != null) {
            Object platformUserId = session.getAttribute("platformUserId");
            if (platformUserId != null) {
                return String.valueOf(platformUserId);
            }
        }
        return user.getId() == null ? null : String.valueOf(user.getId());
    }

    private static void registerModule(Long id, String moduleId, String moduleName, String routePath, Integer sortOrder) {
        MenuModule menuModule = new MenuModule();
        menuModule.setId(id);
        menuModule.setModuleId(moduleId);
        menuModule.setModuleName(moduleName);
        menuModule.setRoutePath(routePath);
        menuModule.setSortOrder(sortOrder);
        menuModule.setStatus("active");
        menuModule.setIsGoverned(Boolean.FALSE);
        MODULE_MAP.put(moduleId, menuModule);
    }
}
