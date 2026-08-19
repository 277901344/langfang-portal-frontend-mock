package com.zhzj.trading.service.support.file;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import org.springframework.web.multipart.MultipartFile;

/**
 * 页面上传文件类型校验器：后缀白名单 + 文件头/文本形态校验。
 */
public final class UploadFileTypeValidator {

    private static final int HEADER_LENGTH = 64;
    private static final int TEXT_SAMPLE_LENGTH = 4096;

    private static final Set<String> TEXT_LIKE_EXTENSIONS = new HashSet<String>(Arrays.asList(
            "txt", "md", "csv", "json", "xml", "log", "tsv", "yml", "yaml", "json-ld"));

    private UploadFileTypeValidator() {
    }

    public static String validate(MultipartFile file) {
        return validate(file, null);
    }

    public static String validate(MultipartFile file, UploadFileTypeWhitelist.Usage usage) {
        if (file == null || file.isEmpty()) {
            return "上传文件不能为空";
        }
        String filename = file.getOriginalFilename();
        if (!UploadFileTypeWhitelist.isAllowed(filename, usage)) {
            return "不支持的文件类型，仅支持: " + UploadFileTypeWhitelist.formatAllowedExtensions(usage);
        }
        String extension = UploadFileTypeWhitelist.extractExtension(filename);
        if (extension == null) {
            return "文件缺少合法扩展名";
        }
        try {
            if (!matchesContent(file, extension)) {
                return "文件内容与扩展名不匹配或文件已损坏，请检查后重试";
            }
        } catch (IOException e) {
            return "读取上传文件失败，请稍后重试";
        }
        return null;
    }

    private static boolean matchesContent(MultipartFile file, String extension) throws IOException {
        String normalized = extension.toLowerCase(Locale.ROOT);
        if ("pdf".equals(normalized)) {
            return hasHeader(file, "%PDF".getBytes(StandardCharsets.US_ASCII));
        }
        if ("jpg".equals(normalized) || "jpeg".equals(normalized)) {
            return hasJpegHeader(file);
        }
        if ("png".equals(normalized)) {
            return hasHeader(file, new byte[] {(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A});
        }
        if ("gif".equals(normalized)) {
            return hasHeader(file, "GIF87a".getBytes(StandardCharsets.US_ASCII))
                    || hasHeader(file, "GIF89a".getBytes(StandardCharsets.US_ASCII));
        }
        if ("bmp".equals(normalized)) {
            return hasHeader(file, "BM".getBytes(StandardCharsets.US_ASCII));
        }
        if ("webp".equals(normalized)) {
            return hasWebpHeader(file);
        }
        if ("svg".equals(normalized)) {
            return isSvg(file);
        }
        if ("docx".equals(normalized)) {
            return isOfficeOpenXml(file, "word/");
        }
        if ("xlsx".equals(normalized)) {
            return isOfficeOpenXml(file, "xl/");
        }
        if ("pptx".equals(normalized)) {
            return isOfficeOpenXml(file, "ppt/");
        }
        if ("doc".equals(normalized) || "xls".equals(normalized) || "ppt".equals(normalized)) {
            return hasOleHeader(file);
        }
        if ("wps".equals(normalized) || "et".equals(normalized) || "dps".equals(normalized)) {
            return hasOleHeader(file) || hasZipHeader(file);
        }
        if ("crt".equals(normalized) || "cer".equals(normalized) || "pem".equals(normalized)
                || "csr".equals(normalized)) {
            return isCertificateLike(file);
        }
        if (TEXT_LIKE_EXTENSIONS.contains(normalized)) {
            return isTextLike(file, normalized);
        }
        return true;
    }

    private static boolean hasJpegHeader(MultipartFile file) throws IOException {
        byte[] header = readHeader(file, 3);
        return header.length >= 3
                && (header[0] & 0xFF) == 0xFF
                && (header[1] & 0xFF) == 0xD8
                && (header[2] & 0xFF) == 0xFF;
    }

    private static boolean hasWebpHeader(MultipartFile file) throws IOException {
        byte[] header = readHeader(file, 12);
        return header.length >= 12
                && header[0] == 'R'
                && header[1] == 'I'
                && header[2] == 'F'
                && header[3] == 'F'
                && header[8] == 'W'
                && header[9] == 'E'
                && header[10] == 'B'
                && header[11] == 'P';
    }

    private static boolean hasHeader(MultipartFile file, byte[] expected) throws IOException {
        byte[] header = readHeader(file, expected.length);
        if (header.length < expected.length) {
            return false;
        }
        for (int i = 0; i < expected.length; i++) {
            if (header[i] != expected[i]) {
                return false;
            }
        }
        return true;
    }

    private static boolean hasOleHeader(MultipartFile file) throws IOException {
        return hasHeader(file, new byte[] {
                (byte) 0xD0, (byte) 0xCF, 0x11, (byte) 0xE0,
                (byte) 0xA1, (byte) 0xB1, 0x1A, (byte) 0xE1
        });
    }

    private static boolean hasZipHeader(MultipartFile file) throws IOException {
        byte[] header = readHeader(file, 4);
        return header.length >= 4
                && header[0] == 'P'
                && header[1] == 'K'
                && (header[2] == 0x03 || header[2] == 0x05 || header[2] == 0x07)
                && (header[3] == 0x04 || header[3] == 0x06 || header[3] == 0x08);
    }

    private static boolean isOfficeOpenXml(MultipartFile file, String rootPrefix) throws IOException {
        if (!hasZipHeader(file)) {
            return false;
        }
        try (ZipInputStream zis = new ZipInputStream(file.getInputStream())) {
            boolean hasContentTypes = false;
            boolean hasRoot = false;
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                String name = entry.getName();
                if ("[Content_Types].xml".equalsIgnoreCase(name)) {
                    hasContentTypes = true;
                }
                if (name != null && name.startsWith(rootPrefix)) {
                    hasRoot = true;
                }
                if (hasContentTypes && hasRoot) {
                    return true;
                }
            }
        }
        return false;
    }

