-- 商品定价模式
-- FREE: 免费，PER_CALL: 按次计费，MONTHLY: 包月

ALTER TABLE trading.data_commodity
    ADD COLUMN pricing_model VARCHAR(32) NOT NULL DEFAULT 'FREE';

COMMENT ON COLUMN trading.data_commodity.pricing_model IS '定价模式：FREE 免费、PER_CALL 按次计费、MONTHLY 包月';

UPDATE trading.data_commodity SET pricing_model = 'PER_CALL';

UPDATE trading.trade_order SET pricing_model = 'PER_CALL' where source_type = 'MARKETPLACE_QUICK_ORDER';
