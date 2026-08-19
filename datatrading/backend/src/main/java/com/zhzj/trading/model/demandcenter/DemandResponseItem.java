package com.zhzj.trading.model.demandcenter;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

/**
 * Demand response item.
 *
 * @author Connector Team
 * @since 2026-05-22
 */
@Data
public class DemandResponseItem {

    private String id;

    private String demandId;

    private Long responderId;

    private String responderName;

    private String productId;

    private String versionId;

    private String connectorId;

    private String proposal;

    private BigDecimal quotedPrice;

    private String pricingModel;

    private String deliveryType;

    private String status;

    private String rejectReason;

    private Date createdAt;

    private Date updatedAt;

    private Boolean canAccept;

    private Boolean canReject;
}
