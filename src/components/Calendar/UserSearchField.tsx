import { useState, useEffect, ChangeEvent, useRef } from 'react';
import { useRouter } from 'next/router';
import classNames from './UserSearchField.module.scss';
import { useGetAllUsersQuery } from '@/app/services/usersApi';
import { useLazyGetLogsQuery } from '@/app/services/logsApi';
import { logs } from '@/constants/calendar';
import { userDataType } from '@/interfaces/user.type';
import { useOutsideAlerter } from '@/hooks/useOutsideAlerter';

type LogEntry = {
    type: string;
    timestamp?: string | number;
    from?: string | number;
    until?: string | number;
    taskTitle?: string;
};

type SearchFieldProps = {
    onSearchTextSubmitted: (
        user: userDataType | undefined,
        data: CalendarData[]
    ) => void;
    loading: boolean;
};

type CalendarData = {
    userId: string;
    data: {
        startTime: number | undefined;
        endTime: number | undefined;
        status: string;
    }[];
};

const SearchField = ({ onSearchTextSubmitted, loading }: SearchFieldProps) => {
    const router = useRouter();
    const isDevMode = router.query.dev === 'true';

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

    const toMs = (value?: number | string) => {
        if (typeof value === 'string') {
            const parsed = Date.parse(value);
            return isNaN(parsed) ? undefined : parsed;
        }
        if (typeof value !== 'number') return undefined as unknown as number;
        return value >= 1e12 ? value : value * 1000;
    };

    const [triggerGetLogs, { isFetching: isLogsFetching }] =
        useLazyGetLogsQuery();

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

        // Feature flag: Use different data sources based on dev mode
        if (!isDevMode) {
            // Non-dev mode: Use mock data from constants (original behavior)
            const userData = data.find((item: any) => item.userId === user.id);
            onSearchTextSubmitted(user, userData ? [userData] : []);
            return;
        }

        // Dev mode: Fetch real OOO data from logs API
        const logsResult = await triggerGetLogs({
            username: user.username || undefined,
            type: 'REQUEST_CREATED',
            format: 'feed',
            dev: true,
        });

        const logsResponse = logsResult.data;

        const oooEntries = (logsResponse?.data || [])
            .filter((log: LogEntry) => log && log.type === 'REQUEST_CREATED')
            .map((log: LogEntry) => ({
                startTime: toMs(log.from),
                endTime: toMs(log.until),
                status: 'OOO',
            }))
            .filter((e) => e.startTime && e.endTime);

        const mapped = [
            {
                userId: user.id,
                data: oooEntries,
            },
        ];

        onSearchTextSubmitted(user, mapped);
    };

    const { data: userData, isError, isLoading } = useGetAllUsersQuery();
    const [usersList, setUsersList] = useState<userDataType[]>([]);
    const [displayList, setDisplayList] = useState<userDataType[]>([]);
    const [data, setData] = useState([]);

    useEffect(() => {
        if (userData?.users) {
            const users: userDataType[] = userData.users;
            const filteredUsers: userDataType[] = users.filter(
                (user: userDataType) => !user.incompleteUserDetails
            );
            const logData: any = filteredUsers.map((user: userDataType) => {
                const log = logs[Math.floor(Math.random() * 4)];
                return {
                    data: log,
                    userId: user.id,
                };
            });
            setData(logData);
            setUsersList(filteredUsers);
        }
    }, [isLoading, userData]);

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
                    loading || !(searchText ?? '').trim() || !isValidUsername()
                }
            >
                Submit
            </button>
        </form>
    );
};
export { SearchField };
