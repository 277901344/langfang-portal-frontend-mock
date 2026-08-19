package com.zhzj.trading.model.billing;

import lombok.Data;

import java.util.Date;

@Data
public class BillingRefreshResponse {

    private Integer refreshedOrderCount;

    private Integer refreshedUsageCount;

    private Date latestRecordedAt;
}
