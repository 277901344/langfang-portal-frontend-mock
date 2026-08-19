package com.zhzj.trading.model.resource.billing;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class BillingUsageListQueryRequest extends BillingDateRangeQueryRequest {

    private String keyword;

    private String connectorId;

    private String usageType;

    private Integer pageNum;

    private Integer pageSize;
}
