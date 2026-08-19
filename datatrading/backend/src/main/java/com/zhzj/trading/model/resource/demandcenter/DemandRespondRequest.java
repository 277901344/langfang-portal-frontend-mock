package com.zhzj.trading.model.resource.demandcenter;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

/**
 * Request payload for responding to a demand.
 *
 * @author Connector Team
 * @since 2026-05-22
 */
@Data
public class DemandRespondRequest {

    private String productId;

    private String versionId;

    private String connectorId;

    @NotBlank(message = "响应方案不能为空")
    private String proposal;

    private BigDecimal quotedPrice;

    private String pricingModel;

    private String deliveryType;
}
