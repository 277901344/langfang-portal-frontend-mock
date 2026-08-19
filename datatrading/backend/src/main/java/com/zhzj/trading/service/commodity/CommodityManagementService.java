package com.zhzj.trading.service.commodity;

import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhzj.trading.dao.commodity.CommodityStatusInfoServiceDao;
import com.zhzj.trading.dao.commodity.DataCommodityServiceDao;
import com.zhzj.trading.dao.commodity.DataProductCommodityRelServiceDao;
import com.zhzj.trading.dao.commodity.DataProductHistoryServiceDao;
import com.zhzj.trading.dao.commodity.DataProductServiceDao;
import com.zhzj.trading.dao.commodity.LegalOrgAuthInfoServiceDao;
import com.zhzj.trading.dao.commodity.LegalOrgOperatorInfoServiceDao;
import com.zhzj.trading.dao.commodity.SpConnectorServiceDao;
import com.zhzj.trading.dao.commodity.SpUserServiceDao;
import com.zhzj.trading.dao.commodity.UserRealAuthInfoServiceDao;
import com.zhzj.trading.enums.CommodityStatusEnum;
import com.zhzj.trading.enums.CommodityTypeEnum;
import com.zhzj.trading.model.User;
import com.zhzj.trading.model.commodity.CommodityDetailResponse;
import com.zhzj.trading.model.commodity.CommodityListItem;
import com.zhzj.trading.model.commodity.CommodityListResponse;
import com.zhzj.trading.model.commodity.CommodityProductItem;
import com.zhzj.trading.model.commodity.CommodityProductListResponse;
import com.zhzj.trading.model.commodity.CommodityProviderInfo;
import com.zhzj.trading.model.commodity.CommodityRequest;
import com.zhzj.trading.model.commodity.CommodityStatusInfoEntity;
import com.zhzj.trading.model.commodity.DataCommodityEntity;
import com.zhzj.trading.model.commodity.DataProduct;
import com.zhzj.trading.model.commodity.DataProductCommodityRelEntity;
import com.zhzj.trading.model.commodity.DataProductHistory;
import com.zhzj.trading.model.commodity.LegalOrgAuthInfo;
import com.zhzj.trading.model.commodity.LegalOrgOperatorInfo;
import com.zhzj.trading.model.commodity.SpConnector;
import com.zhzj.trading.model.commodity.UserRealAuthInfo;
import com.zhzj.trading.service.client.MarketplaceCatalogClient;
import com.zhzj.trading.service.rbac.TradingAuthorizationService;
import com.zhzj.trading.util.CommodityCodeUtil;
import com.zhzj.trading.util.ProductTypeSupport;
import com.zhzj.trading.util.UuidUtil;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Collections;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Commodity management service.
 *
 * @author Connector Team
 * @since 2026-05-25
 */
@Service
public class CommodityManagementService {

    private static final ZoneId ZONE_ID = ZoneId.of("Asia/Shanghai");

    private static final BigDecimal DEFAULT_DISCOUNT = new BigDecimal("100.00");
    private static final BigDecimal ONE_HUNDRED = new BigDecimal("100");
    private static final String PRODUCT_PUBLISH_STATUS_PUBLISHED = "published";
    private static final String PRICING_MODEL_FREE = "FREE";
    private static final String PRICING_MODEL_PER_CALL = "PER_CALL";
    private static final String PRICING_MODEL_MONTHLY = "MONTHLY";
    @Autowired
    private DataCommodityServiceDao dataCommodityServiceDao;

    @Autowired
    private DataProductServiceDao dataProductServiceDao;

    @Autowired
    private DataProductHistoryServiceDao dataProductHistoryServiceDao;

    @Autowired
    private DataProductCommodityRelServiceDao dataProductCommodityRelServiceDao;

    @Autowired
    private CommodityStatusInfoServiceDao commodityStatusInfoServiceDao;

    @Autowired
    private TradingAuthorizationService tradingAuthorizationService;

    @Autowired
    private SpUserServiceDao spUserServiceDao;

    @Autowired
    private UserRealAuthInfoServiceDao userRealAuthInfoServiceDao;

    @Autowired
    private LegalOrgAuthInfoServiceDao legalOrgAuthInfoServiceDao;

    @Autowired
    private LegalOrgOperatorInfoServiceDao legalOrgOperatorInfoServiceDao;

    @Autowired
    private SpConnectorServiceDao spConnectorServiceDao;

    @Autowired
    private MarketplaceCatalogClient marketplaceCatalogClient;

    public CommodityListResponse listCommodities(CommodityRequest request) {
        CommodityRequest normalized = normalizeListQuery(request);
        User currentUser = tradingAuthorizationService.getCurrentUser();
        boolean admin = isAdmin();
        IPage<CommodityListItem> page = dataCommodityServiceDao.pageCommodityList(
                new Page<>(normalized.getPageNum(), normalized.getPageSize()),
                normalized,
                currentUser.getId(),
                admin,
                canManageOwnCommodity(currentUser, admin)
        );

        CommodityListResponse response = new CommodityListResponse();
        response.setData(page.getRecords());
        response.setDataCount(Math.toIntExact(page.getTotal()));
        response.setPageCount(Math.toIntExact(page.getPages()));
        return response;
    }

    public CommodityDetailResponse getCommodityDetail(String commodityId) {
        DataCommodityEntity commodity = requireCommodity(commodityId);
        assertCommodityVisible(commodity);
        return buildCommodityDetail(commodity, isAdmin());
    }

    public CommodityListResponse listMarketCommodities(CommodityRequest request) {
        CommodityRequest normalized = request == null ? new CommodityRequest() : request;
        normalized.setMarketView(true);
        normalized.setStatus(null);
        CommodityRequest finalized = normalizeListQuery(normalized);
        IPage<CommodityListItem> page = dataCommodityServiceDao.pageCommodityList(
                new Page<>(finalized.getPageNum(), finalized.getPageSize()),
                finalized,
                null,
                false,
                false
        );

        CommodityListResponse response = new CommodityListResponse();
        response.setData(page.getRecords());
        response.setDataCount(Math.toIntExact(page.getTotal()));
        response.setPageCount(Math.toIntExact(page.getPages()));
        return response;
    }

    public CommodityDetailResponse getMarketCommodityDetail(String commodityId) {
        return buildMarketCommodityDetail(commodityId, true);
    }

