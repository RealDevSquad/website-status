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
import { useLazyGetLogsQuery } from '@/app/services/logsApi';

interface TaskLog {
    user: string;
    taskId: string;
    taskTitle: string;
    type: string;
    userId: string;
    username: string;
    subType: string;
    status?: string;
    percentCompleted?: number;
    endsOn?: number;
    timestamp: number;
}

const UserStatusCalendar: FC = () => {
    const router = useRouter();
    const dev = router?.query?.dev === 'true';
    const [selectedDate, onDateChange] = useState<Date>(new Date());
    const [selectedUser, setSelectedUser]: any = useState(null);
    const [processedData, setProcessedData] = useState<any>(
        processData(selectedUser ? selectedUser.id : null, [])
    );

    const [issueLinkByDate, setIssueLinkByDate] = useState<
        Record<number, string>
    >({});

    const [message, setMessage]: any = useState(null);
    const [loading, setLoading]: any = useState(false);
    const [triggerGetLogs] = useLazyGetLogsQuery();

    const setTileClassName = ({ activeStartDate, date, view }: any) => {
        if (date.getDay() === 0) return 'sunday';
        return processedData[0] ? processedData[0][date.getTime()] : null;
    };

    const handleDayClick = (value: Date, event: any) => {
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

    // Extract pagination logic for fetching user logs
    const fetchUserLogs = async (username: string) => {
        const pageSize = 100;
        let pageData = await triggerGetLogs({
            dev: true,
            type: 'task',
            size: pageSize,
        }).unwrap();

        let aggregated: TaskLog[] = pageData?.data || [];
        let nextPath: string | null = pageData?.next || null;
        let pageCount = 0;

        let userLogs = aggregated.filter(
            (l: any) => l?.meta?.username === username
        );

        while (!userLogs.length && nextPath && pageCount < 5) {
            pageData = await triggerGetLogs({ next: nextPath }).unwrap();
            const pageLogs = pageData?.data || [];
            aggregated = aggregated.concat(pageLogs);

            const pageUserLogs = pageLogs.filter(
                (l: any) => l?.meta?.username === username
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

    // Extract task processing logic
    const processTaskDetails = async (userLogs: any[]) => {
        const uniqueTaskIds: string[] = Array.from(
            new Set(userLogs.map((l: any) => l?.meta?.taskId).filter(Boolean))
        );

        const classByDate: Record<number, string> = {};
        const titleByDate: Record<number, string> = {};
        const linkByDate: Record<number, string> = {};

        const detailPromises = uniqueTaskIds.map(async (taskId) => {
            const { requestPromise: taskPromise } = fetch({
                url: `${TASKS_URL}/${taskId}/details`,
            });
            const taskRes = await taskPromise;
            const taskData = taskRes?.data?.taskData || {};
            const startedOn = toMs(taskData?.startedOn);
            const endsOn = toMs(taskData?.endsOn);
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

    // Extract fallback log processing
    const processFallbackLogs = (userLogs: TaskLog[]) => {
        const classByDate: Record<number, string> = {};
        const titleByDate: Record<number, string> = {};

        userLogs.forEach((l: TaskLog) => {
            const tsMs = toMs(l?.timestamp);
            if (!tsMs) return;
            const d = new Date(tsMs);
            const dayTs = new Date(
                d.getFullYear(),
                d.getMonth(),
                d.getDate()
            ).getTime();
            classByDate[dayTs] = 'ACTIVE';
            const tId = l?.taskId || '';
            titleByDate[dayTs] = tId;
        });

        return { classByDate, titleByDate };
    };

    const onSubmitDevFlow = async (user: any) => {
        setLoading(true);

        try {
            // Step 1: Fetch user logs with pagination
            const userLogs = await fetchUserLogs(user?.username);

            if (!userLogs.length) {
                setProcessedData([{}, {}]);
                setMessage(`No logs found for ${user?.username}`);
                return;
            }

            // Step 2: Process task details to get calendar data
            const { classByDate, titleByDate, linkByDate } =
                await processTaskDetails(userLogs);

            // Step 3: Use fallback processing if no task details found
            let finalClassByDate = classByDate;
            let finalTitleByDate = titleByDate;
            const finalLinkByDate = linkByDate;

            if (!Object.keys(classByDate).length) {
                const fallbackData = processFallbackLogs(userLogs);
                finalClassByDate = fallbackData.classByDate;
                finalTitleByDate = fallbackData.titleByDate;
            }

            // Step 4: Update UI with processed data
            setProcessedData([finalClassByDate, finalTitleByDate]);
            setIssueLinkByDate(finalLinkByDate);
            setMessage(null);
        } catch (e) {
            setMessage('Unable to fetch logs right now.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <Head title="Calendar | Status Real Dev Squad" />

            <div className="container calendar-container">
                <SearchField
                    onSearchTextSubmitted={async (user, data) => {
                        setSelectedUser(user);
                        if (dev) {
                            await onSubmitDevFlow(user);
                        } else {
                            setProcessedData(
                                processData(user ? user.id : null, data)
                            );
                            setMessage(null);
                        }
                    }}
                    loading={loading}
                />
                {selectedUser && (
                    <div className="calendar" data-testid="react-calendar">
                        <Calendar
                            onChange={onDateChange as any}
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
