package com.zhzj.trading.shiro.filter;

import cn.hutool.json.JSONUtil;
import com.zhzj.trading.common.ResponseCode;
import com.zhzj.trading.common.Result;
import org.apache.shiro.subject.Subject;
import org.apache.shiro.web.filter.authz.PermissionsAuthorizationFilter;
import org.apache.shiro.web.util.WebUtils;
import org.springframework.util.StringUtils;

import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import java.io.IOException;

/**
 * Trading 权限过滤器。
 *
 * @author Connector Team
 * @since 2026-05-21
 */
public class MyPermsFilter extends PermissionsAuthorizationFilter {

    @Override
    protected boolean onAccessDenied(ServletRequest request, ServletResponse response) throws IOException {
        response.setContentType("application/Json");
        response.setCharacterEncoding("UTF-8");
        Subject subject = this.getSubject(request, response);
        if (subject.getPrincipal() == null) {
            response.getWriter().print(JSONUtil.toJsonStr(Result.fail(ResponseCode.LOGIN_COOKIE_EXPIRED)));
        } else {
            String unauthorizedUrl = this.getUnauthorizedUrl();
            if (StringUtils.hasText(unauthorizedUrl)) {
                WebUtils.issueRedirect(request, response, unauthorizedUrl);
            } else {
                response.getWriter().print(JSONUtil.toJsonStr(Result.fail(ResponseCode.ACCESS_DENIED)));
            }
        }
        return false;
    }
}
