package com.zhzj.trading.model.resource.tradeorder;

import lombok.Data;

/**
 * Trade order list query request.
 *
 * @author Connector Team
 * @since 2026-05-24
 */
@Data
public class TradeOrderListQueryRequest {

    private String keyword;

    private String status;

    private String sourceType;

    private String orderRole;

    private Integer pageNum;

    private Integer pageSize;
}