    private static boolean isCertificateLike(MultipartFile file) throws IOException {
        if (hasPemMarker(file)) {
            return true;
        }
        byte[] header = readHeader(file, HEADER_LENGTH);
        return header.length >= 2 && (header[0] & 0xFF) == 0x30;
    }

    private static boolean hasPemMarker(MultipartFile file) throws IOException {
        String sample = readTextSample(file);
        return ltrim(sample).startsWith("-----BEGIN ");
    }

    private static boolean isSvg(MultipartFile file) throws IOException {
        byte[] bytes = readHeader(file, TEXT_SAMPLE_LENGTH);
        if (!isProbablyText(bytes)) {
            return false;
        }
        String normalized = ltrim(new String(bytes, StandardCharsets.UTF_8)).toLowerCase(Locale.ROOT);
        return normalized.startsWith("<svg")
                || normalized.startsWith("<?xml")
                || normalized.contains("<svg");
    }

    private static boolean isTextLike(MultipartFile file, String extension) throws IOException {
        byte[] bytes = readHeader(file, TEXT_SAMPLE_LENGTH);
        if (!isProbablyText(bytes)) {
            return false;
        }
        String trimmed = ltrim(new String(bytes, StandardCharsets.UTF_8));
        if ("json".equals(extension) || "json-ld".equals(extension)) {
            return trimmed.startsWith("{") || trimmed.startsWith("[");
        }
        if ("xml".equals(extension)) {
            return trimmed.startsWith("<");
        }
        return true;
    }

    private static String readTextSample(MultipartFile file) throws IOException {
        return new String(readHeader(file, TEXT_SAMPLE_LENGTH), StandardCharsets.UTF_8);
    }

    private static boolean isProbablyText(byte[] bytes) {
        if (bytes == null || bytes.length == 0) {
            return true;
        }
        int suspicious = 0;
        for (byte current : bytes) {
            int value = current & 0xFF;
            if (value == 0) {
                return false;
            }
            if ((value >= 0x01 && value <= 0x08)
                    || value == 0x0B
                    || value == 0x0C
                    || (value >= 0x0E && value <= 0x001F)) {
                suspicious++;
            }
        }
        return suspicious * 10 <= bytes.length;
    }

    private static String ltrim(String value) {
        if (value == null || value.isEmpty()) {
            return "";
        }
        int index = 0;
        while (index < value.length() && Character.isWhitespace(value.charAt(index))) {
            index++;
        }
        return value.substring(index);
    }

    private static byte[] readHeader(MultipartFile file, int maxLength) throws IOException {
        try (InputStream inputStream = file.getInputStream()) {
            byte[] buffer = new byte[maxLength];
            int offset = 0;
            int read;
            while (offset < maxLength && (read = inputStream.read(buffer, offset, maxLength - offset)) != -1) {
                offset += read;
            }
            return offset == buffer.length ? buffer : Arrays.copyOf(buffer, offset);
        }
    }
}
