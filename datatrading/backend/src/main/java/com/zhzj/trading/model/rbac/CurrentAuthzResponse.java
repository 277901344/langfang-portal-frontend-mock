package com.zhzj.trading.model.rbac;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

/**
 * 当前用户权限响应。
 *
 * @author Connector Team
 * @since 2026-05-21
 */
@Data
public class CurrentAuthzResponse implements Serializable {

    private static final long serialVersionUID = 1L;

    private List<String> permissions;
    private List<String> roleCodes;
    private List<MenuModule> menuModules;
    private Integer accountType;
    private String userIdentityCode;
    private String subjectName;
}
