package com.zhzj.trading.model.resource.billing;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class BillingOrderSummaryQueryRequest extends BillingDateRangeQueryRequest {

    private String orderId;

    private Integer limit;
}
