package com.zhzj.trading.model.fund;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class FundAccountItem {

    private String id;

    private String accountNo;

    private String userIdentityCode;

    private String subjectName;

    private String accountRole;

    private BigDecimal availableBalance;

    private BigDecimal totalRechargeAmount;

    private BigDecimal totalDebitAmount;

    private BigDecimal totalIncomeAmount;

    private String status;
}
