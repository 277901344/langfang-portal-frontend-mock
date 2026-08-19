const CHINESE_CHAR_REGEX = /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/g;

function sanitizePasswordInput(target: EventTarget | null): void {
    if (!(target instanceof HTMLInputElement)) {
        return;
    }
    const isPasswordLikeInput = target.type === 'password' || Boolean(target.closest('.ant-input-password'));
    if (!isPasswordLikeInput) {
        return;
    }
    const originalValue = target.value;
    if (!originalValue) {
        return;
    }
    const sanitizedValue = originalValue.replace(CHINESE_CHAR_REGEX, '');
    if (sanitizedValue === originalValue) {
        return;
    }
    const cursor = target.selectionStart == null ? sanitizedValue.length : target.selectionStart;
    const removedCount = originalValue.length - sanitizedValue.length;
    target.value = sanitizedValue;
    const nextCursor = Math.max(0, cursor - removedCount);
    try {
        target.setSelectionRange(nextCursor, nextCursor);
    } catch {
        // ignore unsupported environments
    }
}

export function installPasswordInputChineseGuard(): void {
    if (typeof document === 'undefined') {
        return;
    }
    document.addEventListener(
        'input',
        (event: Event) => {
            sanitizePasswordInput(event.target);
        },
        true
    );
}