    public CommodityDetailResponse getPublicMarketCommodityDetail(String commodityId) {
        return buildMarketCommodityDetail(commodityId, false);
    }

    public String getPublicMarketCommodityCover(String commodityId) {
        DataCommodityEntity commodity = requireMarketCommodity(commodityId);
        if (StringUtils.isBlank(commodity.getCoverImage())) {
            throw new IllegalArgumentException("商品封面不存在");
        }
        return commodity.getCoverImage();
    }

    public CommodityProviderInfo getMarketCommodityProviderInfo(String commodityId) {
        DataCommodityEntity commodity = requireMarketCommodity(commodityId);
        return resolveMarketCommodityProviderInfo(commodity);
    }

    private CommodityDetailResponse buildMarketCommodityDetail(String commodityId, boolean includeProviderInfo) {
        DataCommodityEntity commodity = requireMarketCommodity(commodityId);
        CommodityDetailResponse response = buildCommodityDetail(commodity, includeProviderInfo, true);
        response.setOfferPer(null);
        response.setBusinessPer(null);
        response.setStatusLogs(null);
        return response;
    }

    private DataCommodityEntity requireMarketCommodity(String commodityId) {
        DataCommodityEntity commodity = requireCommodity(commodityId);
        if (CommodityStatusEnum.PUBLISHED.getCode() != commodity.getStatus() || isExpired(commodity.getExpiredTime(), new Date())) {
            throw new IllegalArgumentException("商品未上架或已过期");
        }
        return commodity;
    }

    private CommodityProviderInfo resolveMarketCommodityProviderInfo(DataCommodityEntity commodity) {
        DataProductCommodityRelEntity relation = getRelationByCommodityId(commodity.getCommodityId());
        if (relation != null && StringUtils.isNotBlank(relation.getProductId())) {
            DataProductHistory productHistory = getProductHistoryByProductIdAndVersionId(
                    relation.getProductId(),
                    relation.getVersionId()
            );
            if (productHistory != null) {
                return buildTradeParticipantInfo(
                        productHistory.getUserId(),
                        productHistory.getConnectorId(),
                        productHistory.getConnectorName()
                );
            }
            DataProduct product = getPublishedProductByProductIdAndVersionId(
                    relation.getProductId(),
                    relation.getVersionId()
            );
            if (product != null) {
                return buildTradeParticipantInfo(
                        product.getUserId(),
                        product.getConnectorId(),
                        product.getConnectorName()
                );
            }
        }
        return buildTradeParticipantInfo(
                commodity.getUserId(),
                commodity.getConnectorId(),
                null
        );
    }

    private CommodityDetailResponse buildCommodityDetail(DataCommodityEntity commodity, boolean includeProviderInfo) {
        return buildCommodityDetail(commodity, includeProviderInfo, false);
    }

    private CommodityDetailResponse buildCommodityDetail(DataCommodityEntity commodity,
                                                         boolean includeProviderInfo,
                                                         boolean marketView) {
        CommodityDetailResponse response = new CommodityDetailResponse();
        BeanUtils.copyProperties(commodity, response);
        if (isPublishedCommodityExpired(commodity, new Date())) {
            response.setStatus(CommodityStatusEnum.UNPUBLISHED.getCode());
        }

        DataProductCommodityRelEntity relation = getRelationByCommodityId(commodity.getCommodityId());
        if (relation != null && StringUtils.isNotBlank(relation.getProductId())) {
            response.setProductId(relation.getProductId());
            response.setVersionId(relation.getVersionId());
            CategoryDictionary categoryDictionary = buildCategoryDictionary();
            DataProductHistory productHistory = getProductHistoryByProductIdAndVersionId(
                    relation.getProductId(),
                    relation.getVersionId()
            );
            if (productHistory != null) {
                response.setProduct(toProductItem(productHistory, categoryDictionary));
                if (includeProviderInfo) {
                    response.setProviderInfo(buildTradeParticipantInfo(
                            productHistory.getUserId(),
                            productHistory.getConnectorId(),
                            productHistory.getConnectorName()
                    ));
                }
            } else {
                DataProduct product = marketView
                        ? getPublishedProductByProductIdAndVersionId(
                                relation.getProductId(),
                                relation.getVersionId()
                        )
                        : getVisibleProductByProductIdAndVersionId(
                                relation.getProductId(),
                                relation.getVersionId()
                        );
                if (product != null) {
                    response.setProduct(toProductItem(product, categoryDictionary));
                    if (includeProviderInfo) {
                        response.setProviderInfo(buildTradeParticipantInfo(
                                product.getUserId(),
                                product.getConnectorId(),
                                product.getConnectorName()
                        ));
                    }
                }
            }
        }
        if (includeProviderInfo && response.getProviderInfo() == null) {
            response.setProviderInfo(buildTradeParticipantInfo(
                    commodity.getUserId(),
                    commodity.getConnectorId(),
                    null
            ));
        }
        response.setStatusLogs(listStatusLogs(commodity.getCommodityId()));
        return response;
    }

    private DataProduct getPublishedProductByProductIdAndVersionId(String productId, String versionId) {
        return getPublishedProductByProductIdAndVersionId(productId, versionId, true);
    }

    private DataProduct getPublishedProductByProductIdAndVersionId(String productId, String versionId, boolean admin) {
        if (StringUtils.isBlank(productId) || StringUtils.isBlank(versionId)) {
            return null;
        }
        CommodityRequest query = new CommodityRequest();
        query.setProductId(productId);
        query.setVersionId(versionId);
        return dataProductServiceDao.getOne(buildProductQuery(query, effectiveCurrentUserId(), effectiveOwnerUserId(), true, admin)
                .eq(DataProduct::getDeleted, 0)
                .eq(DataProduct::getProductId, productId)
                .eq(DataProduct::getVersionId, versionId)
                .last("LIMIT 1"));
    }

    private DataProductHistory getProductHistoryByProductIdAndVersionId(String productId, String versionId) {
        if (StringUtils.isBlank(productId) || StringUtils.isBlank(versionId)) {
            return null;
        }
        return dataProductHistoryServiceDao.getOne(new LambdaQueryWrapper<DataProductHistory>()
                .eq(DataProductHistory::getDeleted, 0)
                .eq(DataProductHistory::getProductId, productId)
                .eq(DataProductHistory::getVersionId, versionId)
                .last("LIMIT 1"));
    }

