import { api } from './api';

export type LogEntry = {
    user: string;
    taskId: string;
    taskTitle: string;
    type: string;
    userId: string;
    username: string;
    subType: string;
    status: string;
    timestamp: number;
};

export interface ApiLogEntry {
    type: string;
    timestamp: {
        _seconds: number;
        _nanoseconds: number;
    };
    meta: {
        userId: string;
        taskId: string;
        username: string;
    };
    body: {
        subType: string;
        new: Record<string, unknown>;
    };
}

export interface User {
    id: string;
    username: string;
}

export interface SearchFieldUser {
    id?: string;
    username?: string;
}

export interface CalendarTileProps {
    activeStartDate: Date;
    date: Date;
    view: string;
}

export interface CalendarClickEvent {
    currentTarget: HTMLElement;
}

export type ProcessedData = [Record<number, string>, Record<number, string>];

export interface TaskDetails {
    startedOn?: number;
    endsOn?: number;
    title?: string;
    github?: {
        issue?: {
            html_url?: string;
        };
    };
}

export interface TaskDetailsResponse {
    data?: {
        taskData?: TaskDetails;
    };
}

type LogsResponse = {
    message?: string;
    data?: LogEntry[];
    next?: string | null;
    prev?: string | null;
};

type GetLogsParams = {
    dev?: boolean;
    type?: string;
    format?: string;
    page?: number;
    size?: number;
    next?: string;
    prev?: string;
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
                    dev = false,
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
