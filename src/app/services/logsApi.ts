import { api } from './api';

type LogsResponse = {
    message?: string;
    data?: any[];
    logs?: any[];
    next?: string | null;
    prev?: string | null;
};

type GetLogsParams = {
    dev?: boolean;
    type?: string;
    format?: string;
    page?: number;
    size?: number;
    next?: string; // full path like /logs?... from backend
    prev?: string; // full path like /logs?... from backend
};

export const logsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getLogs: builder.query<LogsResponse, GetLogsParams | void>({
            query: (params) => {
                if (params?.next) {
                    return { url: params.next };
                }
                if (params?.prev) {
                    return { url: params.prev };
                }
                const {
                    dev = true,
                    type = 'task',
                    format,
                    page,
                    size,
                } = params || {};
                return {
                    url: '/logs',
                    params: { dev, type, format, page, size },
                };
            },
            providesTags: [],
        }),
    }),
    overrideExisting: true,
});

export const { useGetLogsQuery, useLazyGetLogsQuery } = logsApi;
