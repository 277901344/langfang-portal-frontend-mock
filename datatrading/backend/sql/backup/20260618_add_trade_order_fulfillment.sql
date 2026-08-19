-- 订单履约准入状态字段。
-- 兼容 PostgreSQL 9.6 / GaussDB 兼容环境，避免使用 ALTER TABLE ... ADD COLUMN IF NOT EXISTS。

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'fulfillment_status'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order ADD COLUMN fulfillment_status INTEGER NOT NULL DEFAULT 0';
    END IF;
END;
$$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'fulfillment_expire_at'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order ADD COLUMN fulfillment_expire_at TIMESTAMP';
    END IF;
END;
$$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
    ) AND NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE schemaname = 'trading'
          AND indexname = 'idx_trade_order_fulfillment_admission'
    ) THEN
        EXECUTE 'CREATE INDEX idx_trade_order_fulfillment_admission
                 ON trading.trade_order (
                     contract_id,
                     product_id,
                     status,
                     deleted,
                     fulfillment_status,
                     fulfillment_expire_at,
                     created_at
                 )';
    END IF;
END;
$$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'fulfillment_status'
    ) THEN
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.fulfillment_status IS ''履约准入状态：0 可履约，1 已关闭准入（按次用尽、包月过期等）''';
    END IF;
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'fulfillment_expire_at'
    ) THEN
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.fulfillment_expire_at IS ''履约准入过期时间，包月等限时定价模式使用；为空表示不按时间过期''';
    END IF;
END;
$$;
