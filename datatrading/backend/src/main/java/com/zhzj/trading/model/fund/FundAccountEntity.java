package com.zhzj.trading.model.fund;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
public class FundAccountEntity {

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

    private Date createdAt;

    private Date updatedAt;
}