    @Transactional(rollbackFor = Exception.class)
    public CommodityDetailResponse saveCommodity(CommodityRequest request) {
        validateSaveRequest(request);
        User currentUser = tradingAuthorizationService.getCurrentUser();
        assertCanManageOwnCommodity(currentUser);
        DataProduct product = requireOwnProduct(request.getProductId(), request.getVersionId());
        Date now = new Date();
        String commodityName = StringUtils.trimToNull(request.getCommodityName());

        DataCommodityEntity entity;
        boolean created = StringUtils.isBlank(request.getCommodityId());
        if (created) {
            entity = new DataCommodityEntity();
            entity.setCommodityId(CommodityCodeUtil.nextCode());
            entity.setStatus(CommodityStatusEnum.DRAFT.getCode());
            entity.setDeleted(0);
            entity.setUserId(currentUser.getId());
            entity.setCreatedAt(now);
        } else {
            entity = requireCommodity(request.getCommodityId());
            assertCommodityOwnerForMutation(entity);
            assertCommodityEditable(entity);
        }
        boolean expiredDuringSave = !created && isPublishedCommodityExpired(entity, now);
        if (expiredDuringSave) {
            entity.setStatus(CommodityStatusEnum.UNPUBLISHED.getCode());
        }
        assertCommodityNameUnique(commodityName, entity.getUserId(), created ? null : entity.getCommodityId());

        fillCommodity(entity, request, product);
        entity.setUpdatedAt(now);

        try {
            if (created) {
                dataCommodityServiceDao.save(entity);
                appendStatusLog(entity.getCommodityId(), CommodityStatusEnum.DRAFT, null, currentUser.getId());
            } else {
                dataCommodityServiceDao.updateById(entity);
                if (expiredDuringSave) {
                    appendStatusLog(entity.getCommodityId(), CommodityStatusEnum.UNPUBLISHED, "商品有效期已过期，自动下架", currentUser.getId());
                }
            }
        } catch (DuplicateKeyException ex) {
            throw new IllegalArgumentException("商品名称已存在，请更换后再保存");
        }
        saveRelation(entity.getCommodityId(), product.getProductId(), product.getVersionId());
        return getCommodityDetail(entity.getCommodityId());
    }

    @Transactional(rollbackFor = Exception.class)
    public CommodityDetailResponse publishCommodity(String commodityId) {
        User currentUser = tradingAuthorizationService.getCurrentUser();
        DataCommodityEntity commodity = requireCommodity(commodityId);
        if (isAdmin() && CommodityStatusEnum.REVIEWING.getCode() == commodity.getStatus()) {
            return approveCommodity(commodity, currentUser);
        }
        assertCommodityOwnerForStatusChange(commodity);

        if (CommodityStatusEnum.REVIEWING.getCode() == commodity.getStatus()) {
            throw new IllegalArgumentException("商品已提交审核，请勿重复提交");
        }
        assertCommodityValidForPublish(commodity);
        if (CommodityStatusEnum.PUBLISHED.getCode() == commodity.getStatus()) {
            throw new IllegalArgumentException("商品已上架，无需提交审核");
        }
        dataCommodityServiceDao.lambdaUpdate()
                .eq(DataCommodityEntity::getCommodityId, commodityId)
                .set(DataCommodityEntity::getStatus, CommodityStatusEnum.REVIEWING.getCode())
                .set(DataCommodityEntity::getUpdatedAt, new Date())
                .update();
        appendStatusLog(commodityId, CommodityStatusEnum.REVIEWING, null, currentUser.getId());
        return getCommodityDetail(commodityId);
    }

    @Transactional(rollbackFor = Exception.class)
    public CommodityDetailResponse rejectCommodity(String commodityId, String errors) {
        User currentUser = tradingAuthorizationService.getCurrentUser();
        if (!isAdmin()) {
            throw new IllegalArgumentException("仅管理员可审核商品");
        }
        String rejectReason = StringUtils.trimToNull(errors);
        if (rejectReason == null) {
            throw new IllegalArgumentException("驳回原因不能为空");
        }
        DataCommodityEntity commodity = requireCommodity(commodityId);
        if (CommodityStatusEnum.REVIEWING.getCode() != commodity.getStatus()) {
            throw new IllegalArgumentException("仅待审核商品可驳回");
        }
        dataCommodityServiceDao.lambdaUpdate()
                .eq(DataCommodityEntity::getCommodityId, commodityId)
                .set(DataCommodityEntity::getStatus, CommodityStatusEnum.REJECTED.getCode())
                .set(DataCommodityEntity::getUpdatedAt, new Date())
                .update();
        appendStatusLog(commodityId, CommodityStatusEnum.REJECTED, rejectReason, currentUser.getId());
        return getCommodityDetail(commodityId);
    }

