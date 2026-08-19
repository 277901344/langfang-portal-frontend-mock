package com.zhzj.trading.service.billing;

import com.zhzj.trading.dao.billing.UsageRecordMapper;
import com.zhzj.trading.dao.tradeorder.TradeOrderMapper;
import com.zhzj.trading.model.User;
import com.zhzj.trading.model.billing.BillingOrderSummaryItem;
import com.zhzj.trading.model.billing.BillingOrderSummaryResponse;
import com.zhzj.trading.model.billing.BillingRefreshResponse;
import com.zhzj.trading.model.billing.BillingSummaryResponse;
import com.zhzj.trading.model.billing.BillingUsageListResponse;
import com.zhzj.trading.model.billing.BillingUsageStatisticsResponse;
import com.zhzj.trading.model.resource.billing.BillingDateRangeQueryRequest;
import com.zhzj.trading.model.resource.billing.BillingOrderSummaryQueryRequest;
import com.zhzj.trading.model.resource.billing.BillingRefreshRequest;
import com.zhzj.trading.model.resource.billing.BillingUsageListQueryRequest;
import com.zhzj.trading.model.tradeorder.TradeOrderDetailResponse;
import com.zhzj.trading.service.rbac.TradingAuthorizationService;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;

@Service
public class BillingService {

    private static final int DEFAULT_USAGE_PAGE_SIZE = 10;
    private static final int MAX_USAGE_PAGE_SIZE = 50;
    private static final int DEFAULT_ORDER_SUMMARY_LIMIT = 5;
    private static final int MAX_ORDER_SUMMARY_LIMIT = 20;

    private final UsageRecordMapper usageRecordMapper;
    private final TradeOrderMapper tradeOrderMapper;
    private final TradingAuthorizationService tradingAuthorizationService;

    public BillingService(UsageRecordMapper usageRecordMapper,
                          TradeOrderMapper tradeOrderMapper,
                          TradingAuthorizationService tradingAuthorizationService) {
        this.usageRecordMapper = usageRecordMapper;
        this.tradeOrderMapper = tradeOrderMapper;
        this.tradingAuthorizationService = tradingAuthorizationService;
    }

    public BillingSummaryResponse getSummary(BillingDateRangeQueryRequest request) {
        BillingDateRangeQueryRequest normalized = normalizeDateRange(request);
        User currentUser = tradingAuthorizationService.getCurrentUser();
        BillingSummaryResponse response = usageRecordMapper.selectSummary(normalized, currentUser.getId(), isAdmin());
        if (response == null) {
            response = new BillingSummaryResponse();
        }
        response.setTotalOrderCount(defaultInteger(response.getTotalOrderCount()));
        response.setTotalUsageValue(defaultAmount(response.getTotalUsageValue()));
        response.setTotalBillableUsage(defaultAmount(response.getTotalBillableUsage()));
        response.setTotalAmount(defaultAmount(response.getTotalAmount()));
        return response;
    }

    public BillingUsageStatisticsResponse getUsageStatistics(BillingDateRangeQueryRequest request) {
        BillingDateRangeQueryRequest normalized = normalizeDateRange(request);
        User currentUser = tradingAuthorizationService.getCurrentUser();
        BillingUsageStatisticsResponse response = new BillingUsageStatisticsResponse();
        response.setData(usageRecordMapper.selectStatistics(normalized, currentUser.getId(), isAdmin()));
        return response;
    }

    public BillingUsageListResponse listUsage(BillingUsageListQueryRequest request) {
        BillingUsageListQueryRequest normalized = normalizeUsageListQuery(request);
        User currentUser = tradingAuthorizationService.getCurrentUser();
        int total = usageRecordMapper.countUsageList(normalized, currentUser.getId(), isAdmin());
        List<com.zhzj.trading.model.billing.BillingUsageItem> rows = usageRecordMapper.selectUsageList(
                normalized,
                currentUser.getId(),
                isAdmin(),
                calculateOffset(normalized.getPageNum(), normalized.getPageSize()),
                normalized.getPageSize()
        );
        BillingUsageListResponse response = new BillingUsageListResponse();
        response.setData(rows);
        response.setDataCount(total);
        response.setPageCount(calculatePageCount(total, normalized.getPageSize()));
        return response;
    }

