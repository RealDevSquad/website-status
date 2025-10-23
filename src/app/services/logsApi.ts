import { api } from './api';

export type TLogEntry = {
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

export interface TApiLogEntry {
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

export interface TUser {
    id: string;
    username: string;
}

export interface TSearchFieldUser {
    id?: string;
    username?: string;
}

export interface TCalendarTileProps {
    activeStartDate: Date;
    date: Date;
    view: string;
}

export interface TCalendarClickEvent {
    currentTarget: HTMLElement;
}

export type TProcessedData = [Record<number, string>, Record<number, string>];

export interface TTaskDetails {
    startedOn?: number;
    endsOn?: number;
    title?: string;
    github?: {
        issue?: {
            html_url?: string;
        };
    };
}

export interface TTaskDetailsResponse {
    data?: {
        taskData?: TTaskDetails;
    };
}

type TLogsResponse = {
    message?: string;
    data?: TLogEntry[];
    next?: string | null;
    prev?: string | null;
};

type TGetLogsParams = {
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
        getLogs: builder.query<TLogsResponse, TGetLogsParams | void>({
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
