package com.zhzj.trading.model.tradeorder;

import lombok.Data;

import java.util.Date;

/**
 * Order status log item.
 *
 * @author Connector Team
 * @since 2026-05-24
 */
@Data
public class OrderStatusLogItem {

    private String fromStatus;

    private String toStatus;

    private Long operatorId;

    private String operatorName;

    private String reason;

    private Date createdAt;
}
