package com.zhzj.trading.model.billing;

import lombok.Data;

import java.util.List;

@Data
public class BillingUsageListResponse {

    private List<BillingUsageItem> data;

    private int dataCount;

    private int pageCount;
}
