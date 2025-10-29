import { api } from './api';

export interface LogEntry {
    user?: string;
    requestId: string;
    from: number;
    until: number;
    type: string;
    timestamp: number;
    message?: string;
}

export interface LogsResponse {
    message: string;
    data: LogEntry[];
    next: string | null;
    prev: string | null;
}

export interface LogsQueryArgs {
    username: string;
    dev?: boolean;
    format?: string;
    type?: string;
}

export const logsApi = api.injectEndpoints({
    endpoints: (build) => ({
        getLogsByUsername: build.query<LogsResponse, LogsQueryArgs>({
            query: ({
                username,
                dev = true,
                format = 'feed',
                type = 'REQUEST_CREATED',
            }) =>
                `/logs?dev=${dev}&format=${format}&type=${type}&username=${username}`,
            providesTags: ['Logs'],
        }),
    }),
});

export const { useGetLogsByUsernameQuery } = logsApi;
