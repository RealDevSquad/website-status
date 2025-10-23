import { FC, useState } from 'react';
import Head from '@/components/head';
import Layout from '@/components/Layout';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { SearchField } from '@/components/Calendar/UserSearchField';
import { processData } from '@/utils/userStatusCalendar';
import { MONTHS } from '@/constants/calendar';
import { useRouter } from 'next/router';
import {
    useLazyGetLogsQuery,
    TLogEntry,
    TUser,
    TSearchFieldUser,
    TCalendarTileProps,
    TCalendarClickEvent,
    TProcessedData,
} from '@/app/services/logsApi';

const UserStatusCalendar: FC = () => {
    const router = useRouter();
    const [triggerGetLogs] = useLazyGetLogsQuery();
    const dev = router?.query?.dev === 'true';

    const [selectedDate, onDateChange] = useState<Date>(new Date());
    const [selectedUser, setSelectedUser] = useState<TUser | null>(null);
    const [processedData, setProcessedData] = useState<TProcessedData>([
        {},
        {},
    ]);
    const [message, setMessage] = useState<string | JSX.Element | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleDateChange = (value: any) => {
        if (value instanceof Date) onDateChange(value);
    };

    const setTileClassName = ({ date }: TCalendarTileProps) => {
        if (date.getDay() === 0) return 'sunday';
        return processedData[0]?.[date.getTime()] || null;
    };

    const handleDayClick = (value: Date, event: TCalendarClickEvent) => {
        if (!selectedUser) return;

        const dateStr = `${value.getDate()}-${
            MONTHS[value.getMonth()]
        }-${value.getFullYear()}`;

        if (value.getDay() === 0) {
            setMessage(`${dateStr} is HOLIDAY(SUNDAY)!`);
            return;
        }

        if (event.currentTarget.classList.contains('OOO')) {
            setMessage(`${selectedUser.username} is OOO on ${dateStr}`);
            return;
        }

        if (event.currentTarget.classList.contains('IDLE')) {
            setMessage(`${selectedUser.username} is IDLE on ${dateStr}`);
            return;
        }

        if (processedData[1]?.[value.getTime()]) {
            const title = processedData[1][value.getTime()];
            setMessage(
                <span>
                    {`${selectedUser.username} is ACTIVE on ${dateStr} having task with title - ${title}`}
                </span>
            );
            return;
        }

        setMessage(
            `No user status found for ${selectedUser.username} on ${dateStr}!`
        );
    };

    const fetchUserLogs = async (username: string): Promise<TLogEntry[]> => {
        const pageData = await triggerGetLogs({
            dev: true,
            type: 'task,extensionRequests,taskRequests,REQUEST_CREATED',
            format: 'feed',
            username: username,
            size: 100,
        }).unwrap();
        return pageData?.data || [];
    };

    const processTaskDetails = (userLogs: TLogEntry[]) => {
        const classByDate: Record<number, string> = {};
        const titleByDate: Record<number, string> = {};

        userLogs.forEach((log: TLogEntry) => {
            if (log.type === 'task' && log.taskId && log.taskTitle) {
                const timestamp = log.timestamp * 1000;
                const logDate = new Date(timestamp);

                if (!isNaN(logDate.getTime())) {
                    const ts = new Date(
                        logDate.getFullYear(),
                        logDate.getMonth(),
                        logDate.getDate()
                    ).getTime();

                    classByDate[ts] = 'ACTIVE';
                    titleByDate[ts] = log.taskTitle;

                    if (log.endsOn) {
                        const endDate = new Date(log.endsOn * 1000);
                        const cursor = new Date(ts);
                        const endDay = new Date(
                            endDate.getFullYear(),
                            endDate.getMonth(),
                            endDate.getDate()
                        );

                        while (cursor.getTime() <= endDay.getTime()) {
                            classByDate[cursor.getTime()] = 'ACTIVE';
                            titleByDate[cursor.getTime()] = log.taskTitle;
                            cursor.setDate(cursor.getDate() + 1);
                        }
                    }
                }
            }
        });

        return { classByDate, titleByDate };
    };

    const handleSearchSubmit = async (
        user: TSearchFieldUser | undefined,
        data: unknown
    ) => {
        if (!user?.username) return;

        setSelectedUser({ id: user.id || '', username: user.username });

        if (dev) {
            setLoading(true);
            try {
                const userLogs = await fetchUserLogs(user.username);
                if (!userLogs.length) {
                    setProcessedData([{}, {}]);
                    setMessage(`No logs found for ${user.username}`);
                    return;
                }
                const { classByDate, titleByDate } =
                    processTaskDetails(userLogs);
                setProcessedData([classByDate, titleByDate]);
                setMessage(null);
            } catch (e) {
                setMessage('Unable to fetch logs right now.');
            } finally {
                setLoading(false);
            }
        } else {
            setProcessedData(
                processData(user.id || null, data as []) as TProcessedData
            );
            setMessage(null);
        }
    };

    return (
        <Layout>
            <Head title="Calendar | Status Real Dev Squad" />
            <div className="container calendar-container">
                <SearchField
                    onSearchTextSubmitted={handleSearchSubmit}
                    loading={loading}
                />
                {selectedUser && (
                    <div className="calendar" data-testid="react-calendar">
                        <Calendar
                            onChange={handleDateChange}
                            className="calendar-div"
                            value={selectedDate}
                            onClickDay={handleDayClick}
                            tileClassName={setTileClassName}
                            view="month"
                        />
                    </div>
                )}
                {!!message && <div className="messageDiv">{message}</div>}
            </div>
        </Layout>
    );
};

export default UserStatusCalendar;
