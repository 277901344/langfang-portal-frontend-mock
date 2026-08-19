package com.zhzj.trading.dao.commodity;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhzj.trading.model.commodity.CommodityListItem;
import com.zhzj.trading.model.commodity.CommodityRequest;
import com.zhzj.trading.model.commodity.DataCommodityEntity;
import org.springframework.stereotype.Service;

/**
 * 商品 Service 实现类。
 *
 * @author Connector Team
 * @since 2026-05-25
 */
@Service
public class DataCommodityServiceDao extends ServiceImpl<DataCommodityDao, DataCommodityEntity> {

    public IPage<CommodityListItem> pageCommodityList(Page<CommodityListItem> page,
                                                      CommodityRequest query,
                                                      Long userId,
                                                      boolean isAdmin,
                                                      boolean canManageOwnCommodity) {
        return baseMapper.selectCommodityPage(page, query, userId, isAdmin, canManageOwnCommodity);
    }
}
