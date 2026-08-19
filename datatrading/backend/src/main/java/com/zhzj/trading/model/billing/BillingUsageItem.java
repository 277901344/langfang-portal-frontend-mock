package com.zhzj.trading.model.billing;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
public class BillingUsageItem {

    private Long id;

    private String orderId;

    private String orderNo;

    private String contractId;

    private String commodityId;

    private String commodityName;

    private String connectorId;

    private String transferId;

    private String usageType;

    private BigDecimal usageValue;

    private BigDecimal billableUsage;

    private BigDecimal amount;

    private String sourceType;

    private String sourceStatus;

    private Date recordedAt;
}
