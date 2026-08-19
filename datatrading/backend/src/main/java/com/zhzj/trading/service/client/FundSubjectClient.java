package com.zhzj.trading.service.client;

import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.zhzj.trading.model.fund.FundSubjectOption;
import com.zhzj.trading.model.fund.FundSubjectListResponse;
import com.zhzj.trading.model.resource.fund.FundSubjectQueryRequest;
import org.apache.commons.lang3.StringUtils;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.session.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

@Component
public class FundSubjectClient {

    @Autowired
    @Qualifier("plainRestTemplate")
    private RestTemplate plainRestTemplate;

    @Autowired
    @Qualifier("loadBalancedRestTemplate")
    private RestTemplate loadBalancedRestTemplate;

    @Value("${trading.platform-auth.base-url:http://sp-service}")
    private String platformBaseUrl;

    @Value("${trading.fund.subject-list-path:/identity/subject/list}")
    private String subjectListPath;

    public FundSubjectListResponse listSubjects(FundSubjectQueryRequest request) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(resolveSubjectListUrl());
        if (StringUtils.isNotBlank(request.getKeyword())) {
            builder.queryParam("keyword", request.getKeyword());
        }
        builder.queryParam("pageNum", request.getPageNum() == null ? 1 : request.getPageNum());
        builder.queryParam("pageSize", request.getPageSize() == null ? 20 : request.getPageSize());

        JSONObject body = executeGet(builder.build().encode().toUri());
        JSONObject data = body.getJSONObject("data");
        FundSubjectListResponse response = new FundSubjectListResponse();
        if (data == null) {
            response.setData(new ArrayList<>());
            response.setDataCount(0);
            response.setPageCount(0);
            return response;
        }

        JSONArray records = data.getJSONArray("records");
        List<FundSubjectOption> items = new ArrayList<>();
        if (records != null) {
            for (int i = 0; i < records.size(); i++) {
                JSONObject item = records.getJSONObject(i);
                if (item == null) {
                    continue;
                }
                FundSubjectOption option = new FundSubjectOption();
                option.setId(StringUtils.trimToNull(item.getStr("id")));
                option.setSubjectName(StringUtils.trimToNull(item.getStr("subjectName")));
                option.setSubjectType(StringUtils.trimToNull(item.getStr("subjectType")));
                option.setAuthStatus(item.getInt("authStatus"));
                items.add(option);
            }
        }

        response.setData(items);
        response.setDataCount(data.getInt("total", items.size()));
        response.setPageCount(data.getInt("pages", 1));
        return response;
    }

    private JSONObject executeGet(URI uri) {
        HttpHeaders headers = new HttpHeaders();
        String sessionCookie = resolvePlatformSessionCookie();
        if (StringUtils.isNotBlank(sessionCookie)) {
            headers.add(HttpHeaders.COOKIE, sessionCookie);
        }

        ResponseEntity<String> response = resolveRestTemplate().exchange(
                uri,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                String.class
        );
        JSONObject body = JSONUtil.parseObj(response.getBody());
        Integer code = body.getInt("code");
        if (code == null || code != 10000) {
            throw new IllegalStateException(StringUtils.defaultIfBlank(body.getStr("message"), "主体列表查询失败"));
        }
        return body;
    }

    private RestTemplate resolveRestTemplate() {
        String normalizedBaseUrl = StringUtils.lowerCase(StringUtils.trimToEmpty(platformBaseUrl));
        if (normalizedBaseUrl.startsWith("http://127.0.0.1")
                || normalizedBaseUrl.startsWith("https://127.0.0.1")
                || normalizedBaseUrl.startsWith("http://localhost")
                || normalizedBaseUrl.startsWith("https://localhost")) {
            return plainRestTemplate;
        }
        return loadBalancedRestTemplate;
    }

    private String resolveSubjectListUrl() {
        return StringUtils.removeEnd(StringUtils.trimToEmpty(platformBaseUrl), "/")
                + StringUtils.prependIfMissing(StringUtils.trimToEmpty(subjectListPath), "/");
    }

    private String resolvePlatformSessionCookie() {
        Session session = SecurityUtils.getSubject().getSession(false);
        if (session == null) {
            return null;
        }
        Object sessionCookie = session.getAttribute("platformSessionCookie");
        return sessionCookie == null ? null : String.valueOf(sessionCookie);
    }
}
