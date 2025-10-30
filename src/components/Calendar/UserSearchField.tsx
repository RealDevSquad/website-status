import { useState, useEffect, ChangeEvent, useRef, useMemo } from 'react';
import classNames from './UserSearchField.module.scss';
import { useGetAllUsersQuery } from '@/app/services/usersApi';
import { useGetLogsByUsernameQuery } from '@/app/services/logsApi';
import { logs } from '@/constants/calendar';
import { userDataType } from '@/interfaces/user.type';
import { useOutsideAlerter } from '@/hooks/useOutsideAlerter';
import { LogEntry } from '@/app/services/logsApi';

type SearchFieldProps = {
    onSearchTextSubmitted: (
        user: userDataType | undefined,
        data: any,
        oooLogsData?: LogEntry[]
    ) => void;
    loading: boolean;
    dev?: boolean;
};

const SearchField = ({
    onSearchTextSubmitted,
    loading,
    dev = false,
}: SearchFieldProps) => {
    const handleOutsideClick = () => {
        setDisplayList([]);
    };
    const suggestionInputRef = useRef(null);
    useOutsideAlerter(suggestionInputRef, handleOutsideClick);
    const [searchText, setSearchText] = useState<string>('');
    const [selectedUser, setSelectedUser] = useState<userDataType | null>(null);
    const lastProcessedUsername = useRef<string | null>(null);

    const onSearchTextChanged = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
        filterUser(e.target.value);
    };

    const handleOnSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setDisplayList([]);
        const user = usersList.find(
            (user: userDataType) => user.username === searchText
        );
        setSelectedUser(user || null);
        lastProcessedUsername.current = null;
        onSearchTextSubmitted(user, data);
    };

    const { data: userData, isError, isLoading } = useGetAllUsersQuery();
    const [usersList, setUsersList] = useState<userDataType[]>([]);
    const [displayList, setDisplayList] = useState<userDataType[]>([]);
    const [data, setData] = useState([]);

    const queryParams = useMemo(
        () => ({
            username: selectedUser?.username || '',
        }),
        [selectedUser?.username]
    );

    const { data: logsData } = useGetLogsByUsernameQuery(queryParams, {
        skip: !dev || !selectedUser?.username,
    });

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

    useEffect(() => {
        if (
            dev &&
            logsData?.data &&
            selectedUser &&
            lastProcessedUsername.current !== selectedUser.username
        ) {
            lastProcessedUsername.current = selectedUser.username || null;
            onSearchTextSubmitted(selectedUser, data, logsData.data);
        }
    }, [dev, logsData, selectedUser, data]);

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
