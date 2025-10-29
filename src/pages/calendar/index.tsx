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

const UserStatusCalendar: FC = () => {
    const router = useRouter();
    const { dev } = router.query;
    const isDevMode = dev === 'true';

    const [selectedDate, onDateChange] = useState<Date>(new Date());
    const [selectedUser, setSelectedUser] = useState<userDataType | null>(null);
    const [processedData, setProcessedData] = useState<
        [
            Record<number, string>,
            Record<number, string>,
            Record<number, OOOEntry[]>
        ]
    >([{}, {}, {}] as [
        Record<number, string>,
        Record<number, string>,
        Record<number, OOOEntry[]>
    ]);

    const [message, setMessage] = useState<string | JSX.Element | null>(null);

    const setTileClassName = ({ date }: { date: Date }) => {
        if (date.getDay() === 0) return 'sunday';

        // Check for OOO entries first (new API data)
        if (processedData[2] && processedData[2][date.getTime()]) {
            return 'OOO';
        }

        // Check for existing status (mock data)
        return processedData[0] ? processedData[0][date.getTime()] : null;
    };

    const formatOOOMessage = (oooEntries: OOOEntry[]): string => {
        return oooEntries
            .map((entry) => {
                const fromDate = formatTimestampToDate(entry.from);
                const untilDate = formatTimestampToDate(entry.until);
                const requestLink = `${OOO_REQUEST_DETAILS_URL}`;

                let messageText = `From: ${fromDate}\nUntil: ${untilDate}\nRequest ID: `;
                messageText += `<a href="${requestLink}" target="_blank" rel="noopener noreferrer">${entry.requestId}</a>`;

                if (entry.message) {
                    messageText += `\nMessage: ${entry.message}`;
                }

                return messageText;
            })
            .join('\n\n---\n\n');
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

        // Check for OOO entries first (new feature)
        if (processedData[2] && processedData[2][value.getTime()]) {
            const oooEntries = processedData[2][value.getTime()];
            const formattedMessage = formatOOOMessage(oooEntries);
            setMessage(
                <div>
                    <div>{`${
                        selectedUser?.username
                    } is OOO on ${value.getDate()}-${
                        MONTHS[value.getMonth()]
                    }-${value.getFullYear()}`}</div>
                    <div
                        style={{ marginTop: '10px', whiteSpace: 'pre-line' }}
                        dangerouslySetInnerHTML={{ __html: formattedMessage }}
                    />
                </div>
            );
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
        if (processedData[1] && processedData[1][value.getTime()]) {
            setMessage(
                `${selectedUser?.username} is ACTIVE on ${value.getDate()}-${
                    MONTHS[value.getMonth()]
                }-${value.getFullYear()} having task with title - ${
                    processedData[1][value.getTime()]
                }`
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
                        setProcessedData(
                            processed as [
                                Record<number, string>,
                                Record<number, string>,
                                Record<number, OOOEntry[]>
                            ]
                        );
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