    @Transactional(rollbackFor = Exception.class)
    public CommodityDetailResponse unpublishCommodity(String commodityId) {
        User currentUser = tradingAuthorizationService.getCurrentUser();
        DataCommodityEntity commodity = requireCommodity(commodityId);
        assertCommodityOwnerForStatusChange(commodity);

        if (CommodityStatusEnum.PUBLISHED.getCode() != commodity.getStatus()) {
            throw new IllegalArgumentException("仅已上架商品可下架");
        }
        if (CommodityStatusEnum.UNPUBLISHED.getCode() == commodity.getStatus()) {
            throw new IllegalArgumentException("商品已下架");
        }
        dataCommodityServiceDao.lambdaUpdate()
                .eq(DataCommodityEntity::getCommodityId, commodityId)
                .set(DataCommodityEntity::getStatus, CommodityStatusEnum.UNPUBLISHED.getCode())
                .set(DataCommodityEntity::getUpdatedAt, new Date())
                .update();
        appendStatusLog(commodityId, CommodityStatusEnum.UNPUBLISHED, null, currentUser.getId());
        return getCommodityDetail(commodityId);
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteCommodity(String commodityId) {
        DataCommodityEntity commodity = requireCommodity(commodityId);
        assertCommodityOwnerForMutation(commodity);
        assertCommodityDeletable(commodity);
        dataCommodityServiceDao.removeById(commodityId);
    }

    private void assertCommodityEditable(DataCommodityEntity commodity) {
        if (CommodityStatusEnum.REVIEWING.getCode() == commodity.getStatus()) {
            throw new IllegalArgumentException("待审核商品不可编辑");
        }
        if (CommodityStatusEnum.PUBLISHED.getCode() == commodity.getStatus() && !isPublishedCommodityExpired(commodity, new Date())) {
            throw new IllegalArgumentException("已上架商品不可编辑");
        }
    }

    private boolean isPublishedCommodityExpired(DataCommodityEntity commodity, Date now) {
        return commodity != null
                && CommodityStatusEnum.PUBLISHED.getCode() == commodity.getStatus()
                && isExpired(commodity.getExpiredTime(), now);
    }

    private boolean isExpired(Date expiredTime, Date now) {
        return expiredTime != null
                && now != null
                && !expiredTime.after(now);
    }

    private void assertCommodityValidForPublish(DataCommodityEntity commodity) {
        if (isExpired(commodity.getExpiredTime(), new Date())) {
            throw new IllegalArgumentException("商品已过期，请重新编辑有效期后提交审核");
        }
    }

    private void assertCommodityDeletable(DataCommodityEntity commodity) {
        if (CommodityStatusEnum.REVIEWING.getCode() == commodity.getStatus()) {
            throw new IllegalArgumentException("待审核商品不可删除");
        }
        if (CommodityStatusEnum.PUBLISHED.getCode() == commodity.getStatus() && !isPublishedCommodityExpired(commodity, new Date())) {
            throw new IllegalArgumentException("已上架商品需先下架后再删除");
        }
    }

    public CommodityProductListResponse listOwnProducts(CommodityRequest request) {
        CommodityRequest normalized = normalizeProductQuery(request);
        User currentUser = tradingAuthorizationService.getCurrentUser();
        assertCanManageOwnCommodity(currentUser);
        IPage<DataProduct> page = dataProductServiceDao.page(
                new Page<>(normalized.getPageNum(), normalized.getPageSize()),
                buildProductQuery(normalized, currentUser.getId(), effectiveOwnerUserId(), true, false)
        );

        List<CommodityProductItem> items = page.getRecords().stream()
                .map(this::toProductListItem)
                .collect(Collectors.toList());

        CommodityProductListResponse response = new CommodityProductListResponse();
        response.setData(items);
        response.setDataCount(Math.toIntExact(page.getTotal()));
        response.setPageCount(Math.toIntExact(page.getPages()));
        return response;
    }

    public CommodityProductItem getOwnProductDetail(CommodityRequest request) {
        if (request == null || StringUtils.isBlank(request.getProductId()) || StringUtils.isBlank(request.getVersionId())) {
            throw new IllegalArgumentException("产品ID和版本ID不能为空");
        }
        User currentUser = tradingAuthorizationService.getCurrentUser();
        assertCanManageOwnCommodity(currentUser);
        DataProduct product = getPublishedProductByProductIdAndVersionId(request.getProductId(), request.getVersionId(), false);
        if (product == null) {
            throw new IllegalArgumentException("数据产品不存在、不属于当前用户或未发布");
        }
        return toProductItem(product, buildCategoryDictionary());
    }

    private void fillCommodity(DataCommodityEntity entity, CommodityRequest request, DataProduct product) {
        String pricingModel = normalizeCommodityPricingModel(request.getPricingModel());
        BigDecimal price = PRICING_MODEL_FREE.equals(pricingModel)
                ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP)
                : request.getPrice();
        BigDecimal discount = PRICING_MODEL_FREE.equals(pricingModel)
                ? DEFAULT_DISCOUNT
                : request.getDiscount() == null ? DEFAULT_DISCOUNT : request.getDiscount();
        BigDecimal discountPrice = price
                .multiply(discount)
                .divide(ONE_HUNDRED, 2, RoundingMode.HALF_UP);

        entity.setCommodityName(StringUtils.trimToNull(request.getCommodityName()));
        entity.setCoverImage(StringUtils.trimToNull(request.getCoverImage()));
        entity.setDescription(StringUtils.trimToNull(request.getDescription()));
        entity.setCommodityType(normalizeCommodityType(request.getCommodityType()));
        entity.setPricingModel(pricingModel);
        entity.setPrice(price);
        entity.setDiscount(discount);
        entity.setDiscountPrice(discountPrice);
        Integer deliveryMethod = request.getDeliveryMethod() == null ? 1 : request.getDeliveryMethod();
        boolean requiresShare = deliveryMethod == 1 && !PRICING_MODEL_FREE.equals(pricingModel);
        entity.setOfferPer(requiresShare ? request.getOfferPer() : null);
        entity.setBusinessPer(requiresShare ? request.getBusinessPer() : null);
        entity.setDeliveryMethod(deliveryMethod);
        entity.setExpiredTime(parseDate(request.getExpiredTime()));
        entity.setUserIdentityCode(product.getUserIdentityCode());
        entity.setConnectorId(product.getConnectorId());
    }

