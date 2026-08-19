package com.zhzj.trading.model.fund;

import lombok.Data;

import java.util.List;

@Data
public class FundSubjectListResponse {

    private List<FundSubjectOption> data;

    private int dataCount;

    private int pageCount;
}
