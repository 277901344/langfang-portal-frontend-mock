package com.zhzj.trading.model.fund;

import lombok.Data;

import java.util.List;

@Data
public class FundFlowListResponse {

    private List<FundFlowItem> data;

    private int dataCount;

    private int pageCount;
}
