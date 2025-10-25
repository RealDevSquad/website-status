import { FC, useState } from 'react';
import Head from '@/components/head';
import Layout from '@/components/Layout';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { SearchField } from '@/components/Calendar/UserSearchField';
import {
    processData,
    processTaskDetails,
    generateDayClickMessage,
    TaskData,
} from '@/utils/userStatusCalendar';
import { useRouter } from 'next/router';
import {
    useLazyGetLogsQuery,
    TLogEntry,
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
    const username = router?.query?.username as string | undefined;
    const [processedData, setProcessedData] = useState<TProcessedData>([
        {},
        {},
    ]);
    const [taskDataByDate, setTaskDataByDate] = useState<
        Record<number, TaskData>
    >({});
    const [message, setMessage] = useState<JSX.Element | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleDateChange = (value: any) => {
        if (value instanceof Date) onDateChange(value);
    };

    const setTileClassName = ({ date }: TCalendarTileProps) => {
        if (date.getDay() === 0) return 'sunday';
        return processedData[0]?.[date.getTime()] || null;
    };

    const handleDayClick = (value: Date, event: TCalendarClickEvent) => {
        if (!username) return;
        const message = generateDayClickMessage(
            value,
            { id: '', username },
            processedData,
            taskDataByDate,
            event
        );
        setMessage(message);
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

    const handleSearchSubmit = async (
        user: TSearchFieldUser | undefined,
        data: unknown
    ) => {
        if (!user?.username) return;

        router.push({
            query: {
                ...router.query,
                username: user.username,
            },
        });

        if (!dev) {
            setProcessedData(
                processData(user.id || null, data as []) as TProcessedData
            );
            setMessage(null);
            return;
        }

        setIsLoading(true);
        try {
            const userLogs = await fetchUserLogs(user.username);
            if (!userLogs.length) {
                setProcessedData([{}, {}]);
                setMessage(<>{`No logs found for ${user.username}`}</>);
                return;
            }
            const { classByDate, titleByDate, taskDataByDate } =
                processTaskDetails(userLogs);
            setProcessedData([classByDate, titleByDate]);
            setTaskDataByDate(taskDataByDate);
            setMessage(null);
        } catch (e) {
            setMessage(<>Unable to fetch logs right now.</>);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout>
            <Head title="Calendar | Status Real Dev Squad" />
            <div className="container calendar-container">
                <SearchField
                    onSearchTextSubmitted={handleSearchSubmit}
                    loading={isLoading}
                />
                {username && (
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
