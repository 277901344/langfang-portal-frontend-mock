-- trading demand center tables
-- compatible with PostgreSQL / openGauss

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'trading'
          AND table_name = 'data_demand'
    ) THEN
        EXECUTE '
            CREATE TABLE trading.data_demand (
                id VARCHAR(32) PRIMARY KEY,
                demand_no VARCHAR(64) NOT NULL UNIQUE,
                title VARCHAR(256) NOT NULL,
                description TEXT,
                topic_category VARCHAR(64),
                application_category VARCHAR(64),
                product_type VARCHAR(32),
                update_frequency VARCHAR(32),
                expected_fields_json TEXT,
                usage_purpose VARCHAR(512),
                budget_type VARCHAR(32),
                budget_amount NUMERIC(12, 2),
                expected_delivery VARCHAR(32),
                deadline TIMESTAMP,
                status VARCHAR(20) NOT NULL,
                publisher_id BIGINT NOT NULL,
                publisher_name VARCHAR(128),
                matched_response_id VARCHAR(32),
                order_id VARCHAR(32),
                response_count INTEGER DEFAULT 0,
                view_count INTEGER DEFAULT 0,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                published_at TIMESTAMP,
                closed_at TIMESTAMP,
                deleted INTEGER NOT NULL DEFAULT 0
            )
        ';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'trading'
          AND table_name = 'demand_response'
    ) THEN
        EXECUTE '
            CREATE TABLE trading.demand_response (
                id VARCHAR(32) PRIMARY KEY,
                demand_id VARCHAR(32) NOT NULL,
                responder_id BIGINT NOT NULL,
                responder_name VARCHAR(128),
                product_id VARCHAR(65),
                version_id VARCHAR(65),
                connector_id VARCHAR(128),
                proposal TEXT NOT NULL,
                quoted_price NUMERIC(12, 2),
                pricing_model VARCHAR(32),
                delivery_type VARCHAR(32),
                status VARCHAR(20) NOT NULL,
                reject_reason VARCHAR(512),
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        ';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'trading'
          AND table_name = 'demand_response'
          AND column_name = 'version_id'
    ) THEN
        EXECUTE 'ALTER TABLE trading.demand_response ADD COLUMN version_id VARCHAR(65)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'trading'
          AND c.relname = 'idx_data_demand_status'
          AND c.relkind = 'i'
    ) THEN
        EXECUTE 'CREATE INDEX idx_data_demand_status ON trading.data_demand (status)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'trading'
          AND c.relname = 'idx_data_demand_publisher'
          AND c.relkind = 'i'
    ) THEN
        EXECUTE 'CREATE INDEX idx_data_demand_publisher ON trading.data_demand (publisher_id)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'trading'
          AND c.relname = 'idx_data_demand_topic_category'
          AND c.relkind = 'i'
    ) THEN
        EXECUTE 'CREATE INDEX idx_data_demand_topic_category ON trading.data_demand (topic_category)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'trading'
          AND c.relname = 'idx_data_demand_created_at'
          AND c.relkind = 'i'
    ) THEN
        EXECUTE 'CREATE INDEX idx_data_demand_created_at ON trading.data_demand (created_at DESC)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'trading'
          AND c.relname = 'idx_demand_response_demand_id'
          AND c.relkind = 'i'
    ) THEN
        EXECUTE 'CREATE INDEX idx_demand_response_demand_id ON trading.demand_response (demand_id)';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'trading'
          AND c.relname = 'idx_demand_response_responder_id'
          AND c.relkind = 'i'
    ) THEN
        EXECUTE 'CREATE INDEX idx_demand_response_responder_id ON trading.demand_response (responder_id)';
    END IF;
END $$;

COMMENT ON TABLE trading.data_demand IS 'trading demand table';
COMMENT ON TABLE trading.demand_response IS 'trading demand response table';
