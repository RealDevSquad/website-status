import { LogEntry } from '@/app/services/logsApi';

export interface LOG_DATA {
    status: string;
    startTime: number;
    endTime: number;
    taskTitle?: string;
}

export type OOOEntry = LogEntry;

export const getStartOfDay = (date: Date): Date => {
    if (date instanceof Date && !isNaN(date.getTime()))
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate()
    );
};

export const getDatesInRange = (startDate: Date, endDate: Date) => {
    const date = getStartOfDay(startDate);
    const dates = [];

    if (
        !(startDate instanceof Date && !isNaN(startDate.getTime())) ||
        !(endDate instanceof Date && !isNaN(endDate.getTime()))
    )
        return [];

    while (date <= getStartOfDay(endDate)) {
        dates.push(getStartOfDay(date).getTime());
        date.setDate(date.getDate() + 1);
    }

    return dates;
};

export const processOOOLogsData = (
    logsData: LogEntry[]
): [Map<number, OOOEntry[]>, Map<number, string>] => {
    const dictWithOOOEntries = new Map<number, OOOEntry[]>();
    const dictWithTask = new Map<number, string>();

    logsData.forEach((logEntry: LogEntry) => {
        const dates = getDatesInRange(
            new Date(logEntry.from),
            new Date(logEntry.until)
        );

        dates.forEach((dateTimestamp) => {
            const existingEntries = dictWithOOOEntries.get(dateTimestamp);
            if (existingEntries) {
                existingEntries.push(logEntry);
            } else {
                dictWithOOOEntries.set(dateTimestamp, [logEntry]);
            }
        });
    });

    return [dictWithOOOEntries, dictWithTask];
};

export const processData = (
    itemId: string | null,
    data: Array<{ userId: string; data: LOG_DATA[] }>,
    oooLogsData?: LogEntry[]
): [Map<number, string>, Map<number, string>, Map<number, OOOEntry[]>] => {
    if (!itemId) {
        return [new Map(), new Map(), new Map()];
    } else {
        const log: { userId: string; data: LOG_DATA[] } | undefined = data.find(
            (log: { userId: string; data: LOG_DATA[] }) => {
                return log.userId === itemId;
            }
        );

        const dictWithStatus = new Map<number, string>();
        const dictWithTask = new Map<number, string>();
        const dictWithOOOEntries = new Map<number, OOOEntry[]>();

        if (log && log.data?.length > 0) {
            log.data.forEach((logData: LOG_DATA) => {
                const dates = getDatesInRange(
                    new Date(logData.startTime),
                    new Date(logData.endTime)
                );
                if (logData.status === 'ACTIVE') {
                    dates.forEach((dateTimestamp) => {
                        dictWithTask.set(
                            dateTimestamp,
                            logData.taskTitle || ''
                        );
                    });
                } else {
                    dates.forEach((dateTimestamp) => {
                        dictWithStatus.set(dateTimestamp, logData.status);
                    });
                }
            });
        }

        if (oooLogsData && oooLogsData.length > 0) {
            const [oooEntries] = processOOOLogsData(oooLogsData);
            oooEntries.forEach((entries, dateTimestamp) => {
                dictWithOOOEntries.set(dateTimestamp, entries);
            });

            oooEntries.forEach((_, dateTimestamp) => {
                dictWithStatus.set(dateTimestamp, 'OOO');
            });
        }

        return [dictWithStatus, dictWithTask, dictWithOOOEntries];
    }
};
