package com.zhzj.trading.model.fund;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
public class OrderPaymentSnapshot {

    private String paymentStatus;

    private BigDecimal paidAmount;

    private Date paidAt;

    private Long debitFlowId;

    private Long incomeFlowId;
}
