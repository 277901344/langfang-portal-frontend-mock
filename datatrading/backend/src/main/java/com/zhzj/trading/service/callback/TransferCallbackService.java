package com.zhzj.trading.service.callback;

import cn.hutool.json.JSONUtil;
import com.zhzj.trading.dao.billing.UsageRecordMapper;
import com.zhzj.trading.dao.tradeorder.TradeOrderMapper;
import com.zhzj.trading.enums.TradeOrderStatusEnum;
import com.zhzj.trading.model.billing.BillingOrderSummaryItem;
import com.zhzj.trading.model.billing.UsageRecordEntity;
import com.zhzj.trading.model.callback.TransferCallbackResponse;
import com.zhzj.trading.model.resource.billing.BillingOrderSummaryQueryRequest;
import com.zhzj.trading.model.resource.callback.TransferCallbackRequest;
import com.zhzj.trading.model.tradeorder.TradeOrderEntity;
import org.apache.commons.lang3.StringUtils;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

@Service
public class TransferCallbackService {

    private static final List<String> SUPPORTED_TIME_PATTERNS = Arrays.asList(
            "yyyy-MM-dd HH:mm:ss",
            "yyyy-MM-dd HH:mm",
            "yyyy-MM-dd'T'HH:mm:ss",
            "yyyy-MM-dd'T'HH:mm:ss.SSS"
    );

    private final UsageRecordMapper usageRecordMapper;
    private final TradeOrderMapper tradeOrderMapper;

    public TransferCallbackService(UsageRecordMapper usageRecordMapper,
                                   TradeOrderMapper tradeOrderMapper) {
        this.usageRecordMapper = usageRecordMapper;
        this.tradeOrderMapper = tradeOrderMapper;
    }

    @Transactional
    public TransferCallbackResponse recordTransfer(TransferCallbackRequest request) {
        TransferCallbackRequest normalized = normalizeRequest(request);
        UsageRecordEntity existing = usageRecordMapper.selectByOrderIdAndTransferId(
                normalized.getOrderId(),
                normalized.getTransferId()
        );
        if (existing != null) {
            return buildDuplicateResponse(normalized.getOrderId(), normalized.getTransferId());
        }

        TradeOrderEntity order = tradeOrderMapper.selectById(normalized.getOrderId());
        if (order == null) {
            throw new IllegalArgumentException("订单不存在");
        }
        validateOrder(order, normalized);

        Date now = new Date();
        bindContractIfNeeded(order, normalized.getContractId(), now);

        BillingOrderSummaryItem beforeSummary = resolveOrderSummary(order.getId());
        BigDecimal usageValue = normalizeUsageValue(normalized.getUsageValue());
        BigDecimal billableUsage = resolveBillableUsage(order, beforeSummary, usageValue);
        BigDecimal amount = resolveAmount(order, beforeSummary, billableUsage);

        UsageRecordEntity entity = new UsageRecordEntity();
        entity.setContractId(StringUtils.defaultIfBlank(order.getContractId(), normalized.getContractId()));
        entity.setOrderId(order.getId());
        entity.setTransferId(normalized.getTransferId());
        entity.setConsumerId(normalized.getConsumerId());
        entity.setConsumerUserIdentityCode(StringUtils.trimToNull(order.getBuyerUserIdentityCode()));
        entity.setProviderId(normalized.getProviderId());
        entity.setProvideUserIdentityCode(StringUtils.trimToNull(order.getSellerUserIdentityCode()));
        entity.setUsageType(normalized.getUsageType());
        entity.setUsageValue(usageValue);
        entity.setBillableUsage(billableUsage);
        entity.setAmount(amount);
        entity.setSourceType("CONNECTOR");
        entity.setSourceStatus("RECORDED");
        entity.setRecordedAt(parseTransferTime(normalized.getTransferTime()));
        entity.setRawPayload(JSONUtil.toJsonStr(normalized));

        try {
            usageRecordMapper.insert(entity);
        } catch (DuplicateKeyException e) {
            UsageRecordEntity duplicated = usageRecordMapper.selectByOrderIdAndTransferId(
                    normalized.getOrderId(),
                    normalized.getTransferId()
            );
            if (duplicated != null) {
                return buildDuplicateResponse(normalized.getOrderId(), normalized.getTransferId());
            }
            throw e;
        }

        BillingOrderSummaryItem refreshedSummary = resolveOrderSummary(order.getId());
        tradeOrderMapper.updateMeteringSnapshot(
                order.getId(),
                defaultAmount(refreshedSummary.getTotalAmount()),
                now
        );
        return buildInsertedResponse(order.getId(), normalized.getTransferId(), refreshedSummary);
    }

