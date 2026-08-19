-- trading trade order tables
-- preferred for DBeaver + PostgreSQL / openGauss direct execution

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
    ) THEN
        EXECUTE '
            CREATE TABLE trading.trade_order (
                id VARCHAR(32) PRIMARY KEY,
                order_no VARCHAR(64) NOT NULL UNIQUE,
                order_title VARCHAR(256) NOT NULL,
                source_type VARCHAR(32) NOT NULL,
                source_id VARCHAR(65) NOT NULL,
                demand_id VARCHAR(32),
                demand_no VARCHAR(64),
                response_id VARCHAR(32) UNIQUE,
                contract_id VARCHAR(47),
                commodity_id VARCHAR(65),
                product_id VARCHAR(65),
                version_id VARCHAR(65),
                commodity_name VARCHAR(256),
                commodity_type VARCHAR(32),
                delivery_type VARCHAR(32),
                buyer_id BIGINT NOT NULL,
                buyer_name VARCHAR(128),
                buyer_user_identity_code VARCHAR(64),
                buyer_subject_name VARCHAR(256),
                seller_id BIGINT NOT NULL,
                seller_name VARCHAR(128),
                seller_user_identity_code VARCHAR(64),
                seller_subject_name VARCHAR(256),
                connector_id VARCHAR(128),
                quoted_price NUMERIC(12, 2),
                pricing_model VARCHAR(32),
                unit_price NUMERIC(12, 2),
                quantity INTEGER NOT NULL DEFAULT 1,
                free_quota NUMERIC(12, 2),
                estimated_amount NUMERIC(12, 2),
                actual_amount NUMERIC(12, 2) DEFAULT 0,
                status VARCHAR(20) NOT NULL,
                payment_status VARCHAR(20) DEFAULT ''UNPAID'',
                paid_amount NUMERIC(12, 2),
                paid_at TIMESTAMP,
                debit_flow_id BIGINT,
                income_flow_id BIGINT,
                remark VARCHAR(512),
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                confirmed_at TIMESTAMP,
                completed_at TIMESTAMP,
                deleted INTEGER NOT NULL DEFAULT 0
            )
        ';
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'source_id'
          AND character_maximum_length IS NOT NULL
          AND character_maximum_length < 65
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order ALTER COLUMN source_id TYPE VARCHAR(65)';
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'demand_id'
          AND is_nullable = 'NO'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order ALTER COLUMN demand_id DROP NOT NULL';
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'response_id'
          AND is_nullable = 'NO'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order ALTER COLUMN response_id DROP NOT NULL';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'trading'
          AND table_name = 'commodity_order'
    ) THEN
        EXECUTE 'CREATE TABLE trading.commodity_order (
            id VARCHAR(32) PRIMARY KEY,
            order_id VARCHAR(65) NOT NULL,
            commodity_id VARCHAR(65) NOT NULL,
            commodity_snapshot TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'trading'
          AND c.relname = 'idx_commodity_order_order_id'
    ) THEN
        EXECUTE 'CREATE INDEX idx_commodity_order_order_id ON trading.commodity_order(order_id)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'trading'
          AND c.relname = 'idx_commodity_order_commodity_id'
    ) THEN
        EXECUTE 'CREATE INDEX idx_commodity_order_commodity_id ON trading.commodity_order(commodity_id)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'trading'
          AND c.relname = 'idx_commodity_order_created_at'
    ) THEN
        EXECUTE 'CREATE INDEX idx_commodity_order_created_at ON trading.commodity_order(created_at DESC)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'product_id'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order ADD COLUMN product_id VARCHAR(65)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'version_id'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order ADD COLUMN version_id VARCHAR(65)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'contract_id'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order ADD COLUMN contract_id VARCHAR(47)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'commodity_id'
    ) AND EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'product_id'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order RENAME COLUMN product_id TO commodity_id';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'quantity'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'commodity_name'
    ) AND EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'product_name'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order RENAME COLUMN product_name TO commodity_name';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'commodity_type'
    ) AND EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'product_type'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order RENAME COLUMN product_type TO commodity_type';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'unit_price'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order ADD COLUMN unit_price NUMERIC(12, 2)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'commodity_id'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order ADD COLUMN commodity_id VARCHAR(65)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'commodity_name'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order ADD COLUMN commodity_name VARCHAR(256)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'commodity_type'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order ADD COLUMN commodity_type VARCHAR(32)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'free_quota'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order ADD COLUMN free_quota NUMERIC(12, 2)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'estimated_amount'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order ADD COLUMN estimated_amount NUMERIC(12, 2)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'actual_amount'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order ADD COLUMN actual_amount NUMERIC(12, 2) DEFAULT 0';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'confirmed_at'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order ADD COLUMN confirmed_at TIMESTAMP';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'completed_at'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order ADD COLUMN completed_at TIMESTAMP';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'buyer_user_identity_code'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order ADD COLUMN buyer_user_identity_code VARCHAR(64)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'buyer_subject_name'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order ADD COLUMN buyer_subject_name VARCHAR(256)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'seller_user_identity_code'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order ADD COLUMN seller_user_identity_code VARCHAR(64)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'seller_subject_name'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order ADD COLUMN seller_subject_name VARCHAR(256)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'payment_status'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order ADD COLUMN payment_status VARCHAR(20) DEFAULT ''UNPAID''';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'paid_amount'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order ADD COLUMN paid_amount NUMERIC(12, 2)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'paid_at'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order ADD COLUMN paid_at TIMESTAMP';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'debit_flow_id'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order ADD COLUMN debit_flow_id BIGINT';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
          AND column_name = 'income_flow_id'
    ) THEN
        EXECUTE 'ALTER TABLE trading.trade_order ADD COLUMN income_flow_id BIGINT';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'trading'
          AND c.relname = 'idx_trade_order_commodity'
          AND c.relkind = 'i'
    ) THEN
        EXECUTE 'CREATE INDEX idx_trade_order_commodity ON trading.trade_order (commodity_id)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'trading'
          AND c.relname = 'idx_trade_order_contract'
          AND c.relkind = 'i'
    ) THEN
        EXECUTE 'CREATE INDEX idx_trade_order_contract ON trading.trade_order (contract_id)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'trading'
          AND c.relname = 'order_status_log_id_seq'
          AND c.relkind = 'S'
    ) THEN
        EXECUTE '
            CREATE SEQUENCE trading.order_status_log_id_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1
        ';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'trading'
          AND table_name = 'order_status_log'
    ) THEN
        EXECUTE '
            CREATE TABLE trading.order_status_log (
                id BIGINT NOT NULL DEFAULT nextval(''trading.order_status_log_id_seq'') PRIMARY KEY,
                order_id VARCHAR(32) NOT NULL,
                from_status VARCHAR(20),
                to_status VARCHAR(20) NOT NULL,
                operator_id BIGINT,
                operator_name VARCHAR(128),
                reason VARCHAR(512),
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        ';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'trading'
          AND c.relname = 'idx_trade_order_buyer'
          AND c.relkind = 'i'
    ) THEN
        EXECUTE 'CREATE INDEX idx_trade_order_buyer ON trading.trade_order (buyer_id)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'trading'
          AND c.relname = 'idx_trade_order_seller'
          AND c.relkind = 'i'
    ) THEN
        EXECUTE 'CREATE INDEX idx_trade_order_seller ON trading.trade_order (seller_id)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'trading'
          AND c.relname = 'idx_trade_order_status'
          AND c.relkind = 'i'
    ) THEN
        EXECUTE 'CREATE INDEX idx_trade_order_status ON trading.trade_order (status)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'trading'
          AND c.relname = 'idx_trade_order_created_at'
          AND c.relkind = 'i'
    ) THEN
        EXECUTE 'CREATE INDEX idx_trade_order_created_at ON trading.trade_order (created_at DESC)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'trading'
          AND c.relname = 'idx_trade_order_payment_status'
          AND c.relkind = 'i'
    ) THEN
        EXECUTE 'CREATE INDEX idx_trade_order_payment_status ON trading.trade_order (payment_status)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'trading'
          AND c.relname = 'idx_order_status_log_order_id'
          AND c.relkind = 'i'
    ) THEN
        EXECUTE 'CREATE INDEX idx_order_status_log_order_id ON trading.order_status_log (order_id)';
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'trading'
          AND table_name = 'trade_order'
    ) THEN
        EXECUTE 'COMMENT ON TABLE trading.trade_order IS ''交易订单表''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.id IS ''订单主键 ID''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.order_no IS ''订单编号''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.order_title IS ''订单标题''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.source_type IS ''订单来源类型''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.source_id IS ''订单来源记录 ID''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.demand_id IS ''关联需求 ID''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.demand_no IS ''关联需求编号''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.response_id IS ''关联响应 ID''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.contract_id IS ''外部合约 ID''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.commodity_id IS ''商品 ID''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.product_id IS ''外部产品 ID 快照''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.version_id IS ''外部产品版本 ID 快照''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.commodity_name IS ''商品名称快照''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.commodity_type IS ''商品类型快照''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.delivery_type IS ''交付方式快照''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.buyer_id IS ''买方用户 ID''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.buyer_name IS ''买方用户名/展示名快照''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.buyer_user_identity_code IS ''买方主体 identity code 快照''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.buyer_subject_name IS ''买方主体名称快照''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.seller_id IS ''卖方用户 ID''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.seller_name IS ''卖方用户名/展示名快照''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.seller_user_identity_code IS ''卖方主体 identity code 快照''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.seller_subject_name IS ''卖方主体名称快照''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.connector_id IS ''连接器 ID''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.quoted_price IS ''响应报价快照''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.pricing_model IS ''定价模式快照''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.unit_price IS ''订单单价快照''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.quantity IS ''购买数量''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.free_quota IS ''免费额度快照''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.estimated_amount IS ''预计金额快照''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.actual_amount IS ''当前累计金额''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.status IS ''订单状态''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.payment_status IS ''扣费状态''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.paid_amount IS ''已扣费金额''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.paid_at IS ''扣费完成时间''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.debit_flow_id IS ''扣费流水 ID''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.income_flow_id IS ''收入流水 ID''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.remark IS ''订单备注''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.created_at IS ''创建时间''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.updated_at IS ''更新时间''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.confirmed_at IS ''确认进入履约时间''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.completed_at IS ''完成订单时间''';
        EXECUTE 'COMMENT ON COLUMN trading.trade_order.deleted IS ''逻辑删除标记 0否 1是''';
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'trading'
          AND table_name = 'order_status_log'
    ) THEN
        EXECUTE 'COMMENT ON TABLE trading.order_status_log IS ''订单状态日志表''';
        EXECUTE 'COMMENT ON COLUMN trading.order_status_log.id IS ''日志主键 ID''';
        EXECUTE 'COMMENT ON COLUMN trading.order_status_log.order_id IS ''关联订单 ID''';
        EXECUTE 'COMMENT ON COLUMN trading.order_status_log.from_status IS ''原订单状态''';
        EXECUTE 'COMMENT ON COLUMN trading.order_status_log.to_status IS ''目标订单状态''';
        EXECUTE 'COMMENT ON COLUMN trading.order_status_log.operator_id IS ''操作人用户 ID''';
        EXECUTE 'COMMENT ON COLUMN trading.order_status_log.operator_name IS ''操作人名称快照''';
        EXECUTE 'COMMENT ON COLUMN trading.order_status_log.reason IS ''状态变更说明''';
        EXECUTE 'COMMENT ON COLUMN trading.order_status_log.created_at IS ''日志创建时间''';
    END IF;
END $$;
