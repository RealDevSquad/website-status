import { api } from './api';

export interface TLogEntry {
    user: string;
    taskId: string;
    taskTitle: string;
    type: string;
    userId: string;
    username: string;
    subType: string;
    status: string;
    timestamp: number;
    percentCompleted?: number;
    endsOn?: number;
    extensionRequestId?: string;
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
    size?: number;
    next?: string;
    prev?: string;
    username?: string;
};

export const logsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getLogs: builder.query<TLogsResponse, TGetLogsParams | void>({
            query: (params) => {
                if (params?.next) return { url: params.next };
                if (params?.prev) return { url: params.prev };

                const {
                    dev = false,
                    type = 'task',
                    format,
                    size,
                    username,
                } = params || {};
                return {
                    url: '/logs',
                    params: { dev, type, format, size, username },
                };
            },
            providesTags: [],
        }),
    }),
    overrideExisting: true,
});

export const { useGetLogsQuery, useLazyGetLogsQuery } = logsApi;
