import React from 'react';

import { getAppConfig } from '@/config';

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { VITE_SPACE_NAME } = getAppConfig();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">{VITE_SPACE_NAME}</h1>
                    <p className="text-gray-500">统一登录入口</p>
                </div>
                {children}
            </div>
        </div>
    );
};
