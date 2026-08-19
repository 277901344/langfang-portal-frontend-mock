package com.zhzj.trading.model.billing;

import lombok.Data;

import java.util.List;

@Data
public class BillingUsageStatisticsResponse {

    private List<BillingUsageStatisticPoint> data;
}