    public BillingOrderSummaryResponse listOrderSummaries(BillingOrderSummaryQueryRequest request) {
        BillingOrderSummaryQueryRequest normalized = normalizeOrderSummaryQuery(request);
        BillingOrderSummaryResponse response = new BillingOrderSummaryResponse();
        if (StringUtils.isNotBlank(normalized.getOrderId())) {
            response.setData(Collections.singletonList(buildOrderSummary(normalized.getOrderId(), normalized)));
            return response;
        }

        User currentUser = tradingAuthorizationService.getCurrentUser();
        List<BillingOrderSummaryItem> rows = usageRecordMapper.selectOrderSummaries(
                normalized,
                currentUser.getId(),
                isAdmin()
        );
        for (BillingOrderSummaryItem row : rows) {
            fillDerivedSummaryFields(row);
        }
        response.setData(rows);
        return response;
    }

    @Transactional
    public BillingRefreshResponse refresh(BillingRefreshRequest request) {
        BillingRefreshRequest normalized = request == null ? new BillingRefreshRequest() : request;
        BillingRefreshResponse response = new BillingRefreshResponse();
        Date now = new Date();

        if (StringUtils.isNotBlank(normalized.getOrderId())) {
            BillingOrderSummaryItem summary = buildOrderSummary(normalized.getOrderId(), new BillingOrderSummaryQueryRequest());
            if (summary.getLatestRecordedAt() != null) {
                tradeOrderMapper.updateMeteringSnapshot(summary.getOrderId(), defaultAmount(summary.getTotalAmount()), now);
                response.setRefreshedOrderCount(1);
                response.setRefreshedUsageCount(summary.getUsageCount() == null ? 0 : summary.getUsageCount().intValue());
                response.setLatestRecordedAt(summary.getLatestRecordedAt());
            } else {
                response.setRefreshedOrderCount(0);
                response.setRefreshedUsageCount(0);
                response.setLatestRecordedAt(null);
            }
            return response;
        }

        BillingOrderSummaryQueryRequest query = new BillingOrderSummaryQueryRequest();
        User currentUser = tradingAuthorizationService.getCurrentUser();
        List<BillingOrderSummaryItem> rows = usageRecordMapper.selectOrderSummaries(query, currentUser.getId(), isAdmin());
        int refreshedUsageCount = 0;
        Date latestRecordedAt = null;
        for (BillingOrderSummaryItem row : rows) {
            if (row == null || StringUtils.isBlank(row.getOrderId()) || row.getLatestRecordedAt() == null) {
                continue;
            }
            tradeOrderMapper.updateMeteringSnapshot(row.getOrderId(), defaultAmount(row.getTotalAmount()), now);
            refreshedUsageCount += row.getUsageCount() == null ? 0 : row.getUsageCount().intValue();
            if (latestRecordedAt == null || row.getLatestRecordedAt().after(latestRecordedAt)) {
                latestRecordedAt = row.getLatestRecordedAt();
            }
        }
        response.setRefreshedOrderCount(rows.size());
        response.setRefreshedUsageCount(refreshedUsageCount);
        response.setLatestRecordedAt(latestRecordedAt);
        return response;
    }

    private BillingOrderSummaryItem buildOrderSummary(String orderId, BillingOrderSummaryQueryRequest request) {
        TradeOrderDetailResponse order = tradeOrderMapper.selectDetailById(orderId);
        if (order == null) {
            throw new IllegalArgumentException("订单不存在");
        }
        assertOrderVisible(order);

        BillingOrderSummaryQueryRequest singleQuery = new BillingOrderSummaryQueryRequest();
        singleQuery.setOrderId(orderId);
        singleQuery.setStartDate(request.getStartDate());
        singleQuery.setEndDate(request.getEndDate());
        singleQuery.setStartAt(request.getStartAt());
        singleQuery.setEndAt(request.getEndAt());

        User currentUser = tradingAuthorizationService.getCurrentUser();
        List<BillingOrderSummaryItem> rows = usageRecordMapper.selectOrderSummaries(singleQuery, currentUser.getId(), isAdmin());
        BillingOrderSummaryItem item = rows.isEmpty() ? new BillingOrderSummaryItem() : rows.get(0);
        item.setOrderId(order.getId());
        item.setOrderNo(order.getOrderNo());
        item.setOrderTitle(order.getOrderTitle());
        item.setOrderStatus(order.getStatus());
        item.setContractId(StringUtils.defaultIfBlank(item.getContractId(), order.getContractId()));
        item.setConnectorId(StringUtils.defaultIfBlank(item.getConnectorId(), order.getConnectorId()));
        item.setCommodityId(StringUtils.defaultIfBlank(item.getCommodityId(), order.getCommodityId()));
        item.setCommodityName(StringUtils.defaultIfBlank(item.getCommodityName(), order.getCommodityName()));
        item.setUsageCount(item.getUsageCount() == null ? 0L : item.getUsageCount());
        item.setTotalUsageValue(defaultAmount(item.getTotalUsageValue()));
        item.setTotalBillableUsage(defaultAmount(item.getTotalBillableUsage()));
        item.setTotalAmount(defaultAmount(item.getTotalAmount()));
        fillDerivedSummaryFields(item);
        return item;
    }

