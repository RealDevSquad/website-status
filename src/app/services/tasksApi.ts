import task, {
    TaskRequestPayload,
    TasksResponseType,
    GetAllTaskParamType,
    ExtensionRequestsResponse,
    ExtensionRequestCreatePayload,
    ExtensionRequestCreateResponse,
} from '@/interfaces/task.type';
import { api } from './api';
import { MINE_TASKS_URL, TASKS_URL } from '@/constants/url';
import { TASK_RESULT_SIZE } from '@/constants/constants';

type TasksQueryResponse = { message: string; tasks: task[] };
type TasksCreateMutationResponse = { message: string; task: task };

export const tasksApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getAllTasks: builder.query<TasksResponseType, GetAllTaskParamType>({
            query: ({
                status,
                size = TASK_RESULT_SIZE,
                nextTasks,
                prevTasks,
                assignee,
                title,
                dev,
            }) => {
                const baseQuery = `/tasks?size=${size}&dev=true`;

                let url =
                    !status || status === 'ALL'
                        ? baseQuery
                        : `${baseQuery}&status=${status}`;

                if (assignee) {
                    url += `&assignee=${assignee}`;
                }

                if (title) {
                    url += `&title=${title}`;
                }
                if (dev) {
                    url += '&userFeatureFlag=true';
                }
                if (nextTasks) {
                    url = nextTasks;
                }

                if (prevTasks) {
                    url = prevTasks;
                }

                return { url };
            },
            providesTags: ['Tasks'],
            transformResponse: (response: TasksResponseType) => {
                return {
                    tasks: response.tasks?.sort(
                        (a: task, b: task) => +a.endsOn - +b.endsOn
                    ),
                    next: response.next,
                    prev: response.prev,
                } as TasksResponseType;
            },
        }),

        getMineTasks: builder.query<TasksQueryResponse['tasks'], void>({
            query: () => MINE_TASKS_URL,
            providesTags: ['Mine_Tasks'],
        }),
        addTask: builder.mutation<TasksCreateMutationResponse, Partial<task>>({
            query: (task: task) => ({
                url: TASKS_URL,
                method: 'POST',
                body: task,
            }),
        }),

        updateSelfTask: builder.mutation<void, TaskRequestPayload>({
            query: (task: TaskRequestPayload) => ({
                url: `tasks/self/${task.id}`,
                method: 'PATCH',
                body: task.task,
            }),
            invalidatesTags: (_result, _err, { id }) => [
                {
                    type: 'Tasks',
                    id,
                },
            ],
        }),

        updateTask: builder.mutation<void, TaskRequestPayload>({
            query: ({ task, id }: TaskRequestPayload) => ({
                url: `tasks/${id}`,
                method: 'PATCH',
                body: task,
            }),
            invalidatesTags: (_result, _err, { id }) => [
                {
                    type: 'Tasks',
                    id,
                },
            ],
        }),
        getSelfExtensionRequests: builder.query<
            ExtensionRequestsResponse,
            { taskId: string; dev: boolean }
        >({
            query: ({ taskId, dev }) => ({
                url: '/extension-requests/self',
                params: {
                    taskId,
                    dev,
                },
            }),
            providesTags: ['Extension_Requests'],
        }),
        createExtensionRequest: builder.mutation<
            ExtensionRequestCreateResponse,
            ExtensionRequestCreatePayload & { dev?: boolean }
        >({
            query: (payload) => {
                const { dev, ...requestPayload } = payload;

                return {
                    url: '/extension-requests',
                    method: 'POST',
                    params: { dev: dev ?? true },
                    body: requestPayload,
                };
            },
            invalidatesTags: ['Extension_Requests'],
        }),
    }),
    overrideExisting: true,
});

export const {
    useGetAllTasksQuery,
    useLazyGetAllTasksQuery,
    useGetMineTasksQuery,
    useAddTaskMutation,
    useUpdateTaskMutation,
    useUpdateSelfTaskMutation,
    useGetSelfExtensionRequestsQuery,
    useCreateExtensionRequestMutation,
} = tasksApi;
