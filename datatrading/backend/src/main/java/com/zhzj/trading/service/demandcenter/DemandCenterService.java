package com.zhzj.trading.service.demandcenter;

import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.zhzj.trading.dao.demandcenter.DemandMapper;
import com.zhzj.trading.dao.demandcenter.DemandResponseMapper;
import com.zhzj.trading.enums.CommodityTypeEnum;
import com.zhzj.trading.enums.DemandResponseStatusEnum;
import com.zhzj.trading.enums.DemandStatusEnum;
import com.zhzj.trading.model.User;
import com.zhzj.trading.model.demandcenter.DemandDetailResponse;
import com.zhzj.trading.model.demandcenter.DemandEntity;
import com.zhzj.trading.model.demandcenter.DemandListItem;
import com.zhzj.trading.model.demandcenter.DemandListResponse;
import com.zhzj.trading.model.demandcenter.DemandResponseEntity;
import com.zhzj.trading.model.demandcenter.DemandResponseItem;
import com.zhzj.trading.model.resource.demandcenter.DemandAcceptResult;
import com.zhzj.trading.model.resource.demandcenter.DemandListQueryRequest;
import com.zhzj.trading.model.resource.demandcenter.DemandRespondRequest;
import com.zhzj.trading.model.resource.demandcenter.DemandResponseRejectRequest;
import com.zhzj.trading.model.resource.demandcenter.DemandSaveRequest;
import com.zhzj.trading.model.tradeorder.TradeOrderEntity;
import com.zhzj.trading.service.client.MarketplaceCatalogClient;
import com.zhzj.trading.service.rbac.TradingAuthorizationService;
import com.zhzj.trading.service.tradeorder.TradeOrderService;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Demand center service.
 *
 * @author Connector Team
 * @since 2026-05-22
 */
@Service
public class DemandCenterService {

    private static final ZoneId ZONE_ID = ZoneId.of("Asia/Shanghai");

    private static final List<String> PUBLIC_VISIBLE_STATUSES = Arrays.asList(
            DemandStatusEnum.PUBLISHED.name(),
            DemandStatusEnum.RESPONDED.name(),
            DemandStatusEnum.MATCHED.name()
    );

    private static final List<String> DEMAND_TYPE_FILTERS = Arrays.asList(
            "all",
            "responded",
            "my",
            "canRespond"
    );

    private final DemandMapper demandMapper;

    private final DemandResponseMapper demandResponseMapper;

    private final TradingAuthorizationService tradingAuthorizationService;

    private final TradeOrderService tradeOrderService;

    private final MarketplaceCatalogClient marketplaceCatalogClient;

    public DemandCenterService(DemandMapper demandMapper,
                               DemandResponseMapper demandResponseMapper,
                               TradingAuthorizationService tradingAuthorizationService,
                               TradeOrderService tradeOrderService,
                               MarketplaceCatalogClient marketplaceCatalogClient) {
        this.demandMapper = demandMapper;
        this.demandResponseMapper = demandResponseMapper;
        this.tradingAuthorizationService = tradingAuthorizationService;
        this.tradeOrderService = tradeOrderService;
        this.marketplaceCatalogClient = marketplaceCatalogClient;
    }

    public DemandDetailResponse createDemand(DemandSaveRequest request) {
        User currentUser = tradingAuthorizationService.getCurrentUser();
        Date now = new Date();

        DemandEntity entity = new DemandEntity();
        entity.setId(generateId());
        entity.setDemandNo(generateDemandNo(now));
        fillDemandFields(entity, request);
        entity.setStatus(DemandStatusEnum.DRAFT.name());
        entity.setPublisherId(currentUser.getId());
        entity.setPublisherName(resolveDisplayName(currentUser));
        entity.setResponseCount(0);
        entity.setViewCount(0);
        entity.setDeleted(0);
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);