    private void fillDerivedSummaryFields(BillingOrderSummaryItem item) {
        item.setUsageCount(item.getUsageCount() == null ? 0L : item.getUsageCount());
        item.setTotalUsageValue(defaultAmount(item.getTotalUsageValue()));
        item.setTotalBillableUsage(defaultAmount(item.getTotalBillableUsage()));
        item.setTotalAmount(defaultAmount(item.getTotalAmount()));
        item.setMeteringReady(StringUtils.isNotBlank(item.getContractId()) || StringUtils.isNotBlank(item.getConnectorId()));
    }

    private void assertOrderVisible(TradeOrderDetailResponse detail) {
        if (isAdmin()) {
            return;
        }
        User currentUser = tradingAuthorizationService.getCurrentUser();
        Long currentUserId = currentUser.getId();
        if (currentUserId == null
                || (!currentUserId.equals(detail.getBuyerId()) && !currentUserId.equals(detail.getSellerId()))) {
            throw new IllegalArgumentException("无权查看该订单的计量信息");
        }
    }

    private BillingDateRangeQueryRequest normalizeDateRange(BillingDateRangeQueryRequest request) {
        BillingDateRangeQueryRequest normalized = request == null ? new BillingDateRangeQueryRequest() : request;
        normalized.setStartAt(parseDateBoundary(normalized.getStartDate(), false));
        normalized.setEndAt(parseDateBoundary(normalized.getEndDate(), true));
        if (normalized.getStartAt() != null && normalized.getEndAt() != null
                && normalized.getStartAt().after(normalized.getEndAt())) {
            throw new IllegalArgumentException("开始日期不能晚于结束日期");
        }
        return normalized;
    }

    private BillingUsageListQueryRequest normalizeUsageListQuery(BillingUsageListQueryRequest request) {
        BillingUsageListQueryRequest normalized = request == null ? new BillingUsageListQueryRequest() : request;
        normalizeDateRange(normalized);
        if (normalized.getPageNum() == null || normalized.getPageNum() < 1) {
            normalized.setPageNum(1);
        }
        if (normalized.getPageSize() == null || normalized.getPageSize() < 1) {
            normalized.setPageSize(DEFAULT_USAGE_PAGE_SIZE);
        }
        if (normalized.getPageSize() > MAX_USAGE_PAGE_SIZE) {
            normalized.setPageSize(MAX_USAGE_PAGE_SIZE);
        }
        return normalized;
    }

    private BillingOrderSummaryQueryRequest normalizeOrderSummaryQuery(BillingOrderSummaryQueryRequest request) {
        BillingOrderSummaryQueryRequest normalized = request == null ? new BillingOrderSummaryQueryRequest() : request;
        normalizeDateRange(normalized);
        if (StringUtils.isBlank(normalized.getOrderId())) {
            if (normalized.getLimit() == null || normalized.getLimit() < 1) {
                normalized.setLimit(DEFAULT_ORDER_SUMMARY_LIMIT);
            }
            if (normalized.getLimit() > MAX_ORDER_SUMMARY_LIMIT) {
                normalized.setLimit(MAX_ORDER_SUMMARY_LIMIT);
            }
        }
        return normalized;
    }

    private Date parseDateBoundary(String value, boolean endOfDay) {
        if (StringUtils.isBlank(value)) {
            return null;
        }
        String normalized = StringUtils.trim(value) + (endOfDay ? " 23:59:59" : " 00:00:00");
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        format.setLenient(false);
        try {
            return format.parse(normalized);
        } catch (ParseException e) {
            throw new IllegalArgumentException("日期格式错误，请使用 yyyy-MM-dd");
        }
    }

    private int calculateOffset(Integer pageNum, Integer pageSize) {
        return (pageNum - 1) * pageSize;
    }

    private int calculatePageCount(int total, int pageSize) {
        if (total <= 0) {
            return 0;
        }
        return (total + pageSize - 1) / pageSize;
    }

    private BigDecimal defaultAmount(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private Integer defaultInteger(Integer value) {
        return value == null ? 0 : value;
    }

    private boolean isAdmin() {
        List<String> roleCodes = tradingAuthorizationService.getCurrentRoleCodes();
        return roleCodes.contains("SUPER_ADMIN") || roleCodes.contains("ADMIN");
    }
}
