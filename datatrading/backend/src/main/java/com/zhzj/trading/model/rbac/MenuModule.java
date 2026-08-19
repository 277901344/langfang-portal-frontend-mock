package com.zhzj.trading.model.rbac;

import lombok.Data;

import java.io.Serializable;

/**
 * 当前菜单模块。
 *
 * @author Connector Team
 * @since 2026-05-21
 */
@Data
public class MenuModule implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private String moduleId;
    private String moduleName;
    private String parentModuleId;
    private String routePath;
    private Integer sortOrder;
    private String status;
    private Boolean isGoverned;
}
