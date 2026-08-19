package com.zhzj.trading.model.billing;

import lombok.Data;

import java.util.List;

@Data
public class BillingOrderSummaryResponse {

    private List<BillingOrderSummaryItem> data;
}
