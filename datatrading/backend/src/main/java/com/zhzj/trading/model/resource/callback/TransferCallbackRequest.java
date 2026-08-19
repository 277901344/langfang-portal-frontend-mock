package com.zhzj.trading.model.resource.callback;

import lombok.Data;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@Data
public class TransferCallbackRequest {

    @NotBlank(message = "transferId不能为空")
    private String transferId;

    @NotBlank(message = "contractId不能为空")
    private String contractId;

    @NotBlank(message = "orderId不能为空")
    private String orderId;

    @NotBlank(message = "commodityId不能为空")
    private String commodityId;

    @NotNull(message = "consumerId不能为空")
    private Long consumerId;

    @NotNull(message = "providerId不能为空")
    private Long providerId;

    @NotBlank(message = "usageType不能为空")
    private String usageType;

    @NotNull(message = "usageValue不能为空")
    @DecimalMin(value = "0.0001", message = "usageValue必须大于0")
    private BigDecimal usageValue;

    @NotBlank(message = "transferTime不能为空")
    private String transferTime;
}
