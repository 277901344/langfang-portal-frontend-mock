package com.zhzj.trading.model.resource.fund;

import lombok.Data;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@Data
public class FundRechargeRequest {

    @NotBlank(message = "userIdentityCode不能为空")
    private String userIdentityCode;

    @NotBlank(message = "subjectName不能为空")
    private String subjectName;

    @NotNull(message = "amount不能为空")
    @DecimalMin(value = "0.01", message = "amount必须大于0")
    private BigDecimal amount;

    private String attachmentUrl;

    private String remark;
}
