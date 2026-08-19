package com.zhzj.trading.service.support.file;

import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Set;

/**
 * 系统上传文件类型白名单。
 */
public final class UploadFileTypeWhitelist {

    public enum Usage {
        FILE_RESOURCE_STRUCTURED,
        FILE_RESOURCE_TEXT,
        FILE_RESOURCE_IMAGE,
        PRODUCT_SAMPLE,
        AUTH_PROOF,
        CONNECTOR_CREDENTIAL,
        CONNECTOR_CSR,
        IDENTITY_ATTACHMENT
    }

    public static final Set<String> FILE_RESOURCE_STRUCTURED_EXTENSIONS = immutableSet("csv");

    public static final Set<String> FILE_RESOURCE_TEXT_EXTENSIONS = immutableSet(
            "txt", "md", "csv", "json", "xml", "log", "tsv", "yml", "yaml",
            "doc", "docx", "xls", "xlsx", "ppt", "pptx", "wps", "et", "dps");

    public static final Set<String> FILE_RESOURCE_IMAGE_EXTENSIONS = immutableSet(
            "jpg", "jpeg", "png", "gif", "bmp", "webp", "svg");

    public static final Set<String> PRODUCT_SAMPLE_EXTENSIONS = immutableSet("csv", "json");

    public static final Set<String> AUTH_PROOF_EXTENSIONS = immutableSet(
            "pdf", "doc", "docx", "jpg", "jpeg", "png");

    public static final Set<String> CONNECTOR_CREDENTIAL_EXTENSIONS = immutableSet(
            "crt", "cer", "pem", "json-ld");

    public static final Set<String> CONNECTOR_CSR_EXTENSIONS = immutableSet("csr", "pem");

    public static final Set<String> IDENTITY_ATTACHMENT_EXTENSIONS = immutableSet(
            "pdf", "jpg", "jpeg", "png");

    public static final Set<String> ALL_ALLOWED_EXTENSIONS = immutableSet(
            merge(
                    FILE_RESOURCE_STRUCTURED_EXTENSIONS,
                    FILE_RESOURCE_TEXT_EXTENSIONS,
                    FILE_RESOURCE_IMAGE_EXTENSIONS,
                    PRODUCT_SAMPLE_EXTENSIONS,
                    AUTH_PROOF_EXTENSIONS,
                    CONNECTOR_CREDENTIAL_EXTENSIONS,
                    CONNECTOR_CSR_EXTENSIONS,
                    IDENTITY_ATTACHMENT_EXTENSIONS));

    private UploadFileTypeWhitelist() {
    }

    public static Set<String> getAllowedExtensions(Usage usage) {
        if (usage == null) {
            return ALL_ALLOWED_EXTENSIONS;
        }
        switch (usage) {
            case FILE_RESOURCE_STRUCTURED:
                return FILE_RESOURCE_STRUCTURED_EXTENSIONS;
            case FILE_RESOURCE_TEXT:
                return FILE_RESOURCE_TEXT_EXTENSIONS;
            case FILE_RESOURCE_IMAGE:
                return FILE_RESOURCE_IMAGE_EXTENSIONS;
            case PRODUCT_SAMPLE:
                return PRODUCT_SAMPLE_EXTENSIONS;
            case AUTH_PROOF:
                return AUTH_PROOF_EXTENSIONS;
            case CONNECTOR_CREDENTIAL:
                return CONNECTOR_CREDENTIAL_EXTENSIONS;
            case CONNECTOR_CSR:
                return CONNECTOR_CSR_EXTENSIONS;
            case IDENTITY_ATTACHMENT:
                return IDENTITY_ATTACHMENT_EXTENSIONS;
            default:
                return ALL_ALLOWED_EXTENSIONS;
        }
    }

    public static boolean isAllowed(String filename) {
        return isAllowed(filename, null);
    }

    public static boolean isAllowed(String filename, Usage usage) {
        String extension = extractExtension(filename);
        return extension != null && getAllowedExtensions(usage).contains(extension);
    }

    public static String extractExtension(String filename) {
        if (filename == null) {
            return null;
        }
        String normalized = filename.trim();
        int queryIndex = normalized.indexOf('?');
        if (queryIndex >= 0) {
            normalized = normalized.substring(0, queryIndex);
        }
        int slashIndex = Math.max(normalized.lastIndexOf('/'), normalized.lastIndexOf('\\'));
        if (slashIndex >= 0) {
            normalized = normalized.substring(slashIndex + 1);
        }
        int dotIndex = normalized.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == normalized.length() - 1) {
            return null;
        }
        return normalized.substring(dotIndex + 1).toLowerCase(Locale.ROOT);
    }

    public static String formatAllowedExtensions(Usage usage) {
        StringBuilder builder = new StringBuilder();
        for (String extension : getAllowedExtensions(usage)) {
            if (builder.length() > 0) {
                builder.append(", ");
            }
            builder.append('.').append(extension);
        }
        return builder.toString();
    }

    private static Set<String> immutableSet(String... extensions) {
        return immutableSet(new LinkedHashSet<String>(Arrays.asList(extensions)));
    }

    private static Set<String> immutableSet(Set<String> extensions) {
        Set<String> normalized = new LinkedHashSet<String>();
        for (String extension : extensions) {
            if (extension != null && !extension.trim().isEmpty()) {
                normalized.add(extension.trim().toLowerCase(Locale.ROOT));
            }
        }
        return Collections.unmodifiableSet(normalized);
    }

    @SafeVarargs
    private static Set<String> merge(Set<String>... extensionSets) {
        Set<String> merged = new LinkedHashSet<String>();
        for (Set<String> extensionSet : extensionSets) {
            if (extensionSet != null) {
                merged.addAll(extensionSet);
            }
        }
        return merged;
    }
}
