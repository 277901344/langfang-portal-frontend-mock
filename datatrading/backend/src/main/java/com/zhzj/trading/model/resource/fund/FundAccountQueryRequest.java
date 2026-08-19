package com.zhzj.trading.model.resource.fund;

import lombok.Data;

@Data
public class FundAccountQueryRequest {

    private String keyword;

    private String accountRole;

    private Integer pageNum;

    private Integer pageSize;
}
