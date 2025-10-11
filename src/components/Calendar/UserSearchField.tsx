import { useState, useEffect, ChangeEvent, useRef } from 'react';
import classNames from './UserSearchField.module.scss';
import { useGetAllUsersQuery } from '@/app/services/usersApi';
import { logs } from '@/constants/calendar';
import { userDataType } from '@/interfaces/user.type';
import { useOutsideAlerter } from '@/hooks/useOutsideAlerter';

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

    const handleOnSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setDisplayList([]);
        const user = usersList.find(
            (user: userDataType) => user.username === searchText
        );
        onSearchTextSubmitted(user, data);
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