    private void validateSaveRequest(CommodityRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("商品信息不能为空");
        }
        if (StringUtils.isBlank(request.getProductId())) {
            throw new IllegalArgumentException("数据产品不能为空");
        }
        if (StringUtils.isBlank(request.getVersionId())) {
            throw new IllegalArgumentException("产品版本不能为空");
        }
        if (StringUtils.isBlank(request.getCommodityName())) {
            throw new IllegalArgumentException("商品名称不能为空");
        }
        normalizeCommodityType(request.getCommodityType());
        if (StringUtils.isBlank(request.getCoverImage())) {
            throw new IllegalArgumentException("商品封面不能为空");
        }
        String pricingModel = normalizeCommodityPricingModel(request.getPricingModel());
        if (!PRICING_MODEL_FREE.equals(pricingModel)) {
            if (request.getPrice() == null) {
                throw new IllegalArgumentException("商品价格不能为空");
            }
            if (BigDecimal.ZERO.compareTo(request.getPrice()) >= 0) {
                throw new IllegalArgumentException("商品价格必须大于0");
            }
        }
        if (request.getDiscount() != null
                && (BigDecimal.ZERO.compareTo(request.getDiscount()) > 0
                || request.getDiscount().compareTo(ONE_HUNDRED) > 0)) {
            throw new IllegalArgumentException("商品折扣必须在0到100之间");
        }
        Integer deliveryMethod = request.getDeliveryMethod() == null ? 1 : request.getDeliveryMethod();
        if (deliveryMethod != 0 && deliveryMethod != 1) {
            throw new IllegalArgumentException("支付方式不合法");
        }
        if (deliveryMethod == 1 && !PRICING_MODEL_FREE.equals(pricingModel)) {
            validateOnlineShare(request.getOfferPer(), request.getBusinessPer());
        }
        Date expiredTime = parseDate(request.getExpiredTime());
        if (expiredTime != null && !expiredTime.after(new Date())) {
            throw new IllegalArgumentException("商品过期时间必须晚于当前时间");
        }
    }

    private String normalizeCommodityPricingModel(String pricingModel) {
        String normalized = StringUtils.upperCase(StringUtils.trimToNull(pricingModel));
        if (normalized == null) {
            return PRICING_MODEL_FREE;
        }
        if (PRICING_MODEL_FREE.equals(normalized)
                || PRICING_MODEL_PER_CALL.equals(normalized)
                || PRICING_MODEL_MONTHLY.equals(normalized)) {
            return normalized;
        }
        throw new IllegalArgumentException("定价模式不合法");
    }

    private void validateOnlineShare(BigDecimal offerPer, BigDecimal businessPer) {
        if (offerPer == null || businessPer == null) {
            throw new IllegalArgumentException("线上支付时分成比例不能为空");
        }
        validatePercent(offerPer, "数据提供方分成比例");
        validatePercent(businessPer, "平台运营方分成比例");
        if (offerPer.add(businessPer).compareTo(ONE_HUNDRED) != 0) {
            throw new IllegalArgumentException("数据提供方和平台运营方分成比例之和必须为100%");
        }
    }

    private void validatePercent(BigDecimal value, String label) {
        if (BigDecimal.ZERO.compareTo(value) > 0 || value.compareTo(ONE_HUNDRED) > 0) {
            throw new IllegalArgumentException(label + "必须在0到100之间");
        }
    }

    private void assertCommodityNameUnique(String commodityName, Long userId, String excludeCommodityId) {
        if (StringUtils.isBlank(commodityName) || userId == null) {
            return;
        }
        LambdaQueryWrapper<DataCommodityEntity> wrapper = new LambdaQueryWrapper<DataCommodityEntity>()
                .eq(DataCommodityEntity::getUserId, userId)
                .eq(DataCommodityEntity::getCommodityName, commodityName);
        if (StringUtils.isNotBlank(excludeCommodityId)) {
            wrapper.ne(DataCommodityEntity::getCommodityId, excludeCommodityId);
        }
        if (dataCommodityServiceDao.count(wrapper) > 0) {
            throw new IllegalArgumentException("商品名称已存在，请更换后再保存");
        }
    }

    private void saveRelation(String commodityId, String productId, String versionId) {
        dataProductCommodityRelServiceDao.remove(new LambdaQueryWrapper<DataProductCommodityRelEntity>()
                .eq(DataProductCommodityRelEntity::getCommodityId, commodityId));

        DataProductCommodityRelEntity relation = new DataProductCommodityRelEntity();
        relation.setId(UuidUtil.get32UUID());
        relation.setCommodityId(commodityId);
        relation.setProductId(productId);
        relation.setVersionId(versionId);
        relation.setCreatedAt(new Date());
        dataProductCommodityRelServiceDao.save(relation);
    }

    private void appendStatusLog(String commodityId, CommodityStatusEnum status, String errors, Long operationUser) {
        CommodityStatusInfoEntity log = new CommodityStatusInfoEntity();
        log.setId(UuidUtil.get32UUID());
        log.setCommodityId(commodityId);
        log.setStatus(status.getCode());
        log.setCreateTime(new Date());
        log.setErrors(errors);
        log.setOperationUser(operationUser);
        commodityStatusInfoServiceDao.save(log);
    }

    private DataProduct requireOwnProduct(String productId, String versionId) {
        if (StringUtils.isBlank(productId) || StringUtils.isBlank(versionId)) {
            throw new IllegalArgumentException("数据产品和版本不能为空");
        }
        DataProduct product = getPublishedProductByProductIdAndVersionId(productId, versionId, false);
        if (product == null) {
            throw new IllegalArgumentException("数据产品已下架，请重新选择");
        }
        return product;
    }

    private DataProduct getVisibleProductByProductIdAndVersionId(String productId, String versionId) {
        if (StringUtils.isBlank(productId) || StringUtils.isBlank(versionId)) {
            return null;
        }
        CommodityRequest query = new CommodityRequest();
        boolean admin = isAdmin();
        return dataProductServiceDao.getOne(buildProductQuery(query, effectiveCurrentUserId(), effectiveOwnerUserId(), false, admin)
                .eq(DataProduct::getProductId, productId)
                .eq(DataProduct::getVersionId, versionId)
                .last("LIMIT 1"));
    }

    private DataProductCommodityRelEntity getRelationByCommodityId(String commodityId) {
        return dataProductCommodityRelServiceDao.getOne(new LambdaQueryWrapper<DataProductCommodityRelEntity>()
                .eq(DataProductCommodityRelEntity::getCommodityId, commodityId)
                .orderByDesc(DataProductCommodityRelEntity::getCreatedAt)
                .last("LIMIT 1"));
    }

    private List<CommodityStatusInfoEntity> listStatusLogs(String commodityId) {
        return commodityStatusInfoServiceDao.list(new LambdaQueryWrapper<CommodityStatusInfoEntity>()
                .eq(CommodityStatusInfoEntity::getCommodityId, commodityId)
                .orderByAsc(CommodityStatusInfoEntity::getCreateTime));
    }

    private DataCommodityEntity requireCommodity(String commodityId) {
        if (StringUtils.isBlank(commodityId)) {
            throw new IllegalArgumentException("商品ID不能为空");
        }
        DataCommodityEntity commodity = dataCommodityServiceDao.getById(commodityId);
        if (commodity == null) {
            throw new IllegalArgumentException("商品不存在");
        }
        return commodity;
    }

    private void assertCommodityVisible(DataCommodityEntity commodity) {
        if (isAdmin()) {
            return;
        }
        User currentUser = tradingAuthorizationService.getCurrentUser();
        if (currentUser.getId() != null && currentUser.getId().equals(commodity.getUserId())) {
            return;
        }
        throw new IllegalArgumentException("无权限访问该商品");
    }

    private void assertCommodityOwnerForMutation(DataCommodityEntity commodity) {
        User currentUser = tradingAuthorizationService.getCurrentUser();
        assertCanManageOwnCommodity(currentUser);
        if (currentUser.getId() != null && currentUser.getId().equals(commodity.getUserId())) {
            return;
        }
        throw new IllegalArgumentException("无权限操作该商品");
    }

    public CommodityProviderInfo buildTradeParticipantInfo(Long participantUserId,
                                                           String connectorId,
                                                           String connectorName) {
        CommodityProviderInfo participantInfo = new CommodityProviderInfo();
        participantInfo.setUserId(participantUserId);
        participantInfo.setConnectorName(resolveConnectorName(connectorId, connectorName));

        if (participantUserId == null) {
            return participantInfo;
        }

        User participantUser = spUserServiceDao.getById(participantUserId);
        if (participantUser != null) {
            participantInfo.setAuthType(participantUser.getAuthType());
            participantInfo.setSubjectType(resolveSubjectType(participantUser.getAuthType()));
            participantInfo.setDisplayName(StringUtils.trimToNull(participantUser.getDisplayName()));
        }

        Integer authType = participantUser == null ? null : participantUser.getAuthType();
        if (Integer.valueOf(1).equals(authType)) {
            UserRealAuthInfo authInfo = userRealAuthInfoServiceDao.getOne(
                    new LambdaQueryWrapper<UserRealAuthInfo>()
                            .eq(UserRealAuthInfo::getUserId, participantUserId)
                            .orderByDesc(UserRealAuthInfo::getId)
                            .last("LIMIT 1")
            );
            if (authInfo != null) {
                participantInfo.setSubjectName(StringUtils.trimToNull(authInfo.getUserName()));
                participantInfo.setPhone(StringUtils.trimToNull(authInfo.getPhone()));
            }
        } else if (Integer.valueOf(2).equals(authType)) {
            LegalOrgAuthInfo authInfo = legalOrgAuthInfoServiceDao.getOne(
                    new LambdaQueryWrapper<LegalOrgAuthInfo>()
                            .eq(LegalOrgAuthInfo::getUserId, participantUserId)
                            .orderByDesc(LegalOrgAuthInfo::getId)
                            .last("LIMIT 1")
            );
            if (authInfo != null) {
                participantInfo.setSubjectName(StringUtils.trimToNull(authInfo.getLegalOrgName()));
                participantInfo.setUnifiedSocialCreditCode(StringUtils.trimToNull(authInfo.getUnifiedSocialCreditCode()));
            }
        } else if (Integer.valueOf(3).equals(authType)) {
            LegalOrgOperatorInfo authInfo = legalOrgOperatorInfoServiceDao.getOne(
                    new LambdaQueryWrapper<LegalOrgOperatorInfo>()
                            .eq(LegalOrgOperatorInfo::getUserId, participantUserId)
                            .orderByDesc(LegalOrgOperatorInfo::getId)
                            .last("LIMIT 1")
            );
            if (authInfo != null) {
                participantInfo.setSubjectName(StringUtils.trimToNull(authInfo.getOperatorName()));
                participantInfo.setOperatorCertType(StringUtils.trimToNull(authInfo.getOperatorCertType()));
                participantInfo.setOperatorCertNumber(StringUtils.trimToNull(authInfo.getOperatorCertNumber()));
            }
        }

        if (StringUtils.isBlank(participantInfo.getSubjectName())) {
            participantInfo.setSubjectName(participantInfo.getDisplayName());
        }
        return participantInfo;
    }

    private String resolveSubjectType(Integer authType) {
        if (Integer.valueOf(1).equals(authType)) {
            return "个人";
        }
        if (Integer.valueOf(2).equals(authType)) {
            return "机构/法人";
        }
        if (Integer.valueOf(3).equals(authType)) {
            return "经办人";
        }
        return "未认证";
    }

    private String resolveConnectorName(String connectorId, String productConnectorName) {
        String connectorName = StringUtils.trimToNull(productConnectorName);
        if (connectorName != null || StringUtils.isBlank(connectorId)) {
            return connectorName;
        }
        SpConnector connector = spConnectorServiceDao.getById(connectorId);
        return connector == null ? connectorId : StringUtils.defaultIfBlank(connector.getConnectorName(), connectorId);
    }

    private void assertCommodityOwnerForStatusChange(DataCommodityEntity commodity) {
        User currentUser = tradingAuthorizationService.getCurrentUser();
        assertCanManageOwnCommodity(currentUser);
        if (currentUser.getId() != null && currentUser.getId().equals(commodity.getUserId())) {
            return;
        }
        throw new IllegalArgumentException("无权限操作该商品");
    }

    private CommodityDetailResponse approveCommodity(DataCommodityEntity commodity, User currentUser) {
        if (CommodityStatusEnum.REVIEWING.getCode() != commodity.getStatus()) {
            throw new IllegalArgumentException("仅待审核商品可审核通过");
        }
        assertCommodityValidForPublish(commodity);
        dataCommodityServiceDao.lambdaUpdate()
                .eq(DataCommodityEntity::getCommodityId, commodity.getCommodityId())
                .set(DataCommodityEntity::getStatus, CommodityStatusEnum.PUBLISHED.getCode())
                .set(DataCommodityEntity::getUpdatedAt, new Date())
                .update();
        appendStatusLog(commodity.getCommodityId(), CommodityStatusEnum.APPROVED, null, currentUser.getId());
        appendStatusLog(commodity.getCommodityId(), CommodityStatusEnum.PUBLISHED, null, currentUser.getId());
        return getCommodityDetail(commodity.getCommodityId());
    }

    private CommodityProductItem toProductItem(DataProduct product, CategoryDictionary dictionary) {
        CommodityProductItem item = new CommodityProductItem();
        BeanUtils.copyProperties(product, item);
        item.setProductType(ProductTypeSupport.normalizeForResponse(product.getProductType()));
        item.setTopicCategoryLabel(dictionary.getTopicCategoryName(product.getTopicCategory()));
        item.setApplicationCategoryLabel(dictionary.getApplicationCategoryName(product.getApplicationCategory()));
        item.setIndustryCategoryLabel(dictionary.getIndustryCategoryName(product.getIndustryCategory()));
        item.setOrganizationCategoryLabel(dictionary.getOrganizationCategoryName(product.getOrganizationCategory()));
        item.setDataAcquisitionLabel(dictionary.getDataAcquisitionName(product.getDataAcquisition()));
        item.setUpdateFrequencyLabel(dictionary.getUpdateFrequencyName(product.getUpdateFrequency()));
        item.setDataQualityLevelLabel(dictionary.getQualityLevelName(product.getDataQualityLevel()));
        item.setDataSecurityLevelLabel(dictionary.getSecurityLevelName(product.getDataSecurityLevel()));
        item.setPricingModel(parseJsonMap(product.getPricingModel()));
        item.setCommercialTerms(parseJsonMap(product.getCommercialTerms()));
        item.setAccessConstraints(parseJsonMap(product.getAccessConstraints()));
        item.setProcessConfig(parseJsonMap(product.getProcessConfig()));
        item.setSampleData(parseJsonMap(product.getSampleData()));
        return item;
    }

    private CommodityProductItem toProductItem(DataProductHistory product, CategoryDictionary dictionary) {
        CommodityProductItem item = new CommodityProductItem();
        BeanUtils.copyProperties(product, item);
        item.setTopicCategoryLabel(dictionary.getTopicCategoryName(product.getTopicCategory()));
        item.setApplicationCategoryLabel(dictionary.getApplicationCategoryName(product.getApplicationCategory()));
        item.setIndustryCategoryLabel(dictionary.getIndustryCategoryName(product.getIndustryCategory()));
        item.setOrganizationCategoryLabel(dictionary.getOrganizationCategoryName(product.getOrganizationCategory()));
        item.setDataAcquisitionLabel(dictionary.getDataAcquisitionName(product.getDataAcquisition()));
        item.setUpdateFrequencyLabel(dictionary.getUpdateFrequencyName(product.getUpdateFrequency()));
        item.setDataQualityLevelLabel(dictionary.getQualityLevelName(product.getDataQualityLevel()));
        item.setDataSecurityLevelLabel(dictionary.getSecurityLevelName(product.getDataSecurityLevel()));
        item.setPricingModel(parseJsonMap(product.getPricingModel()));
        item.setCommercialTerms(parseJsonMap(product.getCommercialTerms()));
        item.setAccessConstraints(parseJsonMap(product.getAccessConstraints()));
        item.setProcessConfig(parseJsonMap(product.getProcessConfig()));
        item.setSampleData(parseJsonMap(product.getSampleData()));
        return item;
    }

    private CommodityProductItem toProductListItem(DataProduct product) {
        CommodityProductItem item = new CommodityProductItem();
        item.setId(product.getId());
        item.setProductId(product.getProductId());
        item.setVersionId(product.getVersionId());
        item.setProductName(product.getProductName());
        item.setProductType(ProductTypeSupport.normalizeForResponse(product.getProductType()));
        item.setDescription(product.getDescription());
        item.setConnectorId(product.getConnectorId());
        item.setConnectorName(product.getConnectorName());
        return item;
    }

    private String normalizeCommodityType(String commodityType) {
        return CommodityTypeEnum.normalizeCode(commodityType);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseJsonMap(String rawJson) {
        if (StringUtils.isBlank(rawJson)) {
            return null;
        }
        try {
            JSONObject json = JSONUtil.parseObj(rawJson);
            return (Map<String, Object>) (Map<?, ?>) json;
        } catch (Exception ignored) {
            return null;
        }
    }

    private CategoryDictionary buildCategoryDictionary() {
        CategoryDictionary dictionary = new CategoryDictionary();
        dictionary.setTopicCategoryMap(safeTreeCategoryMap(marketplaceCatalogClient::getTopicCategories, "主题分类"));
        dictionary.setApplicationCategoryMap(safeTreeCategoryMap(marketplaceCatalogClient::getApplicationCategories, "应用场景分类"));
        dictionary.setIndustryCategoryMap(safeTreeCategoryMap(marketplaceCatalogClient::getIndustryCategories, "行业分类"));
        dictionary.setOrganizationCategoryMap(safeFlatCategoryMap(marketplaceCatalogClient::getOrganizationCategories, "机构分类"));
        dictionary.setDataAcquisitionMap(safeFlatCategoryMap(marketplaceCatalogClient::getDataAcquisitions, "数据来源"));
        dictionary.setUpdateFrequencyMap(safeFlatCategoryMap(marketplaceCatalogClient::getUpdateFrequencies, "更新频率"));
        dictionary.setQualityLevelMap(safeFlatCategoryMap(marketplaceCatalogClient::getQualityLevels, "质量等级"));
        dictionary.setSecurityLevelMap(safeFlatCategoryMap(marketplaceCatalogClient::getSecurityLevels, "安全分级"));
        return dictionary;
    }

    private Map<String, String> safeTreeCategoryMap(CategorySupplier supplier, String categoryName) {
        try {
            return flattenTreeCategoryMap(supplier.get());
        } catch (Exception ex) {
            return Collections.emptyMap();
        }
    }

    private Map<String, String> safeFlatCategoryMap(CategorySupplier supplier, String categoryName) {
        try {
            return flattenFlatCategoryMap(supplier.get());
        } catch (Exception ex) {
            return Collections.emptyMap();
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

    private Map<String, String> flattenFlatCategoryMap(List<JSONObject> items) {
        Map<String, String> result = new LinkedHashMap<>();
        if (items == null) {
            return result;
        }
        for (JSONObject item : items) {
            String code = item.getStr("code");
            String name = item.getStr("name");
            if (StringUtils.isNotBlank(code) && StringUtils.isNotBlank(name)) {
                result.put(code, name);
            }
        }
        return result;
    }

    private static class CategoryDictionary {

        private Map<String, String> topicCategoryMap = Collections.emptyMap();

        private Map<String, String> applicationCategoryMap = Collections.emptyMap();

        private Map<String, String> industryCategoryMap = Collections.emptyMap();

        private Map<String, String> organizationCategoryMap = Collections.emptyMap();

        private Map<String, String> dataAcquisitionMap = Collections.emptyMap();

        private Map<String, String> updateFrequencyMap = Collections.emptyMap();

        private Map<String, String> qualityLevelMap = Collections.emptyMap();

        private Map<String, String> securityLevelMap = Collections.emptyMap();

        public void setTopicCategoryMap(Map<String, String> topicCategoryMap) {
            this.topicCategoryMap = topicCategoryMap;
        }

        public void setApplicationCategoryMap(Map<String, String> applicationCategoryMap) {
            this.applicationCategoryMap = applicationCategoryMap;
        }

        public void setIndustryCategoryMap(Map<String, String> industryCategoryMap) {
            this.industryCategoryMap = industryCategoryMap;
        }

        public void setOrganizationCategoryMap(Map<String, String> organizationCategoryMap) {
            this.organizationCategoryMap = organizationCategoryMap;
        }

        public void setDataAcquisitionMap(Map<String, String> dataAcquisitionMap) {
            this.dataAcquisitionMap = dataAcquisitionMap;
        }

        public void setUpdateFrequencyMap(Map<String, String> updateFrequencyMap) {
            this.updateFrequencyMap = updateFrequencyMap;
        }

        public void setQualityLevelMap(Map<String, String> qualityLevelMap) {
            this.qualityLevelMap = qualityLevelMap;
        }

        public void setSecurityLevelMap(Map<String, String> securityLevelMap) {
            this.securityLevelMap = securityLevelMap;
        }

        public String getTopicCategoryName(String code) {
            return getName(topicCategoryMap, code);
        }

        public String getApplicationCategoryName(String code) {
            return getName(applicationCategoryMap, code);
        }

        public String getIndustryCategoryName(String code) {
            return getName(industryCategoryMap, code);
        }

        public String getOrganizationCategoryName(String code) {
            return getName(organizationCategoryMap, code);
        }

        public String getDataAcquisitionName(String code) {
            return getName(dataAcquisitionMap, code);
        }

        public String getUpdateFrequencyName(String code) {
            return getName(updateFrequencyMap, code);
        }

        public String getQualityLevelName(String code) {
            return getName(qualityLevelMap, code);
        }

        public String getSecurityLevelName(String code) {
            return getName(securityLevelMap, code);
        }

        private String getName(Map<String, String> map, String code) {
            return StringUtils.defaultIfBlank(map.get(code), code);
        }
    }

    @FunctionalInterface
    private interface CategorySupplier {

        List<JSONObject> get();
    }

    private CommodityRequest normalizeListQuery(CommodityRequest request) {
        CommodityRequest normalized = request == null ? new CommodityRequest() : request;
        if (normalized.getPageNum() == null || normalized.getPageNum() < 1) {
            normalized.setPageNum(1);
        }
        if (normalized.getPageSize() == null || normalized.getPageSize() < 1) {
            normalized.setPageSize(12);
        }
        if (normalized.getPageSize() > 50) {
            normalized.setPageSize(50);
        }
        if (StringUtils.isNotBlank(normalized.getCommodityType())) {
            normalized.setCommodityType(normalizeCommodityType(normalized.getCommodityType()));
        }
        return normalized;
    }

    private CommodityRequest normalizeProductQuery(CommodityRequest request) {
        CommodityRequest normalized = request == null ? new CommodityRequest() : request;
        if (normalized.getPageNum() == null || normalized.getPageNum() < 1) {
            normalized.setPageNum(1);
        }
        if (normalized.getPageSize() == null || normalized.getPageSize() < 1) {
            normalized.setPageSize(10);
        }
        if (normalized.getPageSize() > 50) {
            normalized.setPageSize(50);
        }
        String productPricingModel = StringUtils.trimToNull(normalized.getPricingModel());
        if (productPricingModel == null) {
            normalized.setPricingModel("1");
            productPricingModel = "1";
        }
        if (!"0".equals(productPricingModel) && !"1".equals(productPricingModel) && !"100".equals(productPricingModel)) {
            throw new IllegalArgumentException("交易商品化配置仅支持0、1或100");
        }
        return normalized;
    }

    private LambdaQueryWrapper<DataProduct> buildProductQuery(CommodityRequest request,
                                                             Long currentUserId,
                                                             Long ownerUserId,
                                                             boolean publishedOnly,
                                                             boolean allOwners) {
        LambdaQueryWrapper<DataProduct> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DataProduct::getDeleted, 0)
                .isNotNull(DataProduct::getProductId)
                .ne(DataProduct::getProductId, "");
        if (publishedOnly) {
            wrapper.eq(DataProduct::getPublishStatus, PRODUCT_PUBLISH_STATUS_PUBLISHED);
        }

        if (!allOwners) {
            if (ownerUserId != null && !ownerUserId.equals(currentUserId)) {
                wrapper.and(q -> q.eq(DataProduct::getUserId, currentUserId)
                        .or()
                        .eq(DataProduct::getUserId, ownerUserId));
            } else {
                wrapper.eq(DataProduct::getUserId, currentUserId);
            }
        }

        if (request != null && StringUtils.isNotBlank(request.getKeyword())) {
            wrapper.and(q -> q.like(DataProduct::getProductName, request.getKeyword())
                    .or()
                    .like(DataProduct::getProductId, request.getKeyword())
                    .or()
                    .like(DataProduct::getDescription, request.getKeyword()));
        }
        String productPricingModel = request == null ? null : StringUtils.trimToNull(request.getPricingModel());
        if (productPricingModel != null && !"100".equals(productPricingModel)) {
            wrapper.eq(DataProduct::getPricingModel, productPricingModel);
        }
        wrapper.orderByDesc(DataProduct::getUpdatedAt, DataProduct::getCreatedAt);
        return wrapper;
    }

    private Date parseDate(String value) {
        String trimmed = StringUtils.trimToNull(value);
        if (trimmed == null) {
            return null;
        }
        try {
            return Date.from(OffsetDateTime.parse(trimmed).toInstant());
        } catch (DateTimeParseException ignored) {
            // Try local formats below.
        }
        try {
            return Date.from(LocalDateTime.parse(trimmed, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
                    .atZone(ZONE_ID)
                    .toInstant());
        } catch (DateTimeParseException ignored) {
            // Try date-only format below.
        }
        try {
            return Date.from(LocalDate.parse(trimmed, DateTimeFormatter.ISO_LOCAL_DATE)
                    .atStartOfDay(ZONE_ID)
                    .toInstant());
        } catch (DateTimeParseException ex) {
            throw new IllegalArgumentException("过期时间格式不正确");
        }
    }

    private boolean isAdmin() {
        List<String> roleCodes = tradingAuthorizationService.getCurrentRoleCodes();
        return roleCodes.contains("SUPER_ADMIN") || roleCodes.contains("ADMIN");
    }

    boolean canManageOwnCommodity(User user, boolean admin) {
        return user != null && (!admin || Integer.valueOf(2).equals(user.getAccountType()));
    }

    private void assertCanManageOwnCommodity(User user) {
        if (!canManageOwnCommodity(user, isAdmin())) {
            throw new IllegalArgumentException("纯管理员账号仅可审核或驳回商品");
        }
    }

    private Long effectiveCurrentUserId() {
        return tradingAuthorizationService.getCurrentUser().getId();
    }

    private Long effectiveOwnerUserId() {
        User user = tradingAuthorizationService.getCurrentUser();
        return user.getOwnerUserId() == null ? user.getId() : user.getOwnerUserId();
    }
}
