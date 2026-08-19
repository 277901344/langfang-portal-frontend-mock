package com.zhzj.trading.service.fund;

import com.zhzj.trading.dao.fund.FundAccountFlowMapper;
import com.zhzj.trading.dao.fund.FundAccountMapper;
import com.zhzj.trading.dao.fund.UserIdentityProfileMapper;
import com.zhzj.trading.dao.tradeorder.TradeOrderMapper;
import com.zhzj.trading.model.User;
import com.zhzj.trading.model.fund.FundAccountEntity;
import com.zhzj.trading.model.fund.FundAccountFlowEntity;
import com.zhzj.trading.model.fund.FundAccountItem;
import com.zhzj.trading.model.fund.FundAccountListResponse;
import com.zhzj.trading.model.fund.FundFlowItem;
import com.zhzj.trading.model.fund.FundFlowListResponse;
import com.zhzj.trading.model.fund.FundSubjectListResponse;
import com.zhzj.trading.model.fund.OrderPaymentSnapshot;
import com.zhzj.trading.model.fund.UserIdentityProfile;
import com.zhzj.trading.model.resource.fund.FundAccountQueryRequest;
import com.zhzj.trading.model.resource.fund.FundFlowQueryRequest;
import com.zhzj.trading.model.resource.fund.FundRechargeRequest;
import com.zhzj.trading.model.resource.fund.FundSubjectQueryRequest;
import com.zhzj.trading.model.tradeorder.TradeOrderEntity;
import com.zhzj.trading.service.client.FundSubjectClient;
import com.zhzj.trading.service.rbac.TradingAuthorizationService;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class FundAccountService {

    private static final String ROLE_BUYER = "BUYER";
    private static final String ROLE_SELLER = "SELLER";
    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String FLOW_RECHARGE = "RECHARGE";
    private static final String FLOW_RECHARGE_VOID = "RECHARGE_VOID";
    private static final String FLOW_DEBIT = "DEBIT";
    private static final String FLOW_DEBIT_VOID = "DEBIT_VOID";
    private static final String FLOW_INCOME = "INCOME";
    private static final String FLOW_INCOME_VOID = "INCOME_VOID";
    private static final String PAYMENT_UNPAID = "UNPAID";
    private static final String PAYMENT_PAID = "PAID";
    private static final String PAYMENT_VOID = "VOID";

    private final FundAccountMapper fundAccountMapper;
    private final FundAccountFlowMapper fundAccountFlowMapper;
    private final UserIdentityProfileMapper userIdentityProfileMapper;
    private final TradeOrderMapper tradeOrderMapper;
    private final TradingAuthorizationService tradingAuthorizationService;
    private final FundSubjectClient fundSubjectClient;

    public FundAccountService(FundAccountMapper fundAccountMapper,
                              FundAccountFlowMapper fundAccountFlowMapper,
                              UserIdentityProfileMapper userIdentityProfileMapper,
                              TradeOrderMapper tradeOrderMapper,
                              TradingAuthorizationService tradingAuthorizationService,
                              FundSubjectClient fundSubjectClient) {
        this.fundAccountMapper = fundAccountMapper;
        this.fundAccountFlowMapper = fundAccountFlowMapper;
        this.userIdentityProfileMapper = userIdentityProfileMapper;
        this.tradeOrderMapper = tradeOrderMapper;
        this.tradingAuthorizationService = tradingAuthorizationService;
        this.fundSubjectClient = fundSubjectClient;
    }

    public FundSubjectListResponse listSubjects(FundSubjectQueryRequest request) {
        FundSubjectQueryRequest normalized = normalizeSubjectQuery(request);
        return fundSubjectClient.listSubjects(normalized);
    }

    public FundAccountListResponse listAdminAccounts(FundAccountQueryRequest request) {
        FundAccountQueryRequest normalized = normalizeAccountQuery(request);
        int total = fundAccountMapper.countAdminList(normalized);
        List<FundAccountItem> rows = fundAccountMapper.selectAdminList(
                normalized,
                calculateOffset(normalized.getPageNum(), normalized.getPageSize()),
                normalized.getPageSize()
        );
        FundAccountListResponse response = new FundAccountListResponse();
        response.setData(rows);
        response.setDataCount(total);
        response.setPageCount(calculatePageCount(total, normalized.getPageSize()));
        return response;
    }

    public FundFlowListResponse listAdminFlows(FundFlowQueryRequest request) {
        FundFlowQueryRequest normalized = normalizeFlowQuery(request);
        int total = fundAccountFlowMapper.countAdminList(normalized);
        List<FundFlowItem> rows = fundAccountFlowMapper.selectAdminList(
                normalized,
                calculateOffset(normalized.getPageNum(), normalized.getPageSize()),
                normalized.getPageSize()
        );
        FundFlowListResponse response = new FundFlowListResponse();
        response.setData(rows);
        response.setDataCount(total);
        response.setPageCount(calculatePageCount(total, normalized.getPageSize()));
        return response;
    }

    @Transactional
    public String recharge(FundRechargeRequest request) {
        BigDecimal amount = normalizePositiveAmount(request.getAmount(), "充值金额必须大于0");
        Date now = new Date();
        User currentUser = tradingAuthorizationService.getCurrentUser();

        FundAccountEntity buyerAccount = requireOrCreateAccount(
                StringUtils.trimToEmpty(request.getUserIdentityCode()),
                StringUtils.defaultIfBlank(StringUtils.trimToNull(request.getSubjectName()), StringUtils.trimToEmpty(request.getUserIdentityCode())),
                ROLE_BUYER,
                now
        );
        BigDecimal beforeBalance = defaultAmount(buyerAccount.getAvailableBalance());
        BigDecimal afterBalance = beforeBalance.add(amount);
        buyerAccount.setAvailableBalance(afterBalance);
        buyerAccount.setTotalRechargeAmount(defaultAmount(buyerAccount.getTotalRechargeAmount()).add(amount));
        buyerAccount.setUpdatedAt(now);
        persistAccountSnapshot(buyerAccount);

        FundAccountFlowEntity flow = new FundAccountFlowEntity();
        flow.setFlowNo(generateFlowNo(now));
        flow.setUserIdentityCode(buyerAccount.getUserIdentityCode());
        flow.setSubjectName(buyerAccount.getSubjectName());
        flow.setAccountRole(ROLE_BUYER);
        flow.setFlowType(FLOW_RECHARGE);
        flow.setAmount(amount);
        flow.setBeforeBalance(beforeBalance);
        flow.setAfterBalance(afterBalance);
        flow.setAttachmentUrl(StringUtils.trimToNull(request.getAttachmentUrl()));
        flow.setRemark(StringUtils.trimToNull(request.getRemark()));
        flow.setOperatorId(currentUser.getId());
        flow.setOperatorName(resolveOperatorName(currentUser));
        flow.setCreatedAt(now);
        fundAccountFlowMapper.insert(flow);
        return flow.getFlowNo();
    }

    @Transactional
    public void voidRecharge(Long flowId) {
        FundAccountFlowEntity original = requireFlow(flowId);
        if (!FLOW_RECHARGE.equals(original.getFlowType())) {
            throw new IllegalArgumentException("当前流水不支持充值作废");
        }
        ensureNotVoided(original.getId());

        FundAccountEntity account = requireAccount(original.getUserIdentityCode(), original.getAccountRole());
        BigDecimal amount = defaultAmount(original.getAmount());
        BigDecimal beforeBalance = defaultAmount(account.getAvailableBalance());
        BigDecimal afterBalance = beforeBalance.subtract(amount);
        if (afterBalance.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("账户余额不足，无法执行充值作废");
        }

        Date now = new Date();
        account.setAvailableBalance(afterBalance);
        account.setTotalRechargeAmount(defaultAmount(account.getTotalRechargeAmount()).subtract(amount));
        account.setUpdatedAt(now);
        persistAccountSnapshot(account);

        User currentUser = tradingAuthorizationService.getCurrentUser();
        FundAccountFlowEntity flow = new FundAccountFlowEntity();
        flow.setFlowNo(generateFlowNo(now));
        flow.setUserIdentityCode(account.getUserIdentityCode());
        flow.setSubjectName(account.getSubjectName());
        flow.setAccountRole(account.getAccountRole());
        flow.setFlowType(FLOW_RECHARGE_VOID);
        flow.setAmount(amount);
        flow.setBeforeBalance(beforeBalance);
        flow.setAfterBalance(afterBalance);
        flow.setRelatedFlowId(original.getId());
        flow.setAttachmentUrl(StringUtils.trimToNull(original.getAttachmentUrl()));
        flow.setRemark("充值作废");
        flow.setOperatorId(currentUser.getId());
        flow.setOperatorName(resolveOperatorName(currentUser));
        flow.setCreatedAt(now);
        fundAccountFlowMapper.insert(flow);
    }

    @Transactional
    public void voidDebit(Long flowId) {
        FundAccountFlowEntity debitFlow = requireFlow(flowId);
        if (!FLOW_DEBIT.equals(debitFlow.getFlowType())) {
            throw new IllegalArgumentException("当前流水不支持扣费作废");
        }
        ensureNotVoided(debitFlow.getId());

        FundAccountFlowEntity incomeFlow = fundAccountFlowMapper.selectIncomeFlowByRelatedFlowId(debitFlow.getId());
        if (incomeFlow == null) {
            throw new IllegalArgumentException("未找到关联收入流水，无法执行扣费作废");
        }
        ensureNotVoided(incomeFlow.getId());

        FundAccountEntity buyerAccount = requireAccount(debitFlow.getUserIdentityCode(), debitFlow.getAccountRole());
        FundAccountEntity sellerAccount = requireAccount(incomeFlow.getUserIdentityCode(), incomeFlow.getAccountRole());

        BigDecimal amount = defaultAmount(debitFlow.getAmount());
        Date now = new Date();
        User currentUser = tradingAuthorizationService.getCurrentUser();

        BigDecimal buyerBefore = defaultAmount(buyerAccount.getAvailableBalance());
        BigDecimal buyerAfter = buyerBefore.add(amount);
        buyerAccount.setAvailableBalance(buyerAfter);
        buyerAccount.setTotalDebitAmount(defaultAmount(buyerAccount.getTotalDebitAmount()).subtract(amount));
        buyerAccount.setUpdatedAt(now);
        persistAccountSnapshot(buyerAccount);

        FundAccountFlowEntity buyerVoidFlow = new FundAccountFlowEntity();
        buyerVoidFlow.setFlowNo(generateFlowNo(now));
        buyerVoidFlow.setUserIdentityCode(buyerAccount.getUserIdentityCode());
        buyerVoidFlow.setSubjectName(buyerAccount.getSubjectName());
        buyerVoidFlow.setAccountRole(buyerAccount.getAccountRole());
        buyerVoidFlow.setFlowType(FLOW_DEBIT_VOID);
        buyerVoidFlow.setAmount(amount);
        buyerVoidFlow.setBeforeBalance(buyerBefore);
        buyerVoidFlow.setAfterBalance(buyerAfter);
        buyerVoidFlow.setOrderId(debitFlow.getOrderId());
        buyerVoidFlow.setOrderNo(debitFlow.getOrderNo());
        buyerVoidFlow.setRelatedFlowId(debitFlow.getId());
        buyerVoidFlow.setRemark("扣费作废");
        buyerVoidFlow.setOperatorId(currentUser.getId());
        buyerVoidFlow.setOperatorName(resolveOperatorName(currentUser));
        buyerVoidFlow.setCreatedAt(now);
        fundAccountFlowMapper.insert(buyerVoidFlow);

        BigDecimal sellerBefore = defaultAmount(sellerAccount.getAvailableBalance());
        BigDecimal sellerAfter = sellerBefore.subtract(amount);
        if (sellerAfter.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("卖方收入余额不足，无法执行扣费作废");
        }
        sellerAccount.setAvailableBalance(sellerAfter);
        sellerAccount.setTotalIncomeAmount(defaultAmount(sellerAccount.getTotalIncomeAmount()).subtract(amount));
        sellerAccount.setUpdatedAt(now);
        persistAccountSnapshot(sellerAccount);

        FundAccountFlowEntity incomeVoidFlow = new FundAccountFlowEntity();
        incomeVoidFlow.setFlowNo(generateFlowNo(new Date(now.getTime() + 1)));
        incomeVoidFlow.setUserIdentityCode(sellerAccount.getUserIdentityCode());
        incomeVoidFlow.setSubjectName(sellerAccount.getSubjectName());
        incomeVoidFlow.setAccountRole(sellerAccount.getAccountRole());
        incomeVoidFlow.setFlowType(FLOW_INCOME_VOID);
        incomeVoidFlow.setAmount(amount);
        incomeVoidFlow.setBeforeBalance(sellerBefore);
        incomeVoidFlow.setAfterBalance(sellerAfter);
        incomeVoidFlow.setOrderId(incomeFlow.getOrderId());
        incomeVoidFlow.setOrderNo(incomeFlow.getOrderNo());
        incomeVoidFlow.setRelatedFlowId(incomeFlow.getId());
        incomeVoidFlow.setRemark("收入冲回");
        incomeVoidFlow.setOperatorId(currentUser.getId());
        incomeVoidFlow.setOperatorName(resolveOperatorName(currentUser));
        incomeVoidFlow.setCreatedAt(new Date(now.getTime() + 1));
        fundAccountFlowMapper.insert(incomeVoidFlow);

        if (StringUtils.isNotBlank(debitFlow.getOrderId())) {
            tradeOrderMapper.updatePaymentSnapshot(
                    debitFlow.getOrderId(),
                    PAYMENT_VOID,
                    amount,
                    null,
                    debitFlow.getId(),
                    incomeFlow.getId(),
                    now
            );
        }
    }

    public FundAccountListResponse listMyAccounts() {
        UserIdentityProfile identityProfile = requireCurrentIdentityProfile();
        List<FundAccountItem> rows = fundAccountMapper.selectByIdentityCode(identityProfile.getUserIdentityCode());
        FundAccountListResponse response = new FundAccountListResponse();
        response.setData(rows);
        response.setDataCount(rows.size());
        response.setPageCount(rows.isEmpty() ? 0 : 1);
        return response;
    }

    public FundFlowListResponse listMyFlows(FundFlowQueryRequest request) {
        UserIdentityProfile identityProfile = requireCurrentIdentityProfile();
        FundFlowQueryRequest normalized = normalizeFlowQuery(request);
        int total = fundAccountFlowMapper.countByIdentityCode(identityProfile.getUserIdentityCode(), normalized);
        List<FundFlowItem> rows = fundAccountFlowMapper.selectByIdentityCode(
                identityProfile.getUserIdentityCode(),
                normalized,
                calculateOffset(normalized.getPageNum(), normalized.getPageSize()),
                normalized.getPageSize()
        );
        FundFlowListResponse response = new FundFlowListResponse();
        response.setData(rows);
        response.setDataCount(total);
        response.setPageCount(calculatePageCount(total, normalized.getPageSize()));
        return response;
    }

    public void assertBuyerBalanceEnoughForOrderCreation(String userIdentityCode, BigDecimal amount) {
        assertBuyerBalanceEnough(
                userIdentityCode,
                amount,
                "买方资金账户不存在，请先充值后再下单",
                "当前余额不足，请先充值后再下单"
        );
    }

    @Transactional
    public OrderPaymentSnapshot debitOnOrderCompleted(TradeOrderEntity order, Date now) {
        ensureOrderIdentitySnapshot(order, now);
        BigDecimal amount = resolvePayableAmount(order);
        OrderPaymentSnapshot snapshot = new OrderPaymentSnapshot();
        snapshot.setPaymentStatus(PAYMENT_PAID);
        snapshot.setPaidAmount(amount);
        snapshot.setPaidAt(now);

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            return snapshot;
        }
        if (StringUtils.isBlank(order.getBuyerUserIdentityCode())) {
            throw new IllegalArgumentException("买方user_identity_code缺失，无法完成扣费");
        }
        if (StringUtils.isBlank(order.getSellerUserIdentityCode())) {
            throw new IllegalArgumentException("卖方user_identity_code缺失，无法完成扣费");
        }

        FundAccountEntity buyerAccount = fundAccountMapper.selectByIdentityAndRole(order.getBuyerUserIdentityCode(), ROLE_BUYER);
        if (buyerAccount == null) {
            throw new IllegalArgumentException("买方资金账户不存在，无法完成扣费，请联系管理员充值后重试");
        }
        BigDecimal buyerBefore = defaultAmount(buyerAccount.getAvailableBalance());
        if (buyerBefore.compareTo(amount) < 0) {
            throw new IllegalArgumentException("当前余额不足，无法完成扣费，请联系管理员充值后重试");
        }
        BigDecimal buyerAfter = buyerBefore.subtract(amount);
        buyerAccount.setAvailableBalance(buyerAfter);
        buyerAccount.setTotalDebitAmount(defaultAmount(buyerAccount.getTotalDebitAmount()).add(amount));
        buyerAccount.setUpdatedAt(now);
        persistAccountSnapshot(buyerAccount);

        FundAccountFlowEntity debitFlow = new FundAccountFlowEntity();
        debitFlow.setFlowNo(generateFlowNo(now));
        debitFlow.setUserIdentityCode(buyerAccount.getUserIdentityCode());
        debitFlow.setSubjectName(buyerAccount.getSubjectName());
        debitFlow.setAccountRole(ROLE_BUYER);
        debitFlow.setFlowType(FLOW_DEBIT);
        debitFlow.setAmount(amount);
        debitFlow.setBeforeBalance(buyerBefore);
        debitFlow.setAfterBalance(buyerAfter);
        debitFlow.setOrderId(order.getId());
        debitFlow.setOrderNo(order.getOrderNo());
        debitFlow.setRemark("订单完成扣费");
        User currentUser = tradingAuthorizationService.getCurrentUser();
        debitFlow.setOperatorId(currentUser.getId());
        debitFlow.setOperatorName(resolveOperatorName(currentUser));
        debitFlow.setCreatedAt(now);
        fundAccountFlowMapper.insert(debitFlow);

        FundAccountEntity sellerAccount = requireOrCreateAccount(
                order.getSellerUserIdentityCode(),
                StringUtils.defaultIfBlank(order.getSellerSubjectName(), order.getSellerUserIdentityCode()),
                ROLE_SELLER,
                now
        );
        BigDecimal sellerBefore = defaultAmount(sellerAccount.getAvailableBalance());
        BigDecimal sellerAfter = sellerBefore.add(amount);
        sellerAccount.setAvailableBalance(sellerAfter);
        sellerAccount.setTotalIncomeAmount(defaultAmount(sellerAccount.getTotalIncomeAmount()).add(amount));
        sellerAccount.setUpdatedAt(now);
        persistAccountSnapshot(sellerAccount);

        FundAccountFlowEntity incomeFlow = new FundAccountFlowEntity();
        incomeFlow.setFlowNo(generateFlowNo(new Date(now.getTime() + 1)));
        incomeFlow.setUserIdentityCode(sellerAccount.getUserIdentityCode());
        incomeFlow.setSubjectName(sellerAccount.getSubjectName());
        incomeFlow.setAccountRole(ROLE_SELLER);
        incomeFlow.setFlowType(FLOW_INCOME);
        incomeFlow.setAmount(amount);
        incomeFlow.setBeforeBalance(sellerBefore);
        incomeFlow.setAfterBalance(sellerAfter);
        incomeFlow.setOrderId(order.getId());
        incomeFlow.setOrderNo(order.getOrderNo());
        incomeFlow.setRelatedFlowId(debitFlow.getId());
        incomeFlow.setRemark("订单完成入账");
        incomeFlow.setOperatorId(currentUser.getId());
        incomeFlow.setOperatorName(resolveOperatorName(currentUser));
        incomeFlow.setCreatedAt(new Date(now.getTime() + 1));
        fundAccountFlowMapper.insert(incomeFlow);

        snapshot.setDebitFlowId(debitFlow.getId());
        snapshot.setIncomeFlowId(incomeFlow.getId());
        return snapshot;
    }

    public UserIdentityProfile requireIdentityProfile(Long userId) {
        UserIdentityProfile profile = userIdentityProfileMapper.selectByUserId(userId);
        if (profile == null || StringUtils.isBlank(profile.getUserIdentityCode())) {
            throw new IllegalArgumentException("未找到用户主体身份信息");
        }
        return profile;
    }

    private void assertBuyerBalanceEnough(String userIdentityCode,
                                          BigDecimal amount,
                                          String accountMissingMessage,
                                          String insufficientMessage) {
        BigDecimal normalizedAmount = defaultAmount(amount);
        if (normalizedAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }
        if (StringUtils.isBlank(userIdentityCode)) {
            throw new IllegalArgumentException("买方主体身份信息缺失，无法校验账户余额");
        }

        FundAccountEntity buyerAccount = fundAccountMapper.selectByIdentityAndRole(userIdentityCode, ROLE_BUYER);
        if (buyerAccount == null) {
            throw new IllegalArgumentException(accountMissingMessage);
        }
        BigDecimal availableBalance = defaultAmount(buyerAccount.getAvailableBalance());
        if (availableBalance.compareTo(normalizedAmount) < 0) {
            throw new IllegalArgumentException(insufficientMessage);
        }
    }

    private UserIdentityProfile requireCurrentIdentityProfile() {
        User currentUser = tradingAuthorizationService.getCurrentUser();
        return requireIdentityProfile(currentUser.getId());
    }

    private void ensureOrderIdentitySnapshot(TradeOrderEntity order, Date now) {
        boolean changed = false;

        if (StringUtils.isBlank(order.getBuyerUserIdentityCode()) || StringUtils.isBlank(order.getBuyerSubjectName())) {
            UserIdentityProfile buyerIdentity = requireIdentityProfile(order.getBuyerId());
            if (StringUtils.isBlank(order.getBuyerUserIdentityCode())) {
                order.setBuyerUserIdentityCode(StringUtils.trimToNull(buyerIdentity.getUserIdentityCode()));
                changed = true;
            }
            if (StringUtils.isBlank(order.getBuyerSubjectName())) {
                order.setBuyerSubjectName(StringUtils.trimToNull(buyerIdentity.getSubjectName()));
                changed = true;
            }
        }

        if (StringUtils.isBlank(order.getSellerUserIdentityCode()) || StringUtils.isBlank(order.getSellerSubjectName())) {
            UserIdentityProfile sellerIdentity = requireIdentityProfile(order.getSellerId());
            if (StringUtils.isBlank(order.getSellerUserIdentityCode())) {
                order.setSellerUserIdentityCode(StringUtils.trimToNull(sellerIdentity.getUserIdentityCode()));
                changed = true;
            }
            if (StringUtils.isBlank(order.getSellerSubjectName())) {
                order.setSellerSubjectName(StringUtils.trimToNull(sellerIdentity.getSubjectName()));
                changed = true;
            }
        }

        if (changed) {
            tradeOrderMapper.updateIdentitySnapshot(
                    order.getId(),
                    order.getBuyerUserIdentityCode(),
                    order.getBuyerSubjectName(),
                    order.getSellerUserIdentityCode(),
                    order.getSellerSubjectName(),
                    now
            );
        }
    }

    private FundAccountEntity requireOrCreateAccount(String userIdentityCode,
                                                     String subjectName,
                                                     String accountRole,
                                                     Date now) {
        FundAccountEntity account = fundAccountMapper.selectByIdentityAndRole(userIdentityCode, accountRole);
        if (account != null) {
            if (StringUtils.isNotBlank(subjectName) && !StringUtils.equals(subjectName, account.getSubjectName())) {
                account.setSubjectName(subjectName);
                account.setUpdatedAt(now);
                persistAccountSnapshot(account);
            }
            return account;
        }
        account = new FundAccountEntity();
        account.setId(generateId());
        account.setAccountNo(generateAccountNo(now));
        account.setUserIdentityCode(userIdentityCode);
        account.setSubjectName(subjectName);
        account.setAccountRole(accountRole);
        account.setAvailableBalance(BigDecimal.ZERO);
        account.setTotalRechargeAmount(BigDecimal.ZERO);
        account.setTotalDebitAmount(BigDecimal.ZERO);
        account.setTotalIncomeAmount(BigDecimal.ZERO);
        account.setStatus(STATUS_ACTIVE);
        account.setCreatedAt(now);
        account.setUpdatedAt(now);
        fundAccountMapper.insert(account);
        return account;
    }

    private FundAccountEntity requireAccount(String userIdentityCode, String accountRole) {
        FundAccountEntity account = fundAccountMapper.selectByIdentityAndRole(userIdentityCode, accountRole);
        if (account == null) {
            throw new IllegalArgumentException("资金账户不存在");
        }
        return account;
    }

    private FundAccountFlowEntity requireFlow(Long flowId) {
        FundAccountFlowEntity flow = fundAccountFlowMapper.selectById(flowId);
        if (flow == null) {
            throw new IllegalArgumentException("资金流水不存在");
        }
        return flow;
    }

    private void ensureNotVoided(Long flowId) {
        if (fundAccountFlowMapper.countByRelatedFlowId(flowId) > 0) {
            throw new IllegalArgumentException("该流水已经作废，不能重复操作");
        }
    }

    private void persistAccountSnapshot(FundAccountEntity account) {
        fundAccountMapper.updateBalanceSnapshot(
                account.getId(),
                account.getSubjectName(),
                account.getStatus(),
                defaultAmount(account.getAvailableBalance()),
                defaultAmount(account.getTotalRechargeAmount()),
                defaultAmount(account.getTotalDebitAmount()),
                defaultAmount(account.getTotalIncomeAmount()),
                account.getUpdatedAt()
        );
    }

    private FundSubjectQueryRequest normalizeSubjectQuery(FundSubjectQueryRequest request) {
        FundSubjectQueryRequest normalized = request == null ? new FundSubjectQueryRequest() : request;
        if (normalized.getPageNum() == null || normalized.getPageNum() < 1) {
            normalized.setPageNum(1);
        }
        if (normalized.getPageSize() == null || normalized.getPageSize() < 1) {
            normalized.setPageSize(20);
        }
        if (normalized.getPageSize() > 50) {
            normalized.setPageSize(50);
        }
        return normalized;
    }

    private FundAccountQueryRequest normalizeAccountQuery(FundAccountQueryRequest request) {
        FundAccountQueryRequest normalized = request == null ? new FundAccountQueryRequest() : request;
        if (normalized.getPageNum() == null || normalized.getPageNum() < 1) {
            normalized.setPageNum(1);
        }
        if (normalized.getPageSize() == null || normalized.getPageSize() < 1) {
            normalized.setPageSize(10);
        }
        if (normalized.getPageSize() > 50) {
            normalized.setPageSize(50);
        }
        return normalized;
    }

    private FundFlowQueryRequest normalizeFlowQuery(FundFlowQueryRequest request) {
        FundFlowQueryRequest normalized = request == null ? new FundFlowQueryRequest() : request;
        if (normalized.getPageNum() == null || normalized.getPageNum() < 1) {
            normalized.setPageNum(1);
        }
        if (normalized.getPageSize() == null || normalized.getPageSize() < 1) {
            normalized.setPageSize(10);
        }
        if (normalized.getPageSize() > 100) {
            normalized.setPageSize(100);
        }
        return normalized;
    }

    private int calculateOffset(int pageNum, int pageSize) {
        return (pageNum - 1) * pageSize;
    }

    private int calculatePageCount(int total, int pageSize) {
        if (total <= 0) {
            return 0;
        }
        return (total + pageSize - 1) / pageSize;
    }

    private BigDecimal defaultAmount(BigDecimal amount) {
        return amount == null ? BigDecimal.ZERO : amount;
    }

    private BigDecimal normalizePositiveAmount(BigDecimal amount, String message) {
        BigDecimal normalized = amount == null ? BigDecimal.ZERO : amount;
        if (normalized.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(message);
        }
        return normalized;
    }

    private BigDecimal resolvePayableAmount(TradeOrderEntity order) {
        if (order.getActualAmount() != null && order.getActualAmount().compareTo(BigDecimal.ZERO) > 0) {
            return order.getActualAmount();
        }
        if (order.getEstimatedAmount() != null && order.getEstimatedAmount().compareTo(BigDecimal.ZERO) >= 0) {
            return order.getEstimatedAmount();
        }
        BigDecimal calculatedByUnitPrice = calculateOrderAmount(order.getUnitPrice(), order.getQuantity());
        if (calculatedByUnitPrice != null && calculatedByUnitPrice.compareTo(BigDecimal.ZERO) >= 0) {
            return calculatedByUnitPrice;
        }
        if (order.getQuotedPrice() != null && order.getQuotedPrice().compareTo(BigDecimal.ZERO) >= 0) {
            return calculateOrderAmount(order.getQuotedPrice(), order.getQuantity());
        }
        return BigDecimal.ZERO;
    }

    private BigDecimal calculateOrderAmount(BigDecimal unitPrice, Integer quantity) {
        if (unitPrice == null) {
            return null;
        }
        return unitPrice.multiply(BigDecimal.valueOf(normalizeQuantity(quantity)));
    }

    private int normalizeQuantity(Integer quantity) {
        return quantity == null || quantity < 1 ? 1 : quantity;
    }

    private String resolveOperatorName(User currentUser) {
        return StringUtils.defaultIfBlank(currentUser.getDisplayName(), currentUser.getUsername());
    }

    private String generateId() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    private String generateAccountNo(Date now) {
        String prefix = "FA-" + new SimpleDateFormat("yyyyMMdd").format(now) + "-";
        return prefix + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
    }

    private String generateFlowNo(Date now) {
        String prefix = "FF-" + new SimpleDateFormat("yyyyMMddHHmmss").format(now) + "-";
        return prefix + UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
    }
}
