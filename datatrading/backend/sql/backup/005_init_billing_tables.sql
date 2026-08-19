-- trading billing tables
-- preferred for DBeaver + PostgreSQL / openGauss direct execution
-- PG 9.6 compatible

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'trading'
          AND table_name = 'usage_record'
    ) THEN
        EXECUTE '
            CREATE TABLE trading.usage_record (
                id BIGSERIAL PRIMARY KEY,
                contract_id VARCHAR(47) NOT NULL,
                order_id VARCHAR(32) NOT NULL,
                transfer_id VARCHAR(64),
                consumer_id BIGINT NOT NULL,
                consumer_user_identity_code VARCHAR(128),
                provider_id BIGINT NOT NULL,
                provide_user_identity_code VARCHAR(128),
                usage_type VARCHAR(20) NOT NULL,
                usage_value NUMERIC(16, 4) NOT NULL,
                billable_usage NUMERIC(16, 4) DEFAULT 0,
                amount NUMERIC(12, 2) DEFAULT 0,
                source_type VARCHAR(20) DEFAULT ''CONNECTOR'',
                source_status VARCHAR(20) DEFAULT ''RECORDED'',
                recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                raw_payload TEXT
            )
        ';
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'trading'
          AND c.relname = 'idx_usage_product'
          AND c.relkind = 'i'
    ) THEN
        EXECUTE 'DROP INDEX trading.idx_usage_product';
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'trading'
          AND c.relname = 'idx_usage_commodity'
          AND c.relkind = 'i'
    ) THEN
        EXECUTE 'DROP INDEX trading.idx_usage_commodity';
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'usage_record'
          AND column_name = 'product_id'
    ) THEN
        EXECUTE 'ALTER TABLE trading.usage_record DROP COLUMN product_id';
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'usage_record'
          AND column_name = 'commodity_id'
    ) THEN
        EXECUTE 'ALTER TABLE trading.usage_record DROP COLUMN commodity_id';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'usage_record'
          AND column_name = 'consumer_user_identity_code'
    ) THEN
        EXECUTE 'ALTER TABLE trading.usage_record ADD COLUMN consumer_user_identity_code VARCHAR(128)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'usage_record'
          AND column_name = 'provide_user_identity_code'
    ) THEN
        EXECUTE 'ALTER TABLE trading.usage_record ADD COLUMN provide_user_identity_code VARCHAR(128)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'usage_record'
          AND column_name = 'raw_payload'
    ) THEN
        EXECUTE 'ALTER TABLE trading.usage_record ADD COLUMN raw_payload TEXT';
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'usage_record'
          AND column_name = 'raw_payload'
          AND udt_name IN ('json', 'jsonb')
    ) THEN
        EXECUTE 'ALTER TABLE trading.usage_record ALTER COLUMN raw_payload TYPE TEXT USING raw_payload::text';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'trading'
          AND c.relname = 'idx_usage_contract'
          AND c.relkind = 'i'
    ) THEN
        EXECUTE 'CREATE INDEX idx_usage_contract ON trading.usage_record (contract_id)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'trading'
          AND c.relname = 'idx_usage_order'
          AND c.relkind = 'i'
    ) THEN
        EXECUTE 'CREATE INDEX idx_usage_order ON trading.usage_record (order_id)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'trading'
          AND c.relname = 'idx_usage_recorded'
          AND c.relkind = 'i'
    ) THEN
        EXECUTE 'CREATE INDEX idx_usage_recorded ON trading.usage_record (recorded_at DESC)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'trading'
          AND c.relname = 'idx_usage_transfer'
          AND c.relkind = 'i'
    ) THEN
        EXECUTE 'CREATE INDEX idx_usage_transfer ON trading.usage_record (transfer_id)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'trading'
          AND c.relname = 'uk_usage_order_transfer'
          AND c.relkind = 'i'
    ) THEN
        EXECUTE 'CREATE UNIQUE INDEX uk_usage_order_transfer ON trading.usage_record (order_id, transfer_id) WHERE transfer_id IS NOT NULL';
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'trading'
          AND table_name = 'usage_record'
    ) THEN
        EXECUTE 'COMMENT ON TABLE trading.usage_record IS ''计量计费使用事实表：记录 connector 在真实履约、传输或调用过程中产生的原始使用事实，一期基于该表实时聚合订单累计用量和累计金额''';
        EXECUTE 'COMMENT ON COLUMN trading.usage_record.id IS ''使用事实主键 ID，系统自增，仅用于表内唯一标识，不作为外部业务编号''';
        EXECUTE 'COMMENT ON COLUMN trading.usage_record.contract_id IS ''关联合约 ID，来源于订单绑定的外部合约，用于把履约事实与合约关系对应起来''';
        EXECUTE 'COMMENT ON COLUMN trading.usage_record.order_id IS ''关联交易订单 ID，对应 trading.trade_order.id，是订单计量汇总、刷新和扣费金额回写的核心关联字段；商品信息不在本表冗余保存，需通过订单关联 trade_order.commodity_id / commodity_name 获取''';
        EXECUTE 'COMMENT ON COLUMN trading.usage_record.transfer_id IS ''外部传输或调用事实 ID，由 connector 侧生成；与 order_id 组成幂等键，避免同一次履约事实重复入库''';
        EXECUTE 'COMMENT ON COLUMN trading.usage_record.consumer_id IS ''使用方用户 ID，通常为订单买方用户 ID，用于区分本次计量事实的消费方''';
        EXECUTE 'COMMENT ON COLUMN trading.usage_record.consumer_user_identity_code IS ''使用方主体 identity code 快照，通常来源于订单买方主体标识，用于按主体统计消费侧用量''';
        EXECUTE 'COMMENT ON COLUMN trading.usage_record.provider_id IS ''提供方用户 ID，通常为订单卖方用户 ID，用于区分本次计量事实的数据或服务提供方''';
        EXECUTE 'COMMENT ON COLUMN trading.usage_record.provide_user_identity_code IS ''提供方主体 identity code 快照，通常来源于订单卖方主体标识，用于按主体统计提供侧收入和用量''';
        EXECUTE 'COMMENT ON COLUMN trading.usage_record.usage_type IS ''使用量类型，表示本次事实的计量口径，例如调用次数、传输次数、文件大小、数据行数等''';
        EXECUTE 'COMMENT ON COLUMN trading.usage_record.usage_value IS ''原始使用量，记录 connector 回调传入的实际发生用量，保留 4 位小数用于不同计量单位汇总''';
        EXECUTE 'COMMENT ON COLUMN trading.usage_record.billable_usage IS ''可计费用量，在原始使用量基础上扣除免费额度或按计费规则折算后的用量；一期默认可与 usage_value 保持一致或由服务端计算''';
        EXECUTE 'COMMENT ON COLUMN trading.usage_record.amount IS ''本条使用事实折算金额，基于订单价格快照、可计费用量和免费额度计算，用于实时汇总订单当前累计金额''';
        EXECUTE 'COMMENT ON COLUMN trading.usage_record.source_type IS ''使用事实来源类型，默认 CONNECTOR，表示由 connector 履约回调产生；后续可扩展为轮询同步、人工补录等来源''';
        EXECUTE 'COMMENT ON COLUMN trading.usage_record.source_status IS ''使用事实处理状态，默认 RECORDED，表示已记录；后续可扩展为已汇总、异常、已忽略等处理状态''';
        EXECUTE 'COMMENT ON COLUMN trading.usage_record.recorded_at IS ''事实发生或记录时间，用于计量趋势统计、使用明细筛选和最近计量时间展示''';
        EXECUTE 'COMMENT ON COLUMN trading.usage_record.raw_payload IS ''原始回调载荷文本，保存 connector 传入的完整 JSON 字符串，使用 TEXT 兼容 PG 9.6 及不支持 jsonb 的环境，便于排查和追溯''';
    END IF;
END $$;
