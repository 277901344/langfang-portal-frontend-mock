package com.zhzj.trading.model.callback;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
public class TransferCallbackResponse {

    private String orderId;

    private String transferId;

    private Boolean inserted;

    private Boolean duplicate;

    private Long usageCount;

    private BigDecimal totalUsageValue;

    private BigDecimal totalBillableUsage;

    private BigDecimal totalAmount;

    private Date latestRecordedAt;
}
