package com.zhzj.trading.shiro.realm;

import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.zhzj.trading.dao.fund.UserIdentityProfileMapper;
import com.zhzj.trading.model.User;
import com.zhzj.trading.model.fund.UserIdentityProfile;
import com.zhzj.trading.model.resource.LoginRequest;
import com.zhzj.trading.service.client.PlatformAuthClient;
import com.zhzj.trading.service.rbac.TradingAuthorizationService;
import com.zhzj.trading.util.JWTUtil;
import org.apache.commons.lang3.StringUtils;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.AuthenticationInfo;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.authc.SimpleAuthenticationInfo;
import org.apache.shiro.authz.AuthorizationInfo;
import org.apache.shiro.authz.SimpleAuthorizationInfo;
import org.apache.shiro.realm.AuthorizingRealm;
import org.apache.shiro.subject.PrincipalCollection;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

/**
 * Trading 认证 Realm。
 *
 * @author Connector Team
 * @since 2026-05-21
 */
public class CustRelam extends AuthorizingRealm {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(CustRelam.class);

    @Autowired
    private PlatformAuthClient platformAuthClient;

    @Autowired
    private TradingAuthorizationService tradingAuthorizationService;

    @Autowired(required = false)
    private UserIdentityProfileMapper userIdentityProfileMapper;

    @Override
    protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection principals) {
        Object principal = principals.getPrimaryPrincipal();
        if (!(principal instanceof User)) {
            return null;
        }
        User user = (User) principal;
        List<String> roleCodes = tradingAuthorizationService.resolveRoleCodes(user);
        List<String> permissionCodes = tradingAuthorizationService.resolvePermissionCodes(roleCodes);

        SimpleAuthorizationInfo authorizationInfo = new SimpleAuthorizationInfo();
        authorizationInfo.addRoles(roleCodes);
        authorizationInfo.addStringPermissions(permissionCodes);
        return authorizationInfo;
    }

    @Override
    protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken token) throws AuthenticationException {
        String username = (String) token.getPrincipal();
        char[] password = (char[]) token.getCredentials();

        try {
            LoginRequest loginRequest = new LoginRequest();
            loginRequest.setUsername(username);
            loginRequest.setPassword(new String(password));
            loginRequest.setCaptcha(StringUtils.defaultString(
                    (String) SecurityUtils.getSubject().getSession().getAttribute("loginCaptcha")));
            loginRequest.setCaptchaId(StringUtils.defaultString(
                    (String) SecurityUtils.getSubject().getSession().getAttribute("loginCaptchaId")));

            PlatformAuthClient.PlatformLoginResponse platformLoginResponse = platformAuthClient.authenticate(loginRequest);
            JSONObject entries = platformLoginResponse.getBody();
            Integer responseCode = entries.getInt("code");
            if (responseCode == null || responseCode != 10000) {
                throw new AuthenticationException(resolveAuthenticationFailureMessage(responseCode, entries.getStr("message")));
            }

            JSONObject data = entries.getJSONObject("data");
            if (data == null) {
                throw new AuthenticationException("认证平台响应异常，请稍后重试");
            }

            User user = buildUser(data, username);
            enrichIdentityProfile(user);
            List<String> roleCodes = tradingAuthorizationService.resolveRoleCodes(user);

            jwtOption(user);
            SecurityUtils.getSubject().getSession().setAttribute("uname", user.getUsername());
            SecurityUtils.getSubject().getSession().setAttribute("userId", user.getId());
            SecurityUtils.getSubject().getSession().setAttribute("platformUserId", user.getId());
            SecurityUtils.getSubject().getSession().setAttribute("authStatus", user.getAuthStatus());
            SecurityUtils.getSubject().getSession().setAttribute("authType", user.getAuthType());
            SecurityUtils.getSubject().getSession().setAttribute("accountType", user.getAccountType());
            SecurityUtils.getSubject().getSession().setAttribute("ownerUserId", user.getOwnerUserId());
            SecurityUtils.getSubject().getSession().setAttribute("displayName", user.getDisplayName());
            SecurityUtils.getSubject().getSession().setAttribute("userIdentityCode", user.getUserIdentityCode());
            SecurityUtils.getSubject().getSession().setAttribute("subjectName", user.getSubjectName());
            SecurityUtils.getSubject().getSession().setAttribute("roleCodes", roleCodes);
            if (StringUtils.isNotBlank(platformLoginResponse.getSessionCookie())) {
                SecurityUtils.getSubject().getSession().setAttribute("platformSessionCookie", platformLoginResponse.getSessionCookie());
            }

            return new SimpleAuthenticationInfo(user, password, "");
        } catch (AuthenticationException e) {
            throw e;
        } catch (Exception e) {
            log.error("Trading 登录认证失败，username={}", username, e);
            throw new AuthenticationException(StringUtils.defaultIfBlank(e.getMessage(), "登录认证失败，请稍后重试"), e);
        }
    }

    private User buildUser(JSONObject data, String fallbackUsername) {
        User user = new User();
        user.setId(data.getLong("id", data.getLong("userId", 0L)));
        user.setUsername(StringUtils.defaultIfBlank(data.getStr("username"), fallbackUsername));
        user.setDisplayName(StringUtils.defaultIfBlank(data.getStr("displayName"), user.getUsername()));
        user.setAuthStatus(data.getInt("authStatus", 0));
        user.setAuthType(data.getInt("authType", 0));
        user.setAccountType(data.getInt("accountType", 0));
        user.setAccountRole(StringUtils.trimToNull(data.getStr("accountRole")));
        user.setAccountStatus(StringUtils.trimToNull(data.getStr("accountStatus")));
        user.setAvatarUrl(StringUtils.trimToNull(data.getStr("avatarUrl")));
        user.setOwnerUserId(data.getLong("ownerUserId"));
        user.setPassword(null);
        return user;
    }

    private void enrichIdentityProfile(User user) {
        if (user == null || user.getId() == null || user.getId() <= 0 || userIdentityProfileMapper == null) {
            return;
        }
        try {
            UserIdentityProfile profile = userIdentityProfileMapper.selectByUserId(user.getId());
            if (profile == null) {
                return;
            }
            user.setUserIdentityCode(StringUtils.trimToNull(profile.getUserIdentityCode()));
            user.setSubjectName(StringUtils.trimToNull(profile.getSubjectName()));
        } catch (Exception e) {
            log.warn("登录用户主体信息补充失败，userId={}", user.getId(), e);
        }
    }

    private String resolveAuthenticationFailureMessage(Integer responseCode, String responseMessage) {
        String trimmedMessage = StringUtils.trimToNull(responseMessage);
        if (trimmedMessage != null) {
            return trimmedMessage;
        }
        if (responseCode == null) {
            return "认证平台响应异常，请稍后重试";
        }
        if (responseCode == 12011 || responseCode == -99999) {
            return "登录已失效，请重新登录";
        }
        if (responseCode == 12010) {
            return "服务繁忙，请稍后重试";
        }
        return "认证平台登录失败，错误码：" + responseCode;
    }

    private void jwtOption(User userInfo) {
        userInfo.setPassword(null);
        userInfo.setUsername(userInfo.getUsername());
        JWTUtil.createResponseJWT(String.valueOf(userInfo.getId()), JSONUtil.toJsonStr(userInfo), 60 * 60);
    }
}
