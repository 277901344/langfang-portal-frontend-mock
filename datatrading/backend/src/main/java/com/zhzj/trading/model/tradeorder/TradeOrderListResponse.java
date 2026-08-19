package com.zhzj.trading.model.tradeorder;

import lombok.Data;

import java.util.List;

/**
 * Trade order list response.
 *
 * @author Connector Team
 * @since 2026-05-24
 */
@Data
public class TradeOrderListResponse {

    private List<TradeOrderListItem> data;

    private Integer dataCount;

    private Integer pageCount;
}
