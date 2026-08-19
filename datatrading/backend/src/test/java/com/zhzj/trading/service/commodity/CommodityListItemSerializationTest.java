package com.zhzj.trading.service.commodity;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhzj.trading.model.commodity.CommodityListItem;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CommodityListItemSerializationTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void omitsMissingOwnerFromPublicResponse() throws Exception {
        String json = objectMapper.writeValueAsString(new CommodityListItem());

        assertFalse(json.contains("\"userId\""));
    }

    @Test
    void includesOwnerForManagementResponse() throws Exception {
        CommodityListItem item = new CommodityListItem();
        item.setUserId(100L);

        String json = objectMapper.writeValueAsString(item);

        assertTrue(json.contains("\"userId\":100"));
    }
}
