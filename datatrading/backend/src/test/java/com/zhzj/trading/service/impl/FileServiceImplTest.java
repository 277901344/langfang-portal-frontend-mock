package com.zhzj.trading.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletResponse;

class FileServiceImplTest {

    private final FileServiceImpl fileService = new FileServiceImpl();

    @Test
    void downloadFileRejectsRemoteHttpUrl() {
        IllegalArgumentException error = assertThrows(IllegalArgumentException.class,
                () -> fileService.downloadFile("http://169.254.169.254/latest/meta-data/",
                        new MockHttpServletResponse()));

        assertEquals("非法文件地址", error.getMessage());
    }

    @Test
    void downloadFileRejectsEncodedRemoteHttpUrl() {
        IllegalArgumentException error = assertThrows(IllegalArgumentException.class,
                () -> fileService.downloadFile("http%3A%2F%2F169.254.169.254%2Flatest%2Fmeta-data%2F",
                        new MockHttpServletResponse()));

        assertEquals("非法文件地址", error.getMessage());
    }

    @Test
    void removeFileRejectsRemoteHttpUrl() {
        IllegalArgumentException error = assertThrows(IllegalArgumentException.class,
                () -> fileService.removeFile("http://169.254.169.254/latest/meta-data/"));

        assertEquals("非法文件地址", error.getMessage());
    }
}
