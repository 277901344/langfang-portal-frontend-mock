package com.zhzj.trading.dao.commodity;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhzj.trading.model.commodity.DataProduct;
import org.apache.ibatis.annotations.Mapper;

/**
 * 数据产品 Mapper 接口。
 *
 * @author sp Team
 * @since 2026-01-20
 */
@Mapper
public interface DataProductDao extends BaseMapper<DataProduct> {
}
