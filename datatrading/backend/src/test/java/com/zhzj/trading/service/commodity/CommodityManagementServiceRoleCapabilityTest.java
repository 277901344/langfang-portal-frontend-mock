package com.zhzj.trading.service.commodity;

import com.zhzj.trading.model.User;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CommodityManagementServiceRoleCapabilityTest {

    private final CommodityManagementService service = new CommodityManagementService();

    @Test
    void verifiedSubjectCanManageOwnCommodity() {
        User user = userWithAccountType(2);

        assertTrue(service.canManageOwnCommodity(user, true));
    }

    @Test
    void pureAdminAccountCannotManageOwnCommodity() {
        User user = userWithAccountType(1);
        user.setAccountRole("admin");

        assertFalse(service.canManageOwnCommodity(user, true));
    }

    @Test
    void existingNonAdminAccountCapabilityRemainsUnchanged() {
        User user = userWithAccountType(3);

        assertTrue(service.canManageOwnCommodity(user, false));
    }

    @Test
    void missingUserContextCannotManageOwnCommodity() {
        assertFalse(service.canManageOwnCommodity(null, false));
    }

    private User userWithAccountType(int accountType) {
        User user = new User();
        user.setAccountType(accountType);
        return user;
    }
}
