package com.zhzj.trading.shiro;

import com.zhzj.trading.controller.demandcenter.DemandCenterController;
import com.zhzj.trading.controller.marketplace.MarketplaceController;
import com.zhzj.trading.service.rbac.TradingAuthorizationService;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.apache.shiro.mgt.SecurityManager;
import org.apache.shiro.spring.web.ShiroFilterFactoryBean;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;

class PublicReadSecurityContractTest {

    @Test
    void shiroOnlyAllowsDeclaredPublicReadPathsBeforeDefaultAuthentication() {
        ShiroFilterFactoryBean factory = new ShiroConfig().shirFilter(mock(SecurityManager.class));
        Map<String, String> chains = factory.getFilterChainDefinitionMap();

        assertEquals("anon", chains.get("/marketplace/categories"));
        assertEquals("anon", chains.get("/marketplace/commodities"));
        assertEquals("anon", chains.get("/marketplace/commodities/detail"));
        assertEquals("anon", chains.get("/marketplace/commodities/*/cover"));
        assertNull(chains.get("/file/download"));
        assertEquals("anon", chains.get("/demand-center/demands"));
        assertEquals("anon", chains.get("/demand-center/demands/*"));
        assertEquals("authc", chains.get("/**"));
    }

    @Test
    void marketplaceWritesRemainPermissionProtected() {
        assertPublic(MarketplaceController.class, "listCommodities");
        assertPublic(MarketplaceController.class, "commodityDetail");
        assertPublic(MarketplaceController.class, "commodityCover");
        assertPublic(MarketplaceController.class, "categories");
        assertPermission(MarketplaceController.class, "commodityProviderInfo",
                TradingAuthorizationService.PERM_ORDER_CREATE);
        assertPermission(MarketplaceController.class, "purchase",
                TradingAuthorizationService.PERM_ORDER_CREATE);
    }

    @Test
    void demandWritesRemainPermissionProtected() {
        assertPublic(DemandCenterController.class, "listDemands");
        assertPublic(DemandCenterController.class, "demandDetail");
        assertPermission(DemandCenterController.class, "createDemand",
                TradingAuthorizationService.PERM_DEMAND_CREATE);
        assertPermission(DemandCenterController.class, "updateDemand",
                TradingAuthorizationService.PERM_DEMAND_UPDATE);
        assertPermission(DemandCenterController.class, "publishDemand",
                TradingAuthorizationService.PERM_DEMAND_CREATE);
        assertPermission(DemandCenterController.class, "closeDemand",
                TradingAuthorizationService.PERM_DEMAND_CLOSE);
        assertPermission(DemandCenterController.class, "respondDemand",
                TradingAuthorizationService.PERM_DEMAND_RESPOND);
        assertPermission(DemandCenterController.class, "acceptResponse",
                TradingAuthorizationService.PERM_DEMAND_RESPONSE_REVIEW);
        assertPermission(DemandCenterController.class, "rejectResponse",
                TradingAuthorizationService.PERM_DEMAND_RESPONSE_REVIEW);
    }

    private void assertPublic(Class<?> controllerClass, String methodName) {
        Method method = findMethod(controllerClass, methodName);
        assertNull(method.getAnnotation(RequiresPermissions.class));
    }

    private void assertPermission(Class<?> controllerClass, String methodName, String permission) {
        Method method = findMethod(controllerClass, methodName);
        RequiresPermissions annotation = method.getAnnotation(RequiresPermissions.class);
        assertTrue(annotation != null && annotation.value().length == 1);
        assertEquals(permission, annotation.value()[0]);
    }

    private Method findMethod(Class<?> controllerClass, String methodName) {
        for (Method method : controllerClass.getDeclaredMethods()) {
            if (method.getName().equals(methodName)) {
                return method;
            }
        }
        throw new AssertionError("Method not found: " + controllerClass.getName() + "#" + methodName);
    }
}
