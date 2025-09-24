import { api } from './api';

type LogsQueryParams = {
    username?: string;
    type?: string;
    format?: string;
    dev?: boolean;
};

type LogEntry = {
    type: string;
    timestamp?: string | number;
    from?: string | number;
    until?: string | number;
    taskTitle?: string;
};

type LogsResponse = {
    data: LogEntry[];
    message?: string;
};

export const logsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getLogs: builder.query<LogsResponse, LogsQueryParams>({
            query: (params) => ({
                url: '/logs',
                params: {
                    username: params.username,
                    type: params.type,
                    format: params.format,
                    dev: params.dev,
                },
            }),
            providesTags: ['Logs'],
        }),
    }),
    overrideExisting: true,
});

export const { useLazyGetLogsQuery } = logsApi;
