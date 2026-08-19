-- 商品管理
-- ============================================
-- Table: trading.data_commodity
-- Description: 数据商品主表
-- Compatible: PostgreSQL 9.6+
-- ============================================
CREATE TABLE IF NOT EXISTS trading.data_commodity (
    -- 基本属性
    commodity_id VARCHAR(65) PRIMARY KEY,  -- 商品ID，主键
    commodity_name VARCHAR(128) NOT NULL,
    cover_image VARCHAR(512),           -- 商品封面图片URL
    description TEXT,                   -- 商品描述
    commodity_type VARCHAR(32) NOT NULL DEFAULT '0',
    
    -- 价格相关
    pricing_model VARCHAR(32) NOT NULL DEFAULT 'FREE', -- 定价模式：FREE 免费、PER_CALL 按次计费、MONTHLY 包月
    price NUMERIC(10,2) NOT NULL,           -- 产品原价
    discount NUMERIC(10,2) DEFAULT 1.00,     -- 产品折扣率，默认为 1.00 表示无折扣
    discount_price NUMERIC(10,2),            -- 产品折扣后的价格
    offer_per NUMERIC(5,2),                  -- 数据提供方分层比例
    business_per NUMERIC(5,2),               -- 平台运营方分层比例
    
    -- 交付与有效期
    delivery_method INT2 NOT NULL DEFAULT 1,  -- 交付方式：0-线下合同，1-线上交付
    expired_time TIMESTAMP NULL,              -- 产品过期时间，null代表永久
    
    -- 状态与删除
    status INTEGER NOT NULL DEFAULT 0,  -- 0待完善 1待审核 2审核通过 3已驳回 4上架 5已下架
    deleted INTEGER DEFAULT 0,          -- 0未删除 1已删除
    
    -- 用户信息
    user_id INT8,
    user_identity_code VARCHAR(128),
    connector_id VARCHAR(128),
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 表注释
COMMENT ON TABLE trading.data_commodity IS '数据商品主表';

-- 字段注释
COMMENT ON COLUMN trading.data_commodity.commodity_id IS '商品ID，主键，全网唯一标识';
COMMENT ON COLUMN trading.data_commodity.commodity_name IS '商品名称';
COMMENT ON COLUMN trading.data_commodity.cover_image IS '商品封面图片URL';
COMMENT ON COLUMN trading.data_commodity.description IS '商品描述';
COMMENT ON COLUMN trading.data_commodity.commodity_type IS '商品类型：数据集、API产品、数据应用、数据报告、数字对象、其他';
COMMENT ON COLUMN trading.data_commodity.pricing_model IS '定价模式：FREE 免费、PER_CALL 按次计费、MONTHLY 包月';
COMMENT ON COLUMN trading.data_commodity.price IS '产品原价';
COMMENT ON COLUMN trading.data_commodity.discount IS '产品折扣率，默认为 1.00 表示无折扣';
COMMENT ON COLUMN trading.data_commodity.discount_price IS '产品折扣后的价格';
COMMENT ON COLUMN trading.data_commodity.offer_per IS '数据提供方分层比例';
COMMENT ON COLUMN trading.data_commodity.business_per IS '平台运营方分层比例';
COMMENT ON COLUMN trading.data_commodity.delivery_method IS '支付方式：0-线下支付，1-线上交付';
COMMENT ON COLUMN trading.data_commodity.expired_time IS '产品过期时间，null代表永久';
COMMENT ON COLUMN trading.data_commodity.status IS '商品状态：0-待完善(保存)，1-待审核，2-审核通过，3-已驳回，4-上架，5-已下架';
COMMENT ON COLUMN trading.data_commodity.deleted IS '删除标记：0-未删除，1-已删除';
COMMENT ON COLUMN trading.data_commodity.user_id IS '创建人ID';
COMMENT ON COLUMN trading.data_commodity.user_identity_code IS '创建人身份编码';
COMMENT ON COLUMN trading.data_commodity.connector_id IS '连接器ID';
COMMENT ON COLUMN trading.data_commodity.created_at IS '创建时间';
COMMENT ON COLUMN trading.data_commodity.updated_at IS '更新时间';

-- 索引
CREATE INDEX idx_commodity_user ON trading.data_commodity(user_id, deleted, created_at DESC);
CREATE INDEX idx_commodity_status ON trading.data_commodity(status, deleted, created_at DESC);
CREATE INDEX idx_commodity_name ON trading.data_commodity(commodity_name);
CREATE INDEX idx_commodity_connector ON trading.data_commodity(connector_id, deleted, created_at DESC);
CREATE UNIQUE INDEX uk_commodity_user_name_active
    ON trading.data_commodity(user_id, commodity_name)
    WHERE deleted = 0;

-- ============================================
-- Table: trading.data_product_commodity_rel
-- Description: 数据产品与商品关系表
-- Compatible: PostgreSQL 9.6+
-- ============================================
CREATE TABLE IF NOT EXISTS trading.data_product_commodity_rel (
    -- 基本属性
    id VARCHAR(32) PRIMARY KEY,
    product_id VARCHAR(65) NOT NULL,    -- 关联data_product.product_id
    version_id VARCHAR(65),             -- 关联data_product.version_id，锁定商品上架时的产品版本
    commodity_id VARCHAR(65) NOT NULL,  -- 关联data_commodity.commodity_id
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 表注释
COMMENT ON TABLE trading.data_product_commodity_rel IS '数据产品与商品关系表';

-- 字段注释
COMMENT ON COLUMN trading.data_product_commodity_rel.id IS '内部ID, 32位uuid';
COMMENT ON COLUMN trading.data_product_commodity_rel.product_id IS '数据产品ID';
COMMENT ON COLUMN trading.data_product_commodity_rel.version_id IS '数据产品版本ID，用于锁定商品关联的产品版本';
COMMENT ON COLUMN trading.data_product_commodity_rel.commodity_id IS '商品ID';
COMMENT ON COLUMN trading.data_product_commodity_rel.created_at IS '创建时间';

-- 唯一约束（防止重复关联）
ALTER TABLE trading.data_product_commodity_rel 
ADD CONSTRAINT uk_product_commodity UNIQUE (product_id, version_id, commodity_id);

-- 索引
CREATE INDEX idx_rel_product ON trading.data_product_commodity_rel(product_id, created_at DESC);
CREATE INDEX idx_rel_product_version ON trading.data_product_commodity_rel(product_id, version_id, created_at DESC);
CREATE INDEX idx_rel_commodity ON trading.data_product_commodity_rel(commodity_id, created_at DESC);


-- ============================================
-- Table: trading.commodity_status_info
-- Description: 商品上架周期表
-- ============================================
CREATE table IF NOT EXISTS trading.commodity_status_info (
	id varchar(32) PRIMARY KEY, -- 记录的唯一标识
	commodity_id varchar(65) NOT NULL, -- 关联的产品 ID，指向 product_info 表中的产品
	status int2 NOT NULL, -- 产品状态 0待完善(保存) 1待审核 2审核通过 3已驳回 4上架 5已下架
	create_time timestamp DEFAULT now() NULL, -- 记录创建的时间，默认为当前时间
	errors text NULL, -- 驳回原因
	operation_user int8 NULL -- 操作人id
);
COMMENT ON TABLE trading.commodity_status_info IS '商品上架周期表';


-- ============================================
-- Table: trading.commodity_order
-- Description: 商品订单表
-- Compatible: PostgreSQL 9.6+
-- ============================================
CREATE TABLE IF NOT EXISTS trading.commodity_order (
    -- 基本属性
    id VARCHAR(32) PRIMARY KEY,              -- 记录ID，主键
    order_id VARCHAR(65) NOT NULL,           -- 订单ID
    commodity_id VARCHAR(65) NOT NULL,       -- 商品ID
    commodity_snapshot TEXT,                 -- 商品快照信息（JSON格式）
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 表注释
COMMENT ON TABLE trading.commodity_order IS '商品订单表';

-- 字段注释
COMMENT ON COLUMN trading.commodity_order.id IS '记录ID，主键';
COMMENT ON COLUMN trading.commodity_order.order_id IS '订单ID';
COMMENT ON COLUMN trading.commodity_order.commodity_id IS '商品ID';
COMMENT ON COLUMN trading.commodity_order.commodity_snapshot IS '商品快照信息（JSON格式）';
COMMENT ON COLUMN trading.commodity_order.created_at IS '创建时间';

-- 索引
CREATE INDEX idx_order_id ON trading.commodity_order(order_id);
CREATE INDEX idx_commodity_id ON trading.commodity_order(commodity_id);
CREATE INDEX idx_created_at ON trading.commodity_order(created_at DESC);
