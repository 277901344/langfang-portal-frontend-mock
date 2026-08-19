package com.zhzj.trading.model.tradeorder;

import lombok.Data;

import java.util.Date;

/**
 * Order status log entity.
 *
 * @author Connector Team
 * @since 2026-05-24
 */
@Data
public class OrderStatusLogEntity {

    private Long id;

    private String orderId;

    private String fromStatus;

    private String toStatus;

    private Long operatorId;

    private String operatorName;

    private String reason;

    private Date createdAt;
}