    private TransferCallbackRequest normalizeRequest(TransferCallbackRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("回调请求不能为空");
        }
        request.setTransferId(StringUtils.trimToNull(request.getTransferId()));
        request.setContractId(StringUtils.trimToNull(request.getContractId()));
        request.setOrderId(StringUtils.trimToNull(request.getOrderId()));
        request.setCommodityId(StringUtils.trimToNull(request.getCommodityId()));
        request.setUsageType(StringUtils.upperCase(StringUtils.trimToNull(request.getUsageType())));
        request.setTransferTime(StringUtils.trimToNull(request.getTransferTime()));
        return request;
    }

    private void validateOrder(TradeOrderEntity order, TransferCallbackRequest request) {
        if (!TradeOrderStatusEnum.CONFIRMED.name().equals(order.getStatus())) {
            throw new IllegalArgumentException("当前订单未处于履约中，不能写入计量记录");
        }
        if (StringUtils.isNotBlank(order.getContractId())
                && !StringUtils.equals(order.getContractId(), request.getContractId())) {
            throw new IllegalArgumentException("回调contractId与订单不一致");
        }
        if (StringUtils.isNotBlank(order.getCommodityId())
                && !StringUtils.equals(order.getCommodityId(), request.getCommodityId())) {
            throw new IllegalArgumentException("回调commodityId与订单不一致");
        }
        if (order.getBuyerId() != null && !order.getBuyerId().equals(request.getConsumerId())) {
            throw new IllegalArgumentException("回调consumerId与订单买方不一致");
        }
        if (order.getSellerId() != null && !order.getSellerId().equals(request.getProviderId())) {
            throw new IllegalArgumentException("回调providerId与订单卖方不一致");
        }
    }

    private void bindContractIfNeeded(TradeOrderEntity order, String contractId, Date now) {
        if (StringUtils.isBlank(contractId) || StringUtils.isNotBlank(order.getContractId())) {
            return;
        }
        tradeOrderMapper.updateContractBindingSnapshot(order.getId(), contractId, now);
        order.setContractId(contractId);
    }

    private BillingOrderSummaryItem resolveOrderSummary(String orderId) {
        BillingOrderSummaryQueryRequest query = new BillingOrderSummaryQueryRequest();
        query.setOrderId(orderId);
        List<BillingOrderSummaryItem> rows = usageRecordMapper.selectOrderSummaries(query, null, true);
        if (rows == null || rows.isEmpty()) {
            BillingOrderSummaryItem empty = new BillingOrderSummaryItem();
            empty.setOrderId(orderId);
            empty.setUsageCount(0L);
            empty.setTotalUsageValue(BigDecimal.ZERO);
            empty.setTotalBillableUsage(BigDecimal.ZERO);
            empty.setTotalAmount(BigDecimal.ZERO);
            return empty;
        }
        BillingOrderSummaryItem item = rows.get(0);
        item.setUsageCount(item.getUsageCount() == null ? 0L : item.getUsageCount());
        item.setTotalUsageValue(defaultAmount(item.getTotalUsageValue()));
        item.setTotalBillableUsage(defaultAmount(item.getTotalBillableUsage()));
        item.setTotalAmount(defaultAmount(item.getTotalAmount()));
        return item;
    }

    private BigDecimal resolveBillableUsage(TradeOrderEntity order,
                                            BillingOrderSummaryItem beforeSummary,
                                            BigDecimal usageValue) {
        String pricingModel = StringUtils.upperCase(StringUtils.trimToEmpty(order.getPricingModel()));
        if ("FREE".equals(pricingModel) || "MONTHLY".equals(pricingModel)) {
            return BigDecimal.ZERO.setScale(4, RoundingMode.HALF_UP);
        }

        BigDecimal freeQuota = normalizeUsageValue(order.getFreeQuota());
        BigDecimal previousUsage = defaultAmount(beforeSummary.getTotalUsageValue()).setScale(4, RoundingMode.HALF_UP);
        BigDecimal beforeBillable = previousUsage.subtract(freeQuota);
        if (beforeBillable.compareTo(BigDecimal.ZERO) < 0) {
            beforeBillable = BigDecimal.ZERO;
        }
        BigDecimal afterUsage = previousUsage.add(usageValue);
        BigDecimal afterBillable = afterUsage.subtract(freeQuota);
        if (afterBillable.compareTo(BigDecimal.ZERO) < 0) {
            afterBillable = BigDecimal.ZERO;
        }
        return afterBillable.subtract(beforeBillable).setScale(4, RoundingMode.HALF_UP);
    }

    private BigDecimal resolveAmount(TradeOrderEntity order,
                                     BillingOrderSummaryItem beforeSummary,
                                     BigDecimal billableUsage) {
        String pricingModel = StringUtils.upperCase(StringUtils.trimToEmpty(order.getPricingModel()));
        if ("FREE".equals(pricingModel)) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        if ("MONTHLY".equals(pricingModel) || "PER_CALL".equals(pricingModel)) {
            if (beforeSummary.getUsageCount() != null && beforeSummary.getUsageCount() > 0) {
                return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
            }
            return resolvePackageAmount(order);
        }

        BigDecimal unitPrice = order.getUnitPrice() != null ? order.getUnitPrice() : order.getQuotedPrice();
        if (unitPrice == null || billableUsage.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return unitPrice.multiply(billableUsage).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal resolvePackageAmount(TradeOrderEntity order) {
        if (order.getEstimatedAmount() != null && order.getEstimatedAmount().compareTo(BigDecimal.ZERO) > 0) {
            return order.getEstimatedAmount().setScale(2, RoundingMode.HALF_UP);
        }
        if (order.getUnitPrice() != null) {
            return order.getUnitPrice()
                    .multiply(BigDecimal.valueOf(normalizeQuantity(order.getQuantity())))
                    .setScale(2, RoundingMode.HALF_UP);
        }
        if (order.getQuotedPrice() != null) {
            return order.getQuotedPrice()
                    .multiply(BigDecimal.valueOf(normalizeQuantity(order.getQuantity())))
                    .setScale(2, RoundingMode.HALF_UP);
        }
        return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
    }

    private TransferCallbackResponse buildInsertedResponse(String orderId,
                                                           String transferId,
                                                           BillingOrderSummaryItem summary) {
        TransferCallbackResponse response = new TransferCallbackResponse();
        response.setOrderId(orderId);
        response.setTransferId(transferId);
        response.setInserted(Boolean.TRUE);
        response.setDuplicate(Boolean.FALSE);
        response.setUsageCount(summary.getUsageCount());
        response.setTotalUsageValue(defaultAmount(summary.getTotalUsageValue()));
        response.setTotalBillableUsage(defaultAmount(summary.getTotalBillableUsage()));
        response.setTotalAmount(defaultAmount(summary.getTotalAmount()));
        response.setLatestRecordedAt(summary.getLatestRecordedAt());
        return response;
    }

    private TransferCallbackResponse buildDuplicateResponse(String orderId, String transferId) {
        BillingOrderSummaryItem summary = resolveOrderSummary(orderId);
        TransferCallbackResponse response = new TransferCallbackResponse();
        response.setOrderId(orderId);
        response.setTransferId(transferId);
        response.setInserted(Boolean.FALSE);
        response.setDuplicate(Boolean.TRUE);
        response.setUsageCount(summary.getUsageCount());
        response.setTotalUsageValue(defaultAmount(summary.getTotalUsageValue()));
        response.setTotalBillableUsage(defaultAmount(summary.getTotalBillableUsage()));
        response.setTotalAmount(defaultAmount(summary.getTotalAmount()));
        response.setLatestRecordedAt(summary.getLatestRecordedAt());
        return response;
    }

    private Date parseTransferTime(String value) {
        for (String pattern : SUPPORTED_TIME_PATTERNS) {
            SimpleDateFormat format = new SimpleDateFormat(pattern);
            format.setLenient(false);
            try {
                return format.parse(value);
            } catch (ParseException ignored) {
                // try next format
            }
        }
        throw new IllegalArgumentException("transferTime格式错误，请使用 yyyy-MM-dd HH:mm:ss");
    }

    private BigDecimal normalizeUsageValue(BigDecimal value) {
        return value == null ? BigDecimal.ZERO.setScale(4, RoundingMode.HALF_UP) : value.setScale(4, RoundingMode.HALF_UP);
    }

    private BigDecimal defaultAmount(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private int normalizeQuantity(Integer quantity) {
        return quantity == null || quantity < 1 ? 1 : quantity;
    }
}
