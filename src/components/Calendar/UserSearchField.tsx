import { useState, useEffect, ChangeEvent, useRef } from 'react';
import classNames from './UserSearchField.module.scss';
import { useGetAllUsersQuery } from '@/app/services/usersApi';
import { userDataType } from '@/interfaces/user.type';
import { useOutsideAlerter } from '@/hooks/useOutsideAlerter';
import { useLazyGetLogsQuery } from '@/app/services/logsApi';
import { useLazyGetAllTasksQuery } from '@/app/services/tasksApi';

type SearchFieldProps = {
    onSearchTextSubmitted: (user: userDataType | undefined, data: any) => void;
    loading: boolean;
};

const SearchField = ({ onSearchTextSubmitted, loading }: SearchFieldProps) => {
    const handleOutsideClick = () => {
        setDisplayList([]);
    };
    const suggestionInputRef = useRef(null);
    useOutsideAlerter(suggestionInputRef, handleOutsideClick);
    const [searchText, setSearchText] = useState<string>('');
    const onSearchTextChanged = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
        filterUser(e.target.value);
    };

    const { data: userData, isLoading: isUsersLoading } = useGetAllUsersQuery();
    const [usersList, setUsersList] = useState<userDataType[]>([]);
    const [displayList, setDisplayList] = useState<userDataType[]>([]);

    const [triggerGetLogs, { isFetching: isLogsFetching }] =
        useLazyGetLogsQuery();
    const [triggerGetTasks, { isFetching: isTasksFetching }] =
        useLazyGetAllTasksQuery();

    const toMs = (value?: number | string) => {
        if (typeof value === 'string') {
            const parsed = Date.parse(value);
            return isNaN(parsed) ? undefined : parsed;
        }
        if (typeof value !== 'number') return undefined as unknown as number;
        return value >= 1e12 ? value : value * 1000;
    };

    const handleOnSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setDisplayList([]);
        const user = usersList.find(
            (user: userDataType) => user.username === searchText
        );

        if (!user) {
            onSearchTextSubmitted(undefined, []);
            return;
        }

        // Fetch logs (events) and tasks (continuous ranges). Try tasks by both userId and username.
        const [logsResult, tasksByIdResult, tasksByUsernameResult] =
            await Promise.all([
                triggerGetLogs({
                    username: user.username || undefined,
                    type: ['task', 'REQUEST_CREATED'].join(','),
                    format: 'feed',
                    dev: true,
                }),
                triggerGetTasks({ assignee: user.id }),
                triggerGetTasks({ assignee: user.username || '' }),
            ]);

        const logsResponse = logsResult.data;
        const tasksById = tasksByIdResult.data?.tasks || [];
        const tasksByUsername = tasksByUsernameResult.data?.tasks || [];

        // Merge and de-duplicate tasks by id
        const taskMap: Record<string, any> = {};
        [...tasksById, ...tasksByUsername].forEach((t: any) => {
            if (t?.id) taskMap[t.id] = t;
        });
        const mergedTasks = Object.values(taskMap);

        const eventEntries = (logsResponse?.data || [])
            .filter((log: any) => !!log)
            .map((log: any) => {
                // OOO ranges
                if (log.type === 'REQUEST_CREATED' && log.from && log.until) {
                    return {
                        startTime: toMs(log.from),
                        endTime: toMs(log.until),
                        status: 'OOO',
                    };
                }
                // Task events => single-day ACTIVE
                if (log.type === 'task') {
                    const ts = toMs(log.timestamp);
                    return {
                        startTime: ts,
                        endTime: ts,
                        status: 'ACTIVE',
                        taskTitle: log.taskTitle,
                    };
                }
                return null;
            })
            .filter(Boolean);

        const taskRangeEntries = mergedTasks
            .filter((t: any) => t)
            .map((t: any) => {
                const start = toMs(t.startedOn);
                const end = toMs(t.endsOn);
                const taskUrl = t.github?.issue?.html_url || undefined;
                return {
                    startTime: start,
                    endTime: end ?? start,
                    status: 'ACTIVE',
                    taskTitle: t.title,
                    taskUrl,
                };
            })
            .filter((e: any) => e.startTime);

        const calendarDataForUser = [...eventEntries, ...taskRangeEntries];

        const mapped = [
            {
                userId: user.id,
                data: calendarDataForUser,
            },
        ];

        onSearchTextSubmitted(user, mapped);
    };

    useEffect(() => {
        if (userData?.users) {
            const users: userDataType[] = userData.users;
            const filteredUsers: userDataType[] = users.filter(
                (user: userDataType) => !user.incompleteUserDetails
            );
            setUsersList(filteredUsers);
        }
    }, [isUsersLoading, userData]);

    const isValidUsername = () => {
        const usernames = usersList.map((user: userDataType) => user.username);
        if (usernames.includes(searchText)) {
            return true;
        }
        return false;
    };

    const filterUser = (searchText: string) => {
        if (searchText === '') {
            setDisplayList([]);
            return;
        }
        setDisplayList(
            usersList.filter((user: userDataType) => {
                return user.username
                    ?.toLowerCase()
                    .includes(searchText.toLowerCase());
            })
        );
    };

    return (
        <form
            className={classNames.userSearchFieldContainer}
            onSubmit={(e) => {
                handleOnSubmit(e);
            }}
            data-testid="issue-form"
            ref={suggestionInputRef}
        >
            <input
                placeholder="Enter username"
                type="text"
                value={searchText}
                onChange={onSearchTextChanged}
                className={classNames.userSearchInput}
                onFocus={() => {
                    filterUser(searchText);
                }}
            />
            <ul className={classNames.suggestions}>
                {displayList.map((user: userDataType) => (
                    <li
                        key={user.id}
                        className={classNames.suggestion}
                        onClick={() => {
                            setSearchText(user.username || '');
                            setDisplayList([]);
                        }}
                    >
                        {user.username}
                    </li>
                ))}
            </ul>
            <button
                className={classNames.userSearchSubmitButton}
                disabled={
                    loading ||
                    isLogsFetching ||
                    isTasksFetching ||
                    !(searchText ?? '').trim() ||
                    !isValidUsername()
                }
            >
                Submit
            </button>
        </form>
    );
};
export { SearchField };
