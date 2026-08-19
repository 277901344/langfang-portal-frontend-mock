package com.zhzj.trading.model.billing;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
public class UsageRecordEntity {

    private Long id;

    private String contractId;

    private String orderId;

    private String transferId;

    private Long consumerId;

    private String consumerUserIdentityCode;

    private Long providerId;

    private String provideUserIdentityCode;

    private String usageType;

    private BigDecimal usageValue;

    private BigDecimal billableUsage;

    private BigDecimal amount;

    private String sourceType;

    private String sourceStatus;

    private Date recordedAt;

    private String rawPayload;
}
