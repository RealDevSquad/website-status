import { FC, useState } from 'react';
import { useRouter } from 'next/router';
import Head from '@/components/head';
import Layout from '@/components/Layout';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { SearchField } from '@/components/Calendar/UserSearchField';
import { processData, OOOEntry } from '@/utils/userStatusCalendar';
import { formatTimestampToDate } from '@/utils/time';
import { OOO_REQUEST_DETAILS_URL } from '@/constants/url';
import { MONTHS } from '@/constants/calendar';
import { userDataType } from '@/interfaces/user.type';

type ProcessCalendarData = [
    Map<number, string>,
    Map<number, string>,
    Map<number, OOOEntry[]>
];

const UserStatusCalendar: FC = () => {
    const router = useRouter();
    const { dev } = router.query;
    const isDevMode = dev === 'true';

    const [selectedDate, onDateChange] = useState<Date>(new Date());
    const [selectedUser, setSelectedUser] = useState<userDataType | null>(null);
    const [processedData, setProcessedData] = useState<ProcessCalendarData>([
        new Map(),
        new Map(),
        new Map(),
    ]);
    const [message, setMessage] = useState<string | JSX.Element | null>(null);

    const setTileClassName = ({ date }: { date: Date }) => {
        if (date.getDay() === 0) return 'sunday';

        if (processedData[2].has(date.getTime())) {
            return 'OOO';
        }

        return processedData[0].get(date.getTime()) || null;
    };

    const formatOOOMessage = (oooEntries: OOOEntry[]): JSX.Element => {
        return (
            <>
                {oooEntries.map((entry, index) => (
                    <div key={entry.requestId}>
                        {index > 0 && <div style={{ marginTop: '10px' }} />}
                        <div>From: {formatTimestampToDate(entry.from)}</div>
                        <div>Until: {formatTimestampToDate(entry.until)}</div>
                        <div>
                            Request ID:{' '}
                            <a
                                href={`${OOO_REQUEST_DETAILS_URL}${entry.requestId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {entry.requestId}
                            </a>
                        </div>
                        {entry.message && <div>Message: {entry.message}</div>}
                    </div>
                ))}
            </>
        );
    };

    const formatOOODayMessage = (
        value: Date,
        selectedUser: userDataType | null,
        oooEntries: OOOEntry[]
    ): JSX.Element => {
        const dateStr = `${value.getDate()}-${
            MONTHS[value.getMonth()]
        }-${value.getFullYear()}`;
        const userLine = `${selectedUser?.username} is OOO on ${dateStr}`;
        const oooDetails = formatOOOMessage(oooEntries);
        return (
            <div>
                <div>{userLine}</div>
                <div style={{ marginTop: '10px' }}>{oooDetails}</div>
            </div>
        );
    };

    const handleDayClick = (
        value: Date,
        event: React.MouseEvent<HTMLButtonElement>
    ) => {
        if (value.getDay() === 0) {
            setMessage(
                `${value.getDate()}-${
                    MONTHS[value.getMonth()]
                }-${value.getFullYear()} is HOLIDAY(SUNDAY)!`
            );
            return;
        }

        const oooEntries = processedData[2].get(value.getTime());
        if (oooEntries) {
            const message = formatOOODayMessage(
                value,
                selectedUser,
                oooEntries
            );
            setMessage(message);
            return;
        }

        if (event.currentTarget.classList.contains('OOO')) {
            setMessage(
                `${selectedUser?.username} is OOO on ${value.getDate()}-${
                    MONTHS[value.getMonth()]
                }-${value.getFullYear()}`
            );
            return;
        }
        if (event.currentTarget.classList.contains('IDLE')) {
            setMessage(
                `${selectedUser?.username} is IDLE on ${value.getDate()}-${
                    MONTHS[value.getMonth()]
                }-${value.getFullYear()}`
            );
            return;
        }
        const taskTitle = processedData[1].get(value.getTime());
        if (taskTitle) {
            setMessage(
                `${selectedUser?.username} is ACTIVE on ${value.getDate()}-${
                    MONTHS[value.getMonth()]
                }-${value.getFullYear()} having task with title - ${taskTitle}`
            );
            return;
        }

        setMessage(
            `No user status found for ${
                selectedUser?.username
            } on ${value.getDate()}-${
                MONTHS[value.getMonth()]
            }-${value.getFullYear()}!`
        );
    };

    return (
        <Layout>
            <Head title="Calendar | Status Real Dev Squad" />

            <div className="container calendar-container">
                <SearchField
                    onSearchTextSubmitted={(user, data, oooLogsData) => {
                        setSelectedUser(user || null);
                        const processed = processData(
                            user ? user.id : null,
                            data,
                            oooLogsData
                        );
                        setProcessedData(processed);
                        setMessage(null);
                    }}
                    loading={false}
                    dev={isDevMode}
                />
                {selectedUser && (
                    <div className="calendar" data-testid="react-calendar">
                        <Calendar
                            onChange={(value) => {
                                if (value instanceof Date) {
                                    onDateChange(value);
                                }
                            }}
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
