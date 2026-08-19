package com.zhzj.trading.model.resource.tradeorder;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;

/**
 * Request payload for manually binding an external contract to an order.
 *
 * @author Connector Team
 * @since 2026-05-27
 */
@Data
public class TradeOrderBindContractRequest {

    @NotBlank(message = "contractId不能为空")
    private String contractId;
}
