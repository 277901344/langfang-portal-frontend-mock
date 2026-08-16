import { getRuntimeConfig as getRuntimeConfigApi, type RuntimeConfigResponse } from './auth';

const EMPTY_RUNTIME_FRONTEND_CONFIG: Record<string, unknown> = {};

let runtimeConfigSnapshot: RuntimeConfigResponse = {
  config: EMPTY_RUNTIME_FRONTEND_CONFIG,
};
let runtimeConfigInitialized = false;
let runtimeConfigLoadingPromise: Promise<RuntimeConfigResponse> | null = null;

export async function initializeRuntimeConfig(): Promise<RuntimeConfigResponse> {
  if (runtimeConfigInitialized) {
    return runtimeConfigSnapshot;
  }
  if (!runtimeConfigLoadingPromise) {
    runtimeConfigLoadingPromise = getRuntimeConfigApi()
      .then((config) => {
        runtimeConfigSnapshot = {
          ...config,
          config: config?.config ?? EMPTY_RUNTIME_FRONTEND_CONFIG,
        };
        runtimeConfigInitialized = true;
        return runtimeConfigSnapshot;
      })
      .catch((error) => {
        console.error('获取运行时配置失败，将使用默认配置继续初始化', error);
        runtimeConfigSnapshot = {
          config: EMPTY_RUNTIME_FRONTEND_CONFIG,
        };
        runtimeConfigInitialized = true;
        return runtimeConfigSnapshot;
      });
  }
  return runtimeConfigLoadingPromise;
}

export function getRuntimeConfigSnapshot(): RuntimeConfigResponse {
  return runtimeConfigSnapshot;
}

export function getRuntimeFrontendConfig(): Record<string, unknown> {
  return getRuntimeConfigSnapshot().config ?? EMPTY_RUNTIME_FRONTEND_CONFIG;
}

export function getRuntimeNumber(
  config: Record<string, unknown> | undefined,
  key: string,
  defaultValue: number,
): number {
  const value = config?.[key];
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsedValue = Number(value);
    if (Number.isFinite(parsedValue)) {
      return parsedValue;
    }
  }
  return defaultValue;
}
