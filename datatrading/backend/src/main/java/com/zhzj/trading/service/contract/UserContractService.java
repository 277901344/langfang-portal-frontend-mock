package com.zhzj.trading.service.contract;

import com.zhzj.trading.dao.contract.UserContractMapper;
import com.zhzj.trading.model.User;
import com.zhzj.trading.model.contract.UserContractItem;
import com.zhzj.trading.model.fund.UserIdentityProfile;
import com.zhzj.trading.service.fund.FundAccountService;
import com.zhzj.trading.service.rbac.TradingAuthorizationService;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * User contract query service.
 *
 * @author Connector Team
 * @since 2026-05-27
 */
@Service
public class UserContractService {

    private final UserContractMapper userContractMapper;
    private final TradingAuthorizationService tradingAuthorizationService;
    private final FundAccountService fundAccountService;

    public UserContractService(UserContractMapper userContractMapper,
                               TradingAuthorizationService tradingAuthorizationService,
                               FundAccountService fundAccountService) {
        this.userContractMapper = userContractMapper;
        this.tradingAuthorizationService = tradingAuthorizationService;
        this.fundAccountService = fundAccountService;
    }

    public List<UserContractItem> listVisibleContracts(String productId, Long userId) {
        String normalizedProductId = StringUtils.trimToNull(productId);
        if (normalizedProductId == null) {
            throw new IllegalArgumentException("产品ID不能为空");
        }

        User currentUser = tradingAuthorizationService.getCurrentUser();
        Long currentUserId = currentUser.getId();
        Long visibleUserId = userId == null ? currentUserId : userId;
        if (visibleUserId == null) {
            throw new IllegalArgumentException("用户ID不能为空");
        }
        if (!isAdmin() && (currentUserId == null || !visibleUserId.equals(currentUserId))) {
            throw new IllegalArgumentException("当前用户无权查看该用户合约");
        }

        UserIdentityProfile profile = fundAccountService.requireIdentityProfile(visibleUserId);
        String userIdentityCode = StringUtils.trimToNull(profile.getUserIdentityCode());
        return userContractMapper.selectUserContracts(normalizedProductId, userIdentityCode,
                visibleUserId, profile.getResolvedUserId());
    }

    private boolean isAdmin() {
        return tradingAuthorizationService.getCurrentRoleCodes().stream()
                .anyMatch(roleCode -> "SUPER_ADMIN".equals(roleCode) || "ADMIN".equals(roleCode));
    }
}
