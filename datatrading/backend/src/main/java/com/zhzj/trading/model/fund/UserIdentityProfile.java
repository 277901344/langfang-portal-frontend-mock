package com.zhzj.trading.model.fund;

import lombok.Data;

@Data
public class UserIdentityProfile {

    private Long userId;

    private Long resolvedUserId;

    private String userIdentityCode;

    private String subjectName;
}
