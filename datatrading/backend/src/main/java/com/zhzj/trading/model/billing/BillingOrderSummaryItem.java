package com.zhzj.trading.model.billing;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
public class BillingOrderSummaryItem {

    private String orderId;

    private String orderNo;

    private String orderTitle;

    private String orderStatus;

    private String contractId;

    private String connectorId;

    private String commodityId;

    private String commodityName;

    private Long usageCount;

    private BigDecimal totalUsageValue;

    private BigDecimal totalBillableUsage;

    private BigDecimal totalAmount;

    private Date latestRecordedAt;

    private Boolean meteringReady;
}
