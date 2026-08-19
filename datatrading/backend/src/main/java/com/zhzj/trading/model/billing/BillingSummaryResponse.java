package com.zhzj.trading.model.billing;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
public class BillingSummaryResponse {

    private Integer totalOrderCount;

    private BigDecimal totalUsageValue;

    private BigDecimal totalBillableUsage;

    private BigDecimal totalAmount;

    private Date latestRecordedAt;
}
