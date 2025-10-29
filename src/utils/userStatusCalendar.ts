import { LogEntry } from '@/app/services/logsApi';

interface LOG_TYPE {
    userId: string;
    data: [];
}

interface LOG_DATA {
    status: string;
    startTime: number;
    endTime: number;
    taskTitle: string;
}

export interface OOOEntry {
    from: number;
    until: number;
    requestId: string;
    message?: string;
    timestamp: number;
    user?: string;
    type: string;
}

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
): [Record<number, OOOEntry[]>, Record<number, string>] => {
    const dictWithOOOEntries: Record<number, OOOEntry[]> = {};
    const dictWithTask: Record<number, string> = {};

    logsData.forEach((logEntry: LogEntry) => {
        const dates = getDatesInRange(
            new Date(logEntry.from),
            new Date(logEntry.until)
        );

        dates.forEach((dateTimestamp) => {
            if (!dictWithOOOEntries[dateTimestamp]) {
                dictWithOOOEntries[dateTimestamp] = [];
            }
            dictWithOOOEntries[dateTimestamp].push(logEntry);
        });
    });

    return [dictWithOOOEntries, dictWithTask];
};

export const processData = (
    itemId: string | null,
    data: [],
    oooLogsData?: LogEntry[]
): [object, object, Record<number, OOOEntry[]>] => {
    if (!itemId) {
        return [{}, {}, {}];
    } else {
        const log: any = data.find((log: LOG_TYPE) => {
            return log.userId === itemId;
        });

        const dictWithStatus: Record<number, string> = {};
        const dictWithTask: Record<number, string> = {};
        const dictWithOOOEntries: Record<number, OOOEntry[]> = {};

        // Process mock data if available
        if (log && log.data?.length > 0) {
            log.data.forEach((logData: LOG_DATA) => {
                const dates = getDatesInRange(
                    new Date(logData.startTime),
                    new Date(logData.endTime)
                );
                if (logData.status === 'ACTIVE') {
                    dates.forEach((dateTimestamp) => {
                        dictWithTask[dateTimestamp] = logData.taskTitle;
                    });
                } else {
                    dates.forEach((dateTimestamp) => {
                        dictWithStatus[dateTimestamp] = logData.status;
                    });
                }
            });
        }

        // Process OOO logs data if available
        if (oooLogsData && oooLogsData.length > 0) {
            const [oooEntries] = processOOOLogsData(oooLogsData);
            Object.assign(dictWithOOOEntries, oooEntries);

            // Also add "OOO" status to dictWithStatus for proper tile styling
            Object.keys(oooEntries).forEach((dateTimestamp) => {
                dictWithStatus[parseInt(dateTimestamp)] = 'OOO';
            });
        }

        return [dictWithStatus, dictWithTask, dictWithOOOEntries];
    }
};