        demandMapper.insert(entity);
        return getDemandDetail(entity.getId());
    }

    public DemandDetailResponse updateDemand(String demandId, DemandSaveRequest request) {
        DemandEntity demand = requireDemand(demandId);
        assertDemandOwnerOrAdmin(demand);
        assertEditableStatus(demand);

        fillDemandFields(demand, request);
        demand.setUpdatedAt(new Date());
        demandMapper.update(demand);
        return getDemandDetail(demandId);
    }

    public void publishDemand(String demandId) {
        DemandEntity demand = requireDemand(demandId);
        assertDemandOwnerOrAdmin(demand);
        if (!DemandStatusEnum.DRAFT.name().equals(demand.getStatus())) {
            throw new IllegalArgumentException("当前需求状态不允许发布");
        }

        Date now = new Date();
        demandMapper.updateStatus(
                demandId,
                DemandStatusEnum.PUBLISHED.name(),
                now,
                null,
                now
        );
    }

    public void closeDemand(String demandId) {
        DemandEntity demand = requireDemand(demandId);
        assertDemandOwnerOrAdmin(demand);
        if (DemandStatusEnum.CLOSED.name().equals(demand.getStatus())) {
            throw new IllegalArgumentException("需求已关闭");
        }
        if (DemandStatusEnum.EXPIRED.name().equals(demand.getStatus())) {
            throw new IllegalArgumentException("已过期需求不允许关闭");
        }

        Date now = new Date();
        demandMapper.updateStatus(
                demandId,
                DemandStatusEnum.CLOSED.name(),
                null,
                now,
                now
        );
    }

    public DemandListResponse listDemands(DemandListQueryRequest request) {
        DemandListQueryRequest normalized = normalizeQuery(request);
        User currentUser = tradingAuthorizationService.getCurrentUserOrNull();
        Long currentUserId = currentUser == null ? null : currentUser.getId();
        boolean isAdmin = isAdmin();
        int offset = (normalized.getPageNum() - 1) * normalized.getPageSize();

        int total = demandMapper.countList(
                normalized,
                currentUserId,
                isAdmin,
                PUBLIC_VISIBLE_STATUSES
        );
        List<DemandEntity> rows = demandMapper.selectList(
                normalized,
                currentUserId,
                isAdmin,
                PUBLIC_VISIBLE_STATUSES,
                offset,
                normalized.getPageSize()
        );

        DemandListResponse response = new DemandListResponse();
        response.setData(rows.stream().map(this::toDemandListItem).collect(Collectors.toList()));
        response.setDataCount(total);
        response.setPageCount(calculatePageCount(total, normalized.getPageSize()));
        return response;
    }

    public DemandDetailResponse getDemandDetail(String demandId) {
        DemandEntity demand = requireDemand(demandId);
        assertDemandVisible(demand);

        DemandDetailResponse response = new DemandDetailResponse();
        BeanUtils.copyProperties(toDemandListItem(demand), response);
        response.setMatchedResponseId(demand.getMatchedResponseId());
        response.setOrderId(demand.getOrderId());

        List<DemandResponseEntity> responseEntities = demandResponseMapper.selectByDemandId(demandId);
        response.setResponses(filterVisibleResponses(demand, responseEntities).stream()
                .map(item -> toDemandResponseItem(demand, item))
                .collect(Collectors.toList()));
        return response;
    }

    public DemandResponseItem respondDemand(String demandId, DemandRespondRequest request) {
        DemandEntity demand = requireDemand(demandId);
        assertDemandVisibleForResponse(demand);
        User currentUser = tradingAuthorizationService.getCurrentUser();
        validateRelatedProduct(request);

        if (currentUser.getId() != null && currentUser.getId().equals(demand.getPublisherId())) {
            throw new IllegalArgumentException("不能响应自己发布的需求");
        }
        if (demandResponseMapper.countByDemandIdAndResponderId(demandId, currentUser.getId()) > 0) {
            throw new IllegalArgumentException("当前用户已响应过该需求");
        }

        Date now = new Date();
        DemandResponseEntity entity = new DemandResponseEntity();
        entity.setId(generateId());
        entity.setDemandId(demandId);
        entity.setResponderId(currentUser.getId());
        entity.setResponderName(resolveDisplayName(currentUser));
        entity.setProductId(StringUtils.trimToNull(request.getProductId()));
        entity.setVersionId(StringUtils.trimToNull(request.getVersionId()));
        entity.setConnectorId(request.getConnectorId());
        entity.setProposal(request.getProposal());
        entity.setQuotedPrice(request.getQuotedPrice());
        entity.setPricingModel(request.getPricingModel());
        entity.setDeliveryType(request.getDeliveryType());
        entity.setStatus(DemandResponseStatusEnum.PENDING.name());
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);

        demandResponseMapper.insert(entity);
        demandMapper.incrementResponseCount(demandId, now);

        if (DemandStatusEnum.PUBLISHED.name().equals(demand.getStatus())) {
            demandMapper.updateStatus(
                    demandId,
                    DemandStatusEnum.RESPONDED.name(),
                    demand.getPublishedAt(),
                    demand.getClosedAt(),
                    now
            );
            demand.setStatus(DemandStatusEnum.RESPONDED.name());
        }

        return toDemandResponseItem(demand, entity);
    }

    private void validateRelatedProduct(DemandRespondRequest request) {
        String productId = StringUtils.trimToNull(request.getProductId());
        String versionId = StringUtils.trimToNull(request.getVersionId());
        if (productId == null && versionId == null) {
            return;
        }
        if (productId == null || versionId == null) {
            throw new IllegalArgumentException("关联产品必须同时保存 productId 和 versionId");
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public DemandAcceptResult acceptResponse(String responseId) {
        DemandResponseEntity response = requireResponse(responseId);
        DemandEntity demand = requireDemand(response.getDemandId());
        assertDemandOwnerOrAdmin(demand);

        if (!DemandResponseStatusEnum.PENDING.name().equals(response.getStatus())) {
            throw new IllegalArgumentException("当前响应状态不允许接受");
        }
        if (!DemandStatusEnum.PUBLISHED.name().equals(demand.getStatus())
                && !DemandStatusEnum.RESPONDED.name().equals(demand.getStatus())) {
            throw new IllegalArgumentException("当前需求状态不允许接受响应");
        }

        Date now = new Date();
        demandResponseMapper.updateStatus(
                responseId,
                DemandResponseStatusEnum.ACCEPTED.name(),
                null,
                now
        );
        demandResponseMapper.rejectOtherPending(
                demand.getId(),
                responseId,
                "已有其他响应被接受",
                now
        );

        TradeOrderEntity order = tradeOrderService.createOrderFromDemandAcceptance(demand, response);
        demandMapper.markMatched(
                demand.getId(),
                responseId,
                order.getId(),
                DemandStatusEnum.MATCHED.name(),
                now
        );

        DemandAcceptResult result = new DemandAcceptResult();
        result.setDemandId(demand.getId());
        result.setResponseId(response.getId());
        result.setOrderId(order.getId());
        result.setOrderNo(order.getOrderNo());
        return result;
    }

    public void rejectResponse(String responseId, DemandResponseRejectRequest request) {
        DemandResponseEntity response = requireResponse(responseId);
        DemandEntity demand = requireDemand(response.getDemandId());
        assertDemandOwnerOrAdmin(demand);

        if (!DemandResponseStatusEnum.PENDING.name().equals(response.getStatus())) {
            throw new IllegalArgumentException("当前响应状态不允许拒绝");
        }

        demandResponseMapper.updateStatus(
                responseId,
                DemandResponseStatusEnum.REJECTED.name(),
                request == null ? null : request.getRejectReason(),
                new Date()
        );
    }

    private void fillDemandFields(DemandEntity entity, DemandSaveRequest request) {
        entity.setTitle(StringUtils.trimToNull(request.getTitle()));
        entity.setDescription(StringUtils.trimToNull(request.getDescription()));
        entity.setTopicCategory(StringUtils.trimToNull(request.getTopicCategory()));
        entity.setApplicationCategory(StringUtils.trimToNull(request.getApplicationCategory()));
        entity.setProductType(CommodityTypeEnum.normalizeNullableCode(request.getProductType()));
        entity.setUpdateFrequency(StringUtils.trimToNull(request.getUpdateFrequency()));
        entity.setExpectedFieldsJson(toJson(request.getExpectedFields()));
        entity.setUsagePurpose(StringUtils.trimToNull(request.getUsagePurpose()));
        entity.setBudgetType(StringUtils.trimToNull(request.getBudgetType()));
        entity.setBudgetAmount(request.getBudgetAmount());
        entity.setExpectedDelivery(StringUtils.trimToNull(request.getExpectedDelivery()));
        entity.setDeadline(parseDeadline(request.getDeadline()));
    }

    private DemandListItem toDemandListItem(DemandEntity entity) {
        DemandListItem item = new DemandListItem();
        BeanUtils.copyProperties(entity, item);
        item.setExpectedFields(parseExpectedFields(entity.getExpectedFieldsJson()));

        User currentUser = tradingAuthorizationService.getCurrentUserOrNull();
        Long currentUserId = currentUser == null ? null : currentUser.getId();
        boolean ownDemand = currentUserId != null && currentUserId.equals(entity.getPublisherId());
        boolean admin = isAdmin();
        boolean hasResponded = hasRespondedToDemand(entity.getId(), currentUserId);

        item.setOwnDemand(ownDemand);
        item.setCanEdit(ownDemand && DemandStatusEnum.DRAFT.name().equals(entity.getStatus()));
        item.setCanClose((ownDemand || admin)
                && !DemandStatusEnum.CLOSED.name().equals(entity.getStatus())
                && !DemandStatusEnum.EXPIRED.name().equals(entity.getStatus()));
        item.setCanRespond(!ownDemand
                && !admin
                && !hasResponded
                && (DemandStatusEnum.PUBLISHED.name().equals(entity.getStatus())
                || DemandStatusEnum.RESPONDED.name().equals(entity.getStatus())));
        item.setCanReviewResponses(ownDemand || admin);
        return item;
    }

    private DemandResponseItem toDemandResponseItem(DemandEntity demand, DemandResponseEntity entity) {
        DemandResponseItem item = new DemandResponseItem();
        BeanUtils.copyProperties(entity, item);

        User currentUser = tradingAuthorizationService.getCurrentUserOrNull();
        Long currentUserId = currentUser == null ? null : currentUser.getId();
        boolean ownDemand = currentUserId != null && currentUserId.equals(demand.getPublisherId());
        boolean admin = isAdmin();
        boolean canReview = (ownDemand || admin) && DemandResponseStatusEnum.PENDING.name().equals(entity.getStatus());
        item.setCanAccept(canReview);
        item.setCanReject(canReview);
        return item;
    }

    private List<DemandResponseEntity> filterVisibleResponses(DemandEntity demand, List<DemandResponseEntity> responses) {
        if (responses == null || responses.isEmpty()) {
            return Collections.emptyList();
        }

        User currentUser = tradingAuthorizationService.getCurrentUserOrNull();
        Long currentUserId = currentUser == null ? null : currentUser.getId();
        boolean ownDemand = currentUserId != null && currentUserId.equals(demand.getPublisherId());
        if (ownDemand || isAdmin()) {
            return responses;
        }

        if (currentUserId == null) {
            return Collections.emptyList();
        }

        return responses.stream()
                .filter(item -> currentUserId.equals(item.getResponderId()))
                .collect(Collectors.toList());
    }

    private boolean hasRespondedToDemand(String demandId, Long userId) {
        if (StringUtils.isBlank(demandId) || userId == null) {
            return false;
        }
        return demandResponseMapper.countByDemandIdAndResponderId(demandId, userId) > 0;
    }

    private DemandEntity requireDemand(String demandId) {
        DemandEntity entity = demandMapper.selectById(demandId);
        if (entity == null || Integer.valueOf(1).equals(entity.getDeleted())) {
            throw new IllegalArgumentException("需求不存在");
        }
        return entity;
    }

    private DemandResponseEntity requireResponse(String responseId) {
        DemandResponseEntity entity = demandResponseMapper.selectById(responseId);
        if (entity == null) {
            throw new IllegalArgumentException("响应不存在");
        }
        return entity;
    }

    private void assertDemandOwnerOrAdmin(DemandEntity demand) {
        User currentUser = tradingAuthorizationService.getCurrentUser();
        if (isAdmin()) {
            return;
        }
        if (currentUser.getId() == null || !currentUser.getId().equals(demand.getPublisherId())) {
            throw new IllegalArgumentException("不能操作他人的需求");
        }
    }

    private void assertEditableStatus(DemandEntity demand) {
        if (!DemandStatusEnum.DRAFT.name().equals(demand.getStatus())) {
            throw new IllegalArgumentException("当前需求状态不允许编辑");
        }
    }

    private void assertDemandVisible(DemandEntity demand) {
        if (isAdmin()) {
            return;
        }
        User currentUser = tradingAuthorizationService.getCurrentUserOrNull();
        if (currentUser != null
                && currentUser.getId() != null
                && currentUser.getId().equals(demand.getPublisherId())) {
            return;
        }
        if (!PUBLIC_VISIBLE_STATUSES.contains(demand.getStatus())) {
            throw new IllegalArgumentException("当前需求不可查看");
        }
    }

    private void assertDemandVisibleForResponse(DemandEntity demand) {
        if (!DemandStatusEnum.PUBLISHED.name().equals(demand.getStatus())
                && !DemandStatusEnum.RESPONDED.name().equals(demand.getStatus())) {
            throw new IllegalArgumentException("当前需求不允许响应");
        }
    }

    private DemandListQueryRequest normalizeQuery(DemandListQueryRequest request) {
        DemandListQueryRequest normalized = request == null ? new DemandListQueryRequest() : request;
        normalized.setTopicCategory(StringUtils.trimToNull(normalized.getTopicCategory()));
        normalized.setTopicCategoryLabel(resolveTopicCategoryLabel(normalized.getTopicCategory()));
        normalized.setDemandType(normalizeDemandType(normalized.getDemandType()));
        if (StringUtils.isBlank(normalized.getScope())) {
            normalized.setScope("all");
        }
        if ("my".equals(normalized.getDemandType())) {
            normalized.setScope("my");
        }
        if (normalized.getPageNum() == null || normalized.getPageNum() < 1) {
            normalized.setPageNum(1);
        }
        if (normalized.getPageSize() == null || normalized.getPageSize() < 1) {
            normalized.setPageSize(10);
        }
        if (normalized.getPageSize() > 50) {
            normalized.setPageSize(50);
        }
        return normalized;
    }

    private String normalizeDemandType(String demandType) {
        String normalized = StringUtils.trimToNull(demandType);
        if (normalized == null || !DEMAND_TYPE_FILTERS.contains(normalized)) {
            return "all";
        }
        return normalized;
    }

    private String resolveTopicCategoryLabel(String topicCategory) {
        if (StringUtils.isBlank(topicCategory)) {
            return null;
        }

        try {
            return StringUtils.trimToNull(flattenTreeCategoryMap(marketplaceCatalogClient.getTopicCategories()).get(topicCategory));
        } catch (Exception ignore) {
            return null;
        }
    }

    private Map<String, String> flattenTreeCategoryMap(List<JSONObject> items) {
        Map<String, String> result = new LinkedHashMap<>();
        if (items == null) {
            return result;
        }

        for (JSONObject item : items) {
            walkTree(item, result);
        }
        return result;
    }

    private void walkTree(JSONObject item, Map<String, String> result) {
        if (item == null) {
            return;
        }

        String code = item.getStr("code");
        String name = item.getStr("name");
        if (StringUtils.isNotBlank(code) && StringUtils.isNotBlank(name)) {
            result.put(code, name);
        }

        Object childrenObj = item.get("children");
        if (childrenObj instanceof JSONArray) {
            JSONArray children = (JSONArray) childrenObj;
            for (int i = 0; i < children.size(); i++) {
                walkTree(children.getJSONObject(i), result);
            }
        }
    }

    private boolean isAdmin() {
        User currentUser = tradingAuthorizationService.getCurrentUserOrNull();
        if (currentUser == null) {
            return false;
        }
        List<String> roleCodes = tradingAuthorizationService.resolveRoleCodes(currentUser);
        return roleCodes.contains("SUPER_ADMIN") || roleCodes.contains("ADMIN");
    }

    private String resolveDisplayName(User currentUser) {
        return StringUtils.defaultIfBlank(currentUser.getDisplayName(), currentUser.getUsername());
    }

    private String generateId() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    private String generateDemandNo(Date now) {
        String prefix = "DM-" + new SimpleDateFormat("yyyyMMdd").format(now) + "-";
        int seq = demandMapper.countByDemandNoPrefix(prefix) + 1;
        return prefix + String.format("%04d", seq);
    }

    private String toJson(List<String> values) {
        if (values == null || values.isEmpty()) {
            return null;
        }
        return JSONUtil.toJsonStr(values);
    }

    private List<String> parseExpectedFields(String json) {
        if (StringUtils.isBlank(json)) {
            return Collections.emptyList();
        }
        try {
            return JSONUtil.parseArray(json).toList(String.class);
        } catch (Exception ignore) {
            return Collections.emptyList();
        }
    }

    private Date parseDeadline(String deadline) {
        if (StringUtils.isBlank(deadline)) {
            return null;
        }

        String trimmed = deadline.trim();
        try {
            LocalDate localDate = LocalDate.parse(trimmed, DateTimeFormatter.ISO_LOCAL_DATE);
            return Date.from(localDate.atStartOfDay(ZONE_ID).toInstant());
        } catch (DateTimeParseException ignore) {
            // Fall through to ISO date-time parsing.
        }

        try {
            OffsetDateTime offsetDateTime = OffsetDateTime.parse(trimmed);
            return Date.from(offsetDateTime.toInstant());
        } catch (DateTimeParseException ignore) {
            // Fall through to local date-time parsing.
        }

        try {
            LocalDateTime localDateTime = LocalDateTime.parse(trimmed, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            return Date.from(localDateTime.atZone(ZONE_ID).toInstant());
        } catch (DateTimeParseException ignore) {
            throw new IllegalArgumentException("截止日期格式不正确，请使用 YYYY-MM-DD");
        }
    }

    private int calculatePageCount(int total, int pageSize) {
        if (total <= 0) {
            return 0;
        }
        return (total + pageSize - 1) / pageSize;
    }
}
