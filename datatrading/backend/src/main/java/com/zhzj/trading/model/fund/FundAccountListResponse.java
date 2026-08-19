package com.zhzj.trading.model.fund;

import lombok.Data;

import java.util.List;

@Data
public class FundAccountListResponse {

    private List<FundAccountItem> data;

    private int dataCount;

    private int pageCount;
}
