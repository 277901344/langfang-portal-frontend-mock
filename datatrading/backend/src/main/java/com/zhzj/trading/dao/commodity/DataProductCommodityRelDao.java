package com.zhzj.trading.dao.commodity;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhzj.trading.model.commodity.DataProductCommodityRelEntity;
import org.apache.ibatis.annotations.Mapper;

/**
 * 数据产品与商品关系 Mapper 接口。
 *
 * @author Connector Team
 * @since 2026-05-25
 */
@Mapper
public interface DataProductCommodityRelDao extends BaseMapper<DataProductCommodityRelEntity> {
}
