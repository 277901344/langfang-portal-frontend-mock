package com.zhzj.trading.dao.commodity;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhzj.trading.model.commodity.CommodityStatusInfoEntity;
import org.apache.ibatis.annotations.Mapper;

/**
 * 商品状态生命周期 Mapper 接口。
 *
 * @author Connector Team
 * @since 2026-05-25
 */
@Mapper
public interface CommodityStatusInfoDao extends BaseMapper<CommodityStatusInfoEntity> {
}
