import { FC, useState } from 'react';
import Head from '@/components/head';
import Layout from '@/components/Layout';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { SearchField } from '@/components/Calendar/UserSearchField';
import { processData } from '@/utils/userStatusCalendar';
import { MONTHS } from '@/constants/calendar';
import { useRouter } from 'next/router';
import fetch from '@/helperFunctions/fetch';
import { TASKS_URL } from '@/constants/url';
import {
    useLazyGetLogsQuery,
    ApiLogEntry,
    User,
    SearchFieldUser,
    CalendarTileProps,
    CalendarClickEvent,
    ProcessedData,
    TaskDetailsResponse,
} from '@/app/services/logsApi';

const UserStatusCalendar: FC = () => {
    const router = useRouter();
    const [triggerGetLogs] = useLazyGetLogsQuery();
    const dev = router?.query?.dev === 'true';
    const [selectedDate, onDateChange] = useState<Date>(new Date());
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [processedData, setProcessedData] = useState<ProcessedData>(
        processData(selectedUser ? selectedUser.id : null, []) as ProcessedData
    );
    const [issueLinkByDate, setIssueLinkByDate] = useState<
        Record<number, string>
    >({});
    const [message, setMessage] = useState<string | JSX.Element | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleDateChange = (value: any) => {
        if (value instanceof Date) {
            onDateChange(value);
        }
    };

    const setTileClassName = ({ date }: CalendarTileProps) => {
        if (date.getDay() === 0) return 'sunday';
        return processedData[0] ? processedData[0][date.getTime()] : null;
    };

    const handleDayClick = (value: Date, event: CalendarClickEvent) => {
        if (!selectedUser) return;

        if (value.getDay() === 0) {
            setMessage(
                `${value.getDate()}-${
                    MONTHS[value.getMonth()]
                }-${value.getFullYear()} is HOLIDAY(SUNDAY)!`
            );
            return;
        }
        if (event.currentTarget.classList.contains('OOO')) {
            setMessage(
                `${selectedUser.username} is OOO on ${value.getDate()}-${
                    MONTHS[value.getMonth()]
                }-${value.getFullYear()}`
            );
            return;
        }
        if (event.currentTarget.classList.contains('IDLE')) {
            setMessage(
                `${selectedUser.username} is IDLE on ${value.getDate()}-${
                    MONTHS[value.getMonth()]
                }-${value.getFullYear()}`
            );
            return;
        }
        if (processedData[1] && processedData[1][value.getTime()]) {
            const ts = value.getTime();
            const title = processedData[1][ts];
            const link = issueLinkByDate[ts];
            setMessage(
                <span>
                    {`${
                        selectedUser.username
                    } is ACTIVE on ${value.getDate()}-${
                        MONTHS[value.getMonth()]
                    }-${value.getFullYear()} having task with title - ${title}`}
                    {link ? (
                        <>
                            <br />
                            <a href={link} target="_blank" rel="noreferrer">
                                Open GitHub issue ↗
                            </a>
                        </>
                    ) : null}
                </span>
            );
            return;
        }

        setMessage(
            `No user status found for ${
                selectedUser.username
            } on ${value.getDate()}-${
                MONTHS[value.getMonth()]
            }-${value.getFullYear()}!`
        );
    };

    const toMs = (value: number): number => {
        const num = Number(value);
        if (!num) return 0;
        return num < 1e12 ? num * 1000 : num;
    };

    const fetchUserLogs = async (username: string): Promise<ApiLogEntry[]> => {
        const pageSize = 100;
        let pageData = await triggerGetLogs({
            dev: true,
            type: 'task',
            size: pageSize,
        }).unwrap();

        let aggregated: ApiLogEntry[] = (pageData?.data ||
            []) as unknown as ApiLogEntry[];
        let nextPath: string | null = pageData?.next || null;
        let pageCount = 0;

        let userLogs = aggregated.filter(
            (l: ApiLogEntry) => l?.meta?.username === username
        );

        while (!userLogs.length && nextPath && pageCount < 5) {
            pageData = await triggerGetLogs({ next: nextPath }).unwrap();
            const pageLogs = (pageData?.data || []) as unknown as ApiLogEntry[];
            aggregated = aggregated.concat(pageLogs);

            const pageUserLogs = pageLogs.filter(
                (l: ApiLogEntry) => l?.meta?.username === username
            );
            if (pageUserLogs.length) {
                userLogs = pageUserLogs;
                break;
            }

            nextPath = pageData?.next || null;
            pageCount += 1;
        }

        return userLogs;
    };

    const processTaskDetails = async (userLogs: ApiLogEntry[]) => {
        const uniqueTaskIds: string[] = Array.from(
            new Set(
                userLogs
                    .map((l: ApiLogEntry) => l?.meta?.taskId)
                    .filter(Boolean)
            )
        );

        const classByDate: Record<number, string> = {};
        const titleByDate: Record<number, string> = {};
        const linkByDate: Record<number, string> = {};

        const detailPromises = uniqueTaskIds.map(async (taskId) => {
            const { requestPromise: taskPromise } = fetch({
                url: `${TASKS_URL}/${taskId}/details`,
            });
            const taskRes = (await taskPromise) as TaskDetailsResponse;
            const taskData = taskRes?.data?.taskData || {};
            const startedOn = toMs(taskData?.startedOn || 0);
            const endsOn = toMs(taskData?.endsOn || 0);
            const title = taskData?.title || '';
            const issueUrl = taskData?.github?.issue?.html_url || '';

            if (!startedOn || !endsOn) return;

            const start = new Date(startedOn);
            const end = new Date(endsOn);
            const cursor = new Date(
                start.getFullYear(),
                start.getMonth(),
                start.getDate()
            );
            const endDay = new Date(
                end.getFullYear(),
                end.getMonth(),
                end.getDate()
            );

            while (cursor.getTime() <= endDay.getTime()) {
                const ts = cursor.getTime();
                classByDate[ts] = 'ACTIVE';
                titleByDate[ts] = title;
                if (issueUrl) linkByDate[ts] = issueUrl;
                cursor.setDate(cursor.getDate() + 1);
            }
        });

        await Promise.allSettled(detailPromises);
        return { classByDate, titleByDate, linkByDate };
    };

    const handleSearchSubmit = async (
        user: SearchFieldUser | undefined,
        data: unknown
    ) => {
        if (!user || !user.username) return;
        const userObj: User = {
            id: user.id || '',
            username: user.username,
        };
        setSelectedUser(userObj);

        if (dev) {
            setLoading(true);
            try {
                const userLogs = await fetchUserLogs(user?.username);

                if (!userLogs.length) {
                    setProcessedData([{}, {}] as ProcessedData);
                    setMessage(`No logs found for ${user?.username}`);
                    return;
                }

                const { classByDate, titleByDate, linkByDate } =
                    await processTaskDetails(userLogs);

                setProcessedData([classByDate, titleByDate] as ProcessedData);
                setIssueLinkByDate(linkByDate);
                setMessage(null);
            } catch (e) {
                setMessage('Unable to fetch logs right now.');
            } finally {
                setLoading(false);
            }
        } else {
            setProcessedData(
                processData(user?.id || null, data as []) as ProcessedData
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
