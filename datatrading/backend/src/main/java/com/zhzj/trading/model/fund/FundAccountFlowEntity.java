package com.zhzj.trading.model.fund;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
public class FundAccountFlowEntity {

    private Long id;

    private String flowNo;

    private String userIdentityCode;

    private String subjectName;

    private String accountRole;

    private String flowType;

    private BigDecimal amount;

    private BigDecimal beforeBalance;

    private BigDecimal afterBalance;

    private String orderId;

    private String orderNo;

    private Long relatedFlowId;

    private String attachmentUrl;

    private String remark;

    private Long operatorId;

    private String operatorName;

    private Date createdAt;
}
