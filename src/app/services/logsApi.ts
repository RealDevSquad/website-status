import { api } from './api';

export type LogEntry = any;

export type LogsResponse = {
    data: LogEntry[];
    next?: string | null;
    prev?: string | null;
};

export type GetLogsQuery = {
    username?: string;
    startDate?: number; // seconds since epoch
    endDate?: number; // seconds since epoch
    type?: string; // comma-separated list of types
    format?: 'feed';
    dev?: boolean;
    nextLink?: string;
};

export const logsApi = api.injectEndpoints({
    endpoints: (build) => ({
        getLogs: build.query<LogsResponse, GetLogsQuery>({
            query: ({
                username,
                startDate,
                endDate,
                type,
                format = 'feed',
                dev = true,
                nextLink,
            }) => {
                if (nextLink) {
                    return nextLink;
                }
                const queryParams = new URLSearchParams();
                if (dev) queryParams.set('dev', 'true');
                if (format) queryParams.set('format', format);
                if (type) queryParams.set('type', type);
                if (username) queryParams.set('username', username);
                if (startDate) queryParams.set('startDate', String(startDate));
                if (endDate) queryParams.set('endDate', String(endDate));
                return `/logs?${queryParams.toString()}`;
            },
            providesTags: ['Status'],
        }),
    }),
});

export const { useLazyGetLogsQuery } = logsApi;
