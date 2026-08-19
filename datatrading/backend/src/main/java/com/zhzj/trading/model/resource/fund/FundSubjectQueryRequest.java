package com.zhzj.trading.model.resource.fund;

import lombok.Data;

@Data
public class FundSubjectQueryRequest {

    private String keyword;

    private Integer pageNum;

    private Integer pageSize;
}
