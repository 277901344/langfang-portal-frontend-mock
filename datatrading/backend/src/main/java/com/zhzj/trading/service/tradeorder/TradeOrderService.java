package com.zhzj.trading.service.tradeorder;

import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhzj.trading.dao.commodity.DataProductServiceDao;
import com.zhzj.trading.dao.demandcenter.DemandResponseMapper;
import com.zhzj.trading.dao.tradeorder.CommodityOrderSnapshotServiceDao;
import com.zhzj.trading.dao.tradeorder.OrderStatusLogMapper;
import com.zhzj.trading.dao.tradeorder.TradeOrderMapper;
import com.zhzj.trading.enums.CommodityTypeEnum;
import com.zhzj.trading.enums.TradeOrderStatusEnum;
import com.zhzj.trading.model.User;
import com.zhzj.trading.model.commodity.CommodityDetailResponse;
import com.zhzj.trading.model.commodity.CommodityProviderInfo;
import com.zhzj.trading.model.commodity.DataProduct;
import com.zhzj.trading.model.contract.UserContractItem;
import com.zhzj.trading.model.demandcenter.DemandEntity;
import com.zhzj.trading.model.demandcenter.DemandResponseEntity;
import com.zhzj.trading.model.fund.OrderPaymentSnapshot;
import com.zhzj.trading.model.fund.UserIdentityProfile;
import com.zhzj.trading.model.resource.tradeorder.TradeOrderListQueryRequest;
import com.zhzj.trading.model.tradeorder.CommodityOrderSnapshotEntity;
import com.zhzj.trading.model.tradeorder.OrderStatusLogEntity;
import com.zhzj.trading.model.tradeorder.OrderStatusLogItem;
import com.zhzj.trading.model.tradeorder.TradeOrderDetailResponse;
import com.zhzj.trading.model.tradeorder.TradeOrderEntity;
import com.zhzj.trading.model.tradeorder.TradeOrderListItem;
import com.zhzj.trading.model.tradeorder.TradeOrderListResponse;
import com.zhzj.trading.service.commodity.CommodityManagementService;
import com.zhzj.trading.service.contract.UserContractService;
import com.zhzj.trading.service.fund.FundAccountService;
import com.zhzj.trading.service.rbac.TradingAuthorizationService;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class TradeOrderService {

    private static final String PRICING_MODEL_FREE = "FREE";
    private static final String PRICING_MODEL_PER_CALL = "PER_CALL";
    private static final String PRICING_MODEL_MONTHLY = "MONTHLY";

    private final TradeOrderMapper tradeOrderMapper;
    private final DemandResponseMapper demandResponseMapper;
    private final CommodityOrderSnapshotServiceDao commodityOrderSnapshotServiceDao;
    private final OrderStatusLogMapper orderStatusLogMapper;
    private final TradingAuthorizationService tradingAuthorizationService;
    private final FundAccountService fundAccountService;
    private final CommodityManagementService commodityManagementService;
    private final DataProductServiceDao dataProductServiceDao;
    private final UserContractService userContractService;

    public TradeOrderService(TradeOrderMapper tradeOrderMapper,
                             DemandResponseMapper demandResponseMapper,
                             CommodityOrderSnapshotServiceDao commodityOrderSnapshotServiceDao,
                             OrderStatusLogMapper orderStatusLogMapper,
                             TradingAuthorizationService tradingAuthorizationService,
                             FundAccountService fundAccountService,
                             CommodityManagementService commodityManagementService,
                             DataProductServiceDao dataProductServiceDao,
                             UserContractService userContractService) {
        this.tradeOrderMapper = tradeOrderMapper;
        this.demandResponseMapper = demandResponseMapper;
        this.commodityOrderSnapshotServiceDao = commodityOrderSnapshotServiceDao;
        this.orderStatusLogMapper = orderStatusLogMapper;
        this.tradingAuthorizationService = tradingAuthorizationService;
        this.fundAccountService = fundAccountService;
        this.commodityManagementService = commodityManagementService;
        this.dataProductServiceDao = dataProductServiceDao;
        this.userContractService = userContractService;
    }

    @Transactional
    public TradeOrderEntity createOrderFromDemandAcceptance(DemandEntity demand, DemandResponseEntity response) {
        TradeOrderEntity existing = tradeOrderMapper.selectByResponseId(response.getId());
        if (existing != null) {
            return existing;
        }

        Date now = new Date();
        TradeOrderEntity entity = new TradeOrderEntity();
        entity.setId(generateId());
        entity.setOrderNo(generateOrderNo(now));
        entity.setOrderTitle(demand.getTitle());
        entity.setSourceType("DEMAND_ACCEPT");
        entity.setSourceId(response.getId());
        entity.setDemandId(demand.getId());
        entity.setDemandNo(demand.getDemandNo());
        entity.setResponseId(response.getId());
        entity.setCommodityId(null);
        entity.setProductId(StringUtils.trimToNull(response.getProductId()));
        entity.setVersionId(StringUtils.trimToNull(response.getVersionId()));
        entity.setCommodityName(null);
        entity.setCommodityType(CommodityTypeEnum.normalizeNullableCode(demand.getProductType()));
        entity.setDeliveryType(StringUtils.trimToNull(response.getDeliveryType()));
        entity.setBuyerId(demand.getPublisherId());
        entity.setBuyerName(demand.getPublisherName());
        entity.setSellerId(response.getResponderId());
        entity.setSellerName(response.getResponderName());
        fillIdentitySnapshot(entity);
        entity.setConnectorId(StringUtils.trimToNull(response.getConnectorId()));
        entity.setQuotedPrice(response.getQuotedPrice());
        entity.setPricingModel(StringUtils.trimToNull(response.getPricingModel()));
        entity.setUnitPrice(response.getQuotedPrice());
        entity.setQuantity(1);
        entity.setFreeQuota(BigDecimal.ZERO);
        entity.setEstimatedAmount(calculateOrderAmount(entity.getUnitPrice(), entity.getQuantity()));
        entity.setActualAmount(BigDecimal.ZERO);
        assertBuyerBalanceEnoughForEstimatedOrder(entity);
        entity.setStatus(TradeOrderStatusEnum.PENDING.name());
        entity.setPaymentStatus("UNPAID");
        entity.setPaidAmount(null);
        entity.setPaidAt(null);
        entity.setDebitFlowId(null);
        entity.setIncomeFlowId(null);
        entity.setRemark(buildRemark(response));
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);
        entity.setConfirmedAt(null);
        entity.setCompletedAt(null);
        entity.setDeleted(0);

        tradeOrderMapper.insert(entity);
        appendStatusLog(entity, null, TradeOrderStatusEnum.PENDING.name(), "Accepted demand response");
        return entity;
    }

    @Transactional
    public TradeOrderDetailResponse createOrderFromCommodityPurchase(String commodityId, Integer quantity) {
        String normalizedCommodityId = StringUtils.trimToNull(commodityId);
        if (normalizedCommodityId == null) {
            throw new IllegalArgumentException("商品ID不能为空");
        }
        User currentUser = tradingAuthorizationService.getCurrentUser();
        Long buyerId = currentUser.getId();
        if (buyerId == null) {
            throw new IllegalArgumentException("当前用户信息异常，请重新登录后再试");
        }

        CommodityDetailResponse commodity = commodityManagementService.getMarketCommodityDetail(normalizedCommodityId);
        if (buyerId.equals(commodity.getUserId())) {
            throw new IllegalArgumentException("不能购买自己发布的商品");
        }

        Date now = new Date();
        String pricingModel = normalizeCommodityPricingModel(commodity.getPricingModel());
        int normalizedQuantity = normalizePurchaseQuantity(quantity, pricingModel);
        BigDecimal unitPrice = resolveCommodityUnitPrice(commodity);
        BigDecimal estimatedAmount = unitPrice.multiply(BigDecimal.valueOf(normalizedQuantity));
        CommodityProviderInfo providerInfo = commodity.getProviderInfo();

        TradeOrderEntity entity = new TradeOrderEntity();
        entity.setId(generateId());
        entity.setOrderNo(generateOrderNo(now));
        entity.setOrderTitle(StringUtils.defaultIfBlank(commodity.getCommodityName(), "未命名商品"));
        entity.setSourceType("MARKETPLACE_QUICK_ORDER");
        entity.setSourceId(normalizedCommodityId);
        entity.setDemandId(null);
        entity.setDemandNo(null);
        entity.setResponseId(null);
        entity.setCommodityId(normalizedCommodityId);
        entity.setProductId(StringUtils.trimToNull(commodity.getProductId()));
        entity.setVersionId(StringUtils.trimToNull(commodity.getVersionId()));
        entity.setCommodityName(StringUtils.trimToNull(commodity.getCommodityName()));
        entity.setCommodityType(CommodityTypeEnum.labelOfCode(commodity.getCommodityType()));
        entity.setDeliveryType(resolveCommodityDeliveryType(commodity.getDeliveryMethod()));
        entity.setBuyerId(buyerId);
        entity.setBuyerName(resolveDisplayName(currentUser));
        entity.setSellerId(commodity.getUserId());
        entity.setSellerName(resolveProviderName(providerInfo, commodity.getUserId()));
        fillIdentitySnapshot(entity);
        entity.setConnectorId(StringUtils.trimToNull(commodity.getConnectorId()));
        entity.setQuotedPrice(unitPrice);
        entity.setPricingModel(pricingModel);
        entity.setUnitPrice(unitPrice);
        entity.setQuantity(normalizedQuantity);
        entity.setFreeQuota(BigDecimal.ZERO);
        entity.setEstimatedAmount(estimatedAmount);
        entity.setActualAmount(BigDecimal.ZERO);
        assertBuyerBalanceEnoughForEstimatedOrder(entity);
        entity.setStatus(TradeOrderStatusEnum.PENDING.name());
        entity.setPaymentStatus("UNPAID");
        entity.setPaidAmount(null);
        entity.setPaidAt(null);
        entity.setDebitFlowId(null);
        entity.setIncomeFlowId(null);
        entity.setRemark(null);
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);
        entity.setConfirmedAt(null);
        entity.setCompletedAt(null);
        entity.setDeleted(0);

        tradeOrderMapper.insert(entity);
        insertCommoditySnapshot(entity, commodity, normalizedQuantity, unitPrice, estimatedAmount, now);
        appendStatusLog(entity, null, TradeOrderStatusEnum.PENDING.name(), "Marketplace commodity purchase submitted");
        return getOrderDetail(entity.getId());
    }

    public TradeOrderListResponse listOrders(TradeOrderListQueryRequest request) {
        TradeOrderListQueryRequest normalized = normalizeQuery(request);
        User currentUser = tradingAuthorizationService.getCurrentUser();
        boolean isAdmin = isAdmin();
        int offset = (normalized.getPageNum() - 1) * normalized.getPageSize();

        int total = tradeOrderMapper.countList(normalized, currentUser.getId(), isAdmin);
        List<TradeOrderListItem> rows = tradeOrderMapper.selectList(
                normalized,
                currentUser.getId(),
                isAdmin,
                offset,
                normalized.getPageSize()
        );

        TradeOrderListResponse response = new TradeOrderListResponse();
        response.setData(rows);
        response.setDataCount(total);
        response.setPageCount(calculatePageCount(total, normalized.getPageSize()));
        return response;
    }

    public TradeOrderDetailResponse getOrderDetail(String orderId) {
        TradeOrderDetailResponse detail = tradeOrderMapper.selectDetailById(orderId);
        if (detail == null) {
            throw new IllegalArgumentException("订单不存在");
        }
        assertOrderVisible(detail);
        detail.setCanConfirm(canConfirm(detail));
        detail.setCanCancel(canCancel(detail));
        detail.setCanComplete(canComplete(detail));
        detail.setProviderInfo(commodityManagementService.buildTradeParticipantInfo(
                detail.getSellerId(),
                detail.getConnectorId(),
                null
        ));
        detail.setDemanderInfo(commodityManagementService.buildTradeParticipantInfo(
                detail.getBuyerId(),
                null,
                null
        ));
        fillCommodityProductIdentity(detail);
        List<OrderStatusLogItem> logs = orderStatusLogMapper.selectByOrderId(orderId);
        detail.setStatusLogs(logs);
        return detail;
    }

    public List<UserContractItem> listBindableContracts(String orderId) {
        TradeOrderEntity entity = requireOrderEntity(orderId);
        assertBuyerOrAdmin(entity.getBuyerId());

        OrderProductBinding productBinding = resolveOrderProductBinding(entity);
        if (productBinding == null || StringUtils.isBlank(productBinding.getProductId())) {
            return java.util.Collections.emptyList();
        }

        return userContractService.listVisibleContracts(productBinding.getProductId(), entity.getBuyerId());
    }

    @Transactional
    public void bindContract(String orderId, String contractId) {
        TradeOrderEntity entity = requireOrderEntity(orderId);
        assertOrderOperable(entity);

        if (!canBindContract(entity.getBuyerId(), entity.getStatus())) {
            throw new IllegalArgumentException("当前用户无权关联该订单合约");
        }

        String normalizedContractId = StringUtils.trimToNull(contractId);
        if (normalizedContractId == null) {
            throw new IllegalArgumentException("contractId不能为空");
        }
        if (StringUtils.equals(entity.getContractId(), normalizedContractId)) {
            return;
        }
        if (StringUtils.isNotBlank(entity.getContractId())) {
            throw new IllegalArgumentException("订单已绑定其他合约，当前一期不支持直接改绑");
        }

        OrderProductBinding productBinding = resolveOrderProductBinding(entity);
        if (productBinding == null || StringUtils.isBlank(productBinding.getProductId())) {
            throw new IllegalArgumentException("订单未关联产品，暂时无法绑定合约");
        }

        List<UserContractItem> contracts = userContractService.listVisibleContracts(
                productBinding.getProductId(),
                entity.getBuyerId()
        );
        boolean matched = contracts.stream()
                .anyMatch(item -> StringUtils.equals(item.getContractId(), normalizedContractId));
        if (!matched) {
            throw new IllegalArgumentException("所选合约与当前订单产品不匹配");
        }

        Date now = new Date();
        int updated = tradeOrderMapper.bindContractSnapshot(entity.getId(), normalizedContractId, now);
        if (updated <= 0) {
            throw new IllegalStateException("订单合约绑定失败，请刷新后重试");
        }
        entity.setContractId(normalizedContractId);
        entity.setUpdatedAt(now);
    }

    @Transactional
    public void confirmOrder(String orderId) {
        TradeOrderEntity entity = requireOrderEntity(orderId);
        assertOrderOperable(entity);
        if (!TradeOrderStatusEnum.PENDING.name().equals(entity.getStatus())) {
            throw new IllegalArgumentException("当前订单状态不支持确认");
        }
        if (!canConfirm(entity)) {
            throw new IllegalArgumentException("当前用户无权确认该订单");
        }

        Date now = new Date();
        Date fulfillmentExpireAt = resolveFulfillmentExpireAt(entity, now);
        int updated = tradeOrderMapper.updateStatusSnapshot(
                entity.getId(),
                entity.getStatus(),
                TradeOrderStatusEnum.CONFIRMED.name(),
                now,
                now,
                null,
                fulfillmentExpireAt,
                null
        );
        if (updated <= 0) {
            throw new IllegalStateException("订单状态更新失败，请刷新后重试");
        }
        entity.setStatus(TradeOrderStatusEnum.CONFIRMED.name());
        entity.setUpdatedAt(now);
        entity.setConfirmedAt(now);
        entity.setFulfillmentExpireAt(fulfillmentExpireAt);
        appendStatusLog(entity, TradeOrderStatusEnum.PENDING.name(), TradeOrderStatusEnum.CONFIRMED.name(), "Confirmed order");
    }

    @Transactional
    public void cancelOrder(String orderId) {
        TradeOrderEntity entity = requireOrderEntity(orderId);
        assertOrderOperable(entity);
        if (!Arrays.asList(TradeOrderStatusEnum.PENDING.name(), TradeOrderStatusEnum.CONFIRMED.name()).contains(entity.getStatus())) {
            throw new IllegalArgumentException("当前订单状态不支持取消");
        }
        if (!canCancel(entity)) {
            throw new IllegalArgumentException("当前用户无权取消该订单");
        }

        Date now = new Date();
        String fromStatus = entity.getStatus();
        int updated = tradeOrderMapper.updateStatusSnapshot(
                entity.getId(),
                fromStatus,
                TradeOrderStatusEnum.CANCELLED.name(),
                now,
                null,
                null,
                null,
                null
        );
        if (updated <= 0) {
            throw new IllegalStateException("订单状态更新失败，请刷新后重试");
        }
        entity.setStatus(TradeOrderStatusEnum.CANCELLED.name());
        entity.setUpdatedAt(now);
        appendStatusLog(entity, fromStatus, TradeOrderStatusEnum.CANCELLED.name(), "Cancelled order");
    }

    @Transactional
    public void completeOrder(String orderId) {
        TradeOrderEntity entity = requireOrderEntity(orderId);
        assertOrderOperable(entity);
        if (!TradeOrderStatusEnum.CONFIRMED.name().equals(entity.getStatus())) {
            throw new IllegalArgumentException("当前订单状态不支持完成");
        }
        if (!canComplete(entity)) {
            throw new IllegalArgumentException("当前用户无权完成该订单");
        }

        Date now = new Date();
        BigDecimal actualAmount = resolveCompletionAmount(entity);
        entity.setActualAmount(actualAmount);
        OrderPaymentSnapshot paymentSnapshot = fundAccountService.debitOnOrderCompleted(entity, now);
        int updated = tradeOrderMapper.updateCompletionSnapshot(
                entity.getId(),
                TradeOrderStatusEnum.CONFIRMED.name(),
                TradeOrderStatusEnum.COMPLETED.name(),
                now,
                now,
                actualAmount,
                paymentSnapshot.getPaymentStatus(),
                paymentSnapshot.getPaidAmount(),
                paymentSnapshot.getPaidAt(),
                paymentSnapshot.getDebitFlowId(),
                paymentSnapshot.getIncomeFlowId()
        );
        if (updated <= 0) {
            throw new IllegalStateException("订单状态更新失败，请刷新后重试");
        }
        entity.setStatus(TradeOrderStatusEnum.COMPLETED.name());
        entity.setUpdatedAt(now);
        entity.setCompletedAt(now);
        entity.setPaymentStatus(paymentSnapshot.getPaymentStatus());
        entity.setPaidAmount(paymentSnapshot.getPaidAmount());
        entity.setPaidAt(paymentSnapshot.getPaidAt());
        entity.setDebitFlowId(paymentSnapshot.getDebitFlowId());
        entity.setIncomeFlowId(paymentSnapshot.getIncomeFlowId());
        appendStatusLog(entity, TradeOrderStatusEnum.CONFIRMED.name(), TradeOrderStatusEnum.COMPLETED.name(), "Completed order");
    }

    private void appendStatusLog(TradeOrderEntity entity, String fromStatus, String toStatus, String reason) {
        User currentUser = tradingAuthorizationService.getCurrentUser();
        OrderStatusLogEntity log = new OrderStatusLogEntity();
        log.setOrderId(entity.getId());
        log.setFromStatus(fromStatus);
        log.setToStatus(toStatus);
        log.setOperatorId(currentUser.getId());
        log.setOperatorName(resolveDisplayName(currentUser));
        log.setReason(reason);
        log.setCreatedAt(new Date());
        orderStatusLogMapper.insert(log);
    }

    private void assertOrderVisible(TradeOrderDetailResponse detail) {
        if (isAdmin()) {
            return;
        }
        User currentUser = tradingAuthorizationService.getCurrentUser();
        Long currentUserId = currentUser.getId();
        if (currentUserId == null
                || (!currentUserId.equals(detail.getBuyerId()) && !currentUserId.equals(detail.getSellerId()))) {
            throw new IllegalArgumentException("无权查看该订单");
        }
    }

    private void assertOrderOperable(TradeOrderEntity entity) {
        if (isAdmin()) {
            return;
        }
        User currentUser = tradingAuthorizationService.getCurrentUser();
        Long currentUserId = currentUser.getId();
        if (currentUserId == null
                || (!currentUserId.equals(entity.getBuyerId()) && !currentUserId.equals(entity.getSellerId()))) {
            throw new IllegalArgumentException("无权操作该订单");
        }
    }

    private String buildRemark(DemandResponseEntity response) {
        return StringUtils.trimToNull(response.getProposal());
    }

    private int normalizePurchaseQuantity(Integer quantity, String pricingModel) {
        if (PRICING_MODEL_FREE.equals(pricingModel) || PRICING_MODEL_MONTHLY.equals(pricingModel)) {
            return 1;
        }
        if (quantity == null) {
            return 1;
        }
        if (quantity < 1 || quantity > 999) {
            throw new IllegalArgumentException("购买数量必须在1到999之间");
        }
        return quantity;
    }

    private BigDecimal resolveCommodityUnitPrice(CommodityDetailResponse commodity) {
        if (PRICING_MODEL_FREE.equals(normalizeCommodityPricingModel(commodity.getPricingModel()))) {
            return BigDecimal.ZERO;
        }
        BigDecimal price = commodity.getPrice() == null ? BigDecimal.ZERO : commodity.getPrice();
        BigDecimal discountPrice = commodity.getDiscountPrice();
        if (discountPrice != null && discountPrice.compareTo(BigDecimal.ZERO) >= 0 && discountPrice.compareTo(price) < 0) {
            return discountPrice;
        }
        return price;
    }

    private String normalizeCommodityPricingModel(String pricingModel) {
        String normalized = StringUtils.upperCase(StringUtils.trimToNull(pricingModel));
        if (normalized == null) {
            return PRICING_MODEL_FREE;
        }
        if (PRICING_MODEL_FREE.equals(normalized)
                || PRICING_MODEL_PER_CALL.equals(normalized)
                || PRICING_MODEL_MONTHLY.equals(normalized)) {
            return normalized;
        }
        throw new IllegalArgumentException("商品定价模式不合法");
    }

    private String resolveCommodityDeliveryType(Integer deliveryMethod) {
        if (Integer.valueOf(0).equals(deliveryMethod)) {
            return "OFFLINE";
        }
        if (Integer.valueOf(1).equals(deliveryMethod)) {
            return "ONLINE";
        }
        return null;
    }

    private String resolveProviderName(CommodityProviderInfo providerInfo, Long sellerId) {
        if (providerInfo == null) {
            return sellerId == null ? null : String.valueOf(sellerId);
        }
        return StringUtils.firstNonBlank(
                providerInfo.getSubjectName(),
                providerInfo.getDisplayName(),
                sellerId == null ? null : String.valueOf(sellerId)
        );
    }

    private void insertCommoditySnapshot(TradeOrderEntity order,
                                         CommodityDetailResponse commodity,
                                         Integer quantity,
                                         BigDecimal unitPrice,
                                         BigDecimal estimatedAmount,
                                         Date now) {
        CommodityOrderSnapshotEntity snapshot = new CommodityOrderSnapshotEntity();
        snapshot.setId(generateId());
        snapshot.setOrderId(order.getId());
        snapshot.setCommodityId(commodity.getCommodityId());
        snapshot.setCommoditySnapshot(JSONUtil.toJsonStr(buildCommoditySnapshot(order, commodity, quantity, unitPrice, estimatedAmount)));
        snapshot.setCreatedAt(now);
        commodityOrderSnapshotServiceDao.save(snapshot);
    }

    private Map<String, Object> buildCommoditySnapshot(TradeOrderEntity order,
                                                       CommodityDetailResponse commodity,
                                                       Integer quantity,
                                                       BigDecimal unitPrice,
                                                       BigDecimal estimatedAmount) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("orderId", order.getId());
        snapshot.put("orderNo", order.getOrderNo());
        snapshot.put("commodityId", commodity.getCommodityId());
        snapshot.put("commodityName", commodity.getCommodityName());
        snapshot.put("commodityType", order.getCommodityType());
        snapshot.put("description", commodity.getDescription());
        snapshot.put("coverImage", commodity.getCoverImage());
        snapshot.put("pricingModel", order.getPricingModel());
        snapshot.put("price", commodity.getPrice());
        snapshot.put("discount", commodity.getDiscount());
        snapshot.put("discountPrice", commodity.getDiscountPrice());
        snapshot.put("unitPrice", unitPrice);
        snapshot.put("quantity", quantity);
        snapshot.put("estimatedAmount", estimatedAmount);
        snapshot.put("deliveryMethod", commodity.getDeliveryMethod());
        snapshot.put("sellerId", commodity.getUserId());
        snapshot.put("sellerUserIdentityCode", commodity.getUserIdentityCode());
        snapshot.put("connectorId", commodity.getConnectorId());
        snapshot.put("productId", commodity.getProductId());
        snapshot.put("versionId", commodity.getVersionId());
        snapshot.put("providerInfo", commodity.getProviderInfo());
        return snapshot;
    }

    private void fillCommodityProductIdentity(TradeOrderDetailResponse detail) {
        OrderProductBinding productBinding = resolveOrderProductBinding(detail);
        if (productBinding == null) {
            return;
        }
        detail.setProductId(StringUtils.defaultIfBlank(detail.getProductId(), productBinding.getProductId()));
        detail.setVersionId(StringUtils.defaultIfBlank(detail.getVersionId(), productBinding.getVersionId()));
        DataProduct product = findProduct(detail.getProductId(), detail.getVersionId());
        if (product != null) {
            detail.setProductName(StringUtils.defaultIfBlank(detail.getProductName(), StringUtils.trimToNull(product.getProductName())));
        }
    }

    private DataProduct findProduct(String productId, String versionId) {
        String normalizedProductId = StringUtils.trimToNull(productId);
        if (normalizedProductId == null) {
            return null;
        }
        LambdaQueryWrapper<DataProduct> query = new LambdaQueryWrapper<DataProduct>()
                .eq(DataProduct::getDeleted, 0)
                .eq(DataProduct::getProductId, normalizedProductId);
        String normalizedVersionId = StringUtils.trimToNull(versionId);
        if (normalizedVersionId != null) {
            query.eq(DataProduct::getVersionId, normalizedVersionId);
        }
        query.orderByDesc(DataProduct::getUpdatedAt, DataProduct::getCreatedAt)
                .last("LIMIT 1");
        return dataProductServiceDao.getOne(query);
    }

    private void fillIdentitySnapshot(TradeOrderEntity entity) {
        UserIdentityProfile buyerIdentity = fundAccountService.requireIdentityProfile(entity.getBuyerId());
        entity.setBuyerUserIdentityCode(StringUtils.trimToNull(buyerIdentity.getUserIdentityCode()));
        entity.setBuyerSubjectName(StringUtils.trimToNull(buyerIdentity.getSubjectName()));

        UserIdentityProfile sellerIdentity = fundAccountService.requireIdentityProfile(entity.getSellerId());
        entity.setSellerUserIdentityCode(StringUtils.trimToNull(sellerIdentity.getUserIdentityCode()));
        entity.setSellerSubjectName(StringUtils.trimToNull(sellerIdentity.getSubjectName()));
    }

    private TradeOrderEntity requireOrderEntity(String orderId) {
        TradeOrderEntity entity = tradeOrderMapper.selectById(orderId);
        if (entity == null) {
            throw new IllegalArgumentException("订单不存在");
        }
        return entity;
    }

    private boolean canConfirm(TradeOrderDetailResponse detail) {
        return canConfirm(detail.getBuyerId(), detail.getStatus());
    }

    private boolean canConfirm(TradeOrderEntity entity) {
        return canConfirm(entity.getBuyerId(), entity.getStatus());
    }

    private boolean canConfirm(Long buyerId, String status) {
        if (!TradeOrderStatusEnum.PENDING.name().equals(status)) {
            return false;
        }
        if (!tradingAuthorizationService.getCurrentPermissionCodes().contains(TradingAuthorizationService.PERM_ORDER_CONFIRM)) {
            return false;
        }
        if (isAdmin()) {
            return true;
        }
        Long currentUserId = tradingAuthorizationService.getCurrentUser().getId();
        return currentUserId != null && currentUserId.equals(buyerId);
    }

    private boolean canCancel(TradeOrderDetailResponse detail) {
        return canCancel(detail.getBuyerId(), detail.getStatus());
    }

    private boolean canCancel(TradeOrderEntity entity) {
        return canCancel(entity.getBuyerId(), entity.getStatus());
    }

    private boolean canCancel(Long buyerId, String status) {
        if (!Arrays.asList(TradeOrderStatusEnum.PENDING.name(), TradeOrderStatusEnum.CONFIRMED.name()).contains(status)) {
            return false;
        }
        if (!tradingAuthorizationService.getCurrentPermissionCodes().contains(TradingAuthorizationService.PERM_ORDER_CANCEL)) {
            return false;
        }
        if (isAdmin()) {
            return true;
        }
        Long currentUserId = tradingAuthorizationService.getCurrentUser().getId();
        return currentUserId != null && currentUserId.equals(buyerId);
    }

    private boolean canComplete(TradeOrderDetailResponse detail) {
        return canComplete(detail.getBuyerId(), detail.getStatus());
    }

    private boolean canComplete(TradeOrderEntity entity) {
        return canComplete(entity.getBuyerId(), entity.getStatus());
    }

    private boolean canComplete(Long buyerId, String status) {
        if (!TradeOrderStatusEnum.CONFIRMED.name().equals(status)) {
            return false;
        }
        if (!tradingAuthorizationService.getCurrentPermissionCodes().contains(TradingAuthorizationService.PERM_ORDER_COMPLETE)) {
            return false;
        }
        if (isAdmin()) {
            return true;
        }
        Long currentUserId = tradingAuthorizationService.getCurrentUser().getId();
        return currentUserId != null && currentUserId.equals(buyerId);
    }

    private boolean canBindContract(Long buyerId, String status) {
        if (!Arrays.asList(TradeOrderStatusEnum.PENDING.name(), TradeOrderStatusEnum.CONFIRMED.name()).contains(status)) {
            return false;
        }
        if (!tradingAuthorizationService.getCurrentPermissionCodes().contains(TradingAuthorizationService.PERM_ORDER_UPDATE)) {
            return false;
        }
        if (isAdmin()) {
            return true;
        }
        Long currentUserId = tradingAuthorizationService.getCurrentUser().getId();
        return currentUserId != null && currentUserId.equals(buyerId);
    }

    private void assertBuyerOrAdmin(Long buyerId) {
        if (isAdmin()) {
            return;
        }
        Long currentUserId = tradingAuthorizationService.getCurrentUser().getId();
        if (currentUserId == null || !currentUserId.equals(buyerId)) {
            throw new IllegalArgumentException("当前用户无权操作该订单合约");
        }
    }

    private BigDecimal resolveCompletionAmount(TradeOrderEntity entity) {
        if (entity.getActualAmount() != null && entity.getActualAmount().compareTo(BigDecimal.ZERO) > 0) {
            return entity.getActualAmount();
        }
        if (entity.getEstimatedAmount() != null && entity.getEstimatedAmount().compareTo(BigDecimal.ZERO) > 0) {
            return entity.getEstimatedAmount();
        }
        BigDecimal calculatedByUnitPrice = calculateOrderAmount(entity.getUnitPrice(), entity.getQuantity());
        if (calculatedByUnitPrice != null && calculatedByUnitPrice.compareTo(BigDecimal.ZERO) > 0) {
            return calculatedByUnitPrice;
        }
        if (entity.getQuotedPrice() != null) {
            return calculateOrderAmount(entity.getQuotedPrice(), entity.getQuantity());
        }
        return BigDecimal.ZERO;
    }

    private Date resolveFulfillmentExpireAt(TradeOrderEntity entity, Date confirmedAt) {
        if (entity == null
                || !PRICING_MODEL_MONTHLY.equals(StringUtils.upperCase(StringUtils.trimToEmpty(entity.getPricingModel())))) {
            return null;
        }
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(confirmedAt == null ? new Date() : confirmedAt);
        calendar.add(Calendar.MONTH, 1);
        return calendar.getTime();
    }

    private void assertBuyerBalanceEnoughForEstimatedOrder(TradeOrderEntity entity) {
        if (!requiresOrderCreationBalanceCheck(entity)) {
            return;
        }
        fundAccountService.assertBuyerBalanceEnoughForOrderCreation(
                entity.getBuyerUserIdentityCode(),
                entity.getEstimatedAmount()
        );
    }

    private boolean requiresOrderCreationBalanceCheck(TradeOrderEntity entity) {
        if (entity == null || entity.getEstimatedAmount() == null || entity.getEstimatedAmount().compareTo(BigDecimal.ZERO) <= 0) {
            return false;
        }
        String pricingModel = StringUtils.upperCase(StringUtils.trimToEmpty(entity.getPricingModel()));
        return PRICING_MODEL_PER_CALL.equals(pricingModel) || PRICING_MODEL_MONTHLY.equals(pricingModel);
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

    private TradeOrderListQueryRequest normalizeQuery(TradeOrderListQueryRequest request) {
        TradeOrderListQueryRequest normalized = request == null ? new TradeOrderListQueryRequest() : request;
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

    private int calculatePageCount(int total, int pageSize) {
        if (total <= 0) {
            return 0;
        }
        return (total + pageSize - 1) / pageSize;
    }

    private boolean isAdmin() {
        List<String> roleCodes = tradingAuthorizationService.getCurrentRoleCodes();
        return roleCodes.contains("SUPER_ADMIN") || roleCodes.contains("ADMIN");
    }

    private OrderProductBinding resolveOrderProductBinding(TradeOrderEntity entity) {
        if (entity == null) {
            return null;
        }
        if (StringUtils.isNotBlank(entity.getProductId()) || StringUtils.isNotBlank(entity.getVersionId())) {
            return new OrderProductBinding(entity.getProductId(), entity.getVersionId());
        }
        return resolveOrderProductBinding(entity.getSourceType(), entity.getResponseId(), entity.getId());
    }

    private OrderProductBinding resolveOrderProductBinding(TradeOrderDetailResponse detail) {
        if (detail == null) {
            return null;
        }
        if (StringUtils.isNotBlank(detail.getProductId()) || StringUtils.isNotBlank(detail.getVersionId())) {
            return new OrderProductBinding(detail.getProductId(), detail.getVersionId());
        }
        return resolveOrderProductBinding(detail.getSourceType(), detail.getResponseId(), detail.getId());
    }

    private OrderProductBinding resolveOrderProductBinding(String sourceType, String responseId, String orderId) {
        if ("MARKETPLACE_QUICK_ORDER".equals(sourceType)) {
            return resolveMarketplaceOrderProductBinding(orderId);
        }
        if ("DEMAND_ACCEPT".equals(sourceType) && StringUtils.isNotBlank(responseId)) {
            DemandResponseEntity response = demandResponseMapper.selectById(responseId);
            if (response != null) {
                return new OrderProductBinding(response.getProductId(), response.getVersionId());
            }
        }
        return null;
    }

    private OrderProductBinding resolveMarketplaceOrderProductBinding(String orderId) {
        CommodityOrderSnapshotEntity snapshot = commodityOrderSnapshotServiceDao.getOne(
                new LambdaQueryWrapper<CommodityOrderSnapshotEntity>()
                        .eq(CommodityOrderSnapshotEntity::getOrderId, orderId)
                        .orderByDesc(CommodityOrderSnapshotEntity::getCreatedAt)
                        .last("limit 1")
        );
        if (snapshot == null || StringUtils.isBlank(snapshot.getCommoditySnapshot())) {
            return null;
        }
        try {
            JSONObject snapshotJson = JSONUtil.parseObj(snapshot.getCommoditySnapshot());
            return new OrderProductBinding(snapshotJson.getStr("productId"), snapshotJson.getStr("versionId"));
        } catch (RuntimeException ignored) {
            return null;
        }
    }

    private static class OrderProductBinding {

        private final String productId;
        private final String versionId;

        private OrderProductBinding(String productId, String versionId) {
            this.productId = StringUtils.trimToNull(productId);
            this.versionId = StringUtils.trimToNull(versionId);
        }

        public String getProductId() {
            return productId;
        }

        public String getVersionId() {
            return versionId;
        }
    }

    private String resolveDisplayName(User currentUser) {
        return StringUtils.defaultIfBlank(currentUser.getDisplayName(), currentUser.getUsername());
    }

    private String generateId() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    private String generateOrderNo(Date now) {
        String prefix = "TO-" + new SimpleDateFormat("yyyyMMdd").format(now) + "-";
        int seq = tradeOrderMapper.countByOrderNoPrefix(prefix) + 1;
        return prefix + String.format("%04d", seq);
    }
}
