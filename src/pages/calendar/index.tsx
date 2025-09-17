import { FC, useState } from 'react';
import Head from '@/components/head';
import Layout from '@/components/Layout';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { SearchField } from '@/components/Calendar/UserSearchField';
import { processData } from '@/utils/userStatusCalendar';
import { MONTHS } from '@/constants/calendar';

const UserStatusCalendar: FC = () => {
    const [selectedDate, onDateChange] = useState<Date>(new Date());
    const [selectedUser, setSelectedUser]: any = useState(null);
    const [processedData, setProcessedData] = useState<any>(
        processData(selectedUser ? selectedUser.id : null, [])
    );

    const [message, setMessage]: any = useState(null);
    const [loading, setLoading]: any = useState(false);

    const setTileClassName = ({ activeStartDate, date, view }: any) => {
        if (date.getDay() === 0) return 'sunday';
        const time = date.getTime();
        // If there is a task on this date, mark as ACTIVE (green)
        if (processedData[1] && processedData[1][time]) return 'ACTIVE';
        // Otherwise fall back to status classes like OOO/IDLE
        return processedData[0] ? processedData[0][time] : null;
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
            const title = processedData[1][value.getTime()];
            const url = processedData[2]
                ? processedData[2][value.getTime()]
                : undefined;
            const linkText = url ? ` (Link: ${url})` : '';
            setMessage(
                `${selectedUser.username} is ACTIVE on ${value.getDate()}-${
                    MONTHS[value.getMonth()]
                }-${value.getFullYear()} having task with title - ${title}${linkText}`
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

    return (
        <Layout>
            <Head title="Calendar | Status Real Dev Squad" />

            <div className="container calendar-container">
                <SearchField
                    onSearchTextSubmitted={(user, data) => {
                        setSelectedUser(user);
                        setProcessedData(
                            processData(user ? user.id : null, data)
                        );
                        setMessage(null);
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
