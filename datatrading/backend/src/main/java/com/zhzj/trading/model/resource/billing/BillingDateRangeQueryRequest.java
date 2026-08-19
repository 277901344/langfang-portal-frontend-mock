package com.zhzj.trading.model.resource.billing;

import lombok.Data;

import java.util.Date;

@Data
public class BillingDateRangeQueryRequest {

    private String startDate;

    private String endDate;

    private Date startAt;

    private Date endAt;
}
