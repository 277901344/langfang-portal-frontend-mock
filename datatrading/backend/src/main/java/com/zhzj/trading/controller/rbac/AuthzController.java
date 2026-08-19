package com.zhzj.trading.controller.rbac;

import com.zhzj.trading.common.Result;
import com.zhzj.trading.model.User;
import com.zhzj.trading.model.rbac.CurrentAuthzResponse;
import com.zhzj.trading.service.rbac.TradingAuthorizationService;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Trading 当前权限控制器。
 *
 * @author Connector Team
 * @since 2026-05-21
 */
@RestController
@RequestMapping("/authz")
public class AuthzController {

    @Autowired
    private TradingAuthorizationService tradingAuthorizationService;

    @GetMapping("/current/menu-modules")
    @RequiresPermissions(TradingAuthorizationService.PERM_AUTHZ_CURRENT_VIEW)
    public Result<Object> currentMenuModules() {
        return Result.ok(tradingAuthorizationService.getCurrentMenuModules());
    }

    @GetMapping("/current/permissions")
    @RequiresPermissions(TradingAuthorizationService.PERM_AUTHZ_CURRENT_VIEW)
    public Result<CurrentAuthzResponse> currentPermissions() {
        User currentUser = tradingAuthorizationService.getCurrentUser();
        CurrentAuthzResponse response = new CurrentAuthzResponse();
        response.setPermissions(tradingAuthorizationService.getCurrentPermissionCodes());
        response.setRoleCodes(tradingAuthorizationService.getCurrentRoleCodes());
        response.setMenuModules(tradingAuthorizationService.getCurrentMenuModules());
        response.setAccountType(currentUser.getAccountType());
        response.setUserIdentityCode(currentUser.getUserIdentityCode());
        response.setSubjectName(currentUser.getSubjectName());
        return Result.ok(response);
    }
}
