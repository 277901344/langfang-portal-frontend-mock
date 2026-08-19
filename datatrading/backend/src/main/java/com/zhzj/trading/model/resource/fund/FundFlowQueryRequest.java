package com.zhzj.trading.model.resource.fund;

import lombok.Data;

@Data
public class FundFlowQueryRequest {

    private String keyword;

    private String flowType;

    private String accountRole;

    private Integer pageNum;

    private Integer pageSize;
}
