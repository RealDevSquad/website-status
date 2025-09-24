import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '@/constants/url';

const baseQuery = fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: 'include',
});

export const api = createApi({
    baseQuery,
    /**
     * Tag types must be defined in the original API definition
     * for any tags that would be provided by injected endpoints
     */
    tagTypes: [
        'Users',
        'Status',
        'Tasks',
        'Task_Details',
        'Mine_Tasks',
        'TaskTag',
        'User',
        'Tags',
        'Levels',
        'Challenges',
        'Idle_Users',
        'Progress_Details',
        'User_Standup',
        'TASK_REQUEST',
        'Extension_Requests',
        'Logs',
    ],
    /**
     * This api has endpoints injected in adjacent files,
     * which is why no endpoints are shown below.
     */
    endpoints: () => ({}),
});
