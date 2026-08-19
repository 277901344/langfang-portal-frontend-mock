package com.zhzj.trading.controller;

import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.zhzj.trading.common.Result;
import com.zhzj.trading.service.FileService;

@RestController
@RequestMapping("/file")
public class FileController {

    @Autowired
    private FileService fileService;

    @PostMapping("/uploadFile")
    public Result<String> uploadFile(@RequestParam("file") MultipartFile file) {
        return Result.ok(fileService.uploadFile(file));
    }

    @GetMapping("/download")
    public void downloadFile(@RequestParam("fileUrl") String objectKey, HttpServletResponse response) {
        fileService.downloadFile(objectKey, response);
    }

    @PostMapping("/sp/download")
    public void downloadSpFile(@RequestBody Map<String, String> request, HttpServletResponse response) {
        fileService.downloadSpFile(request == null ? null : request.get("fileUrl"), response);
    }

    @PostMapping("/removeFile")
    public Result<String> removeFile(@RequestParam("fileUrl") String fileUrl) {
        try {
            fileService.removeFile(fileUrl);
            return Result.ok();
        } catch (Exception e) {
            return Result.fail("删除文件失败");
        }
    }
}
