import React from 'react';
import {
    TLogEntry,
    TUser,
    TProcessedData,
    TCalendarClickEvent,
} from '@/app/services/logsApi';
import { MONTHS } from '@/constants/calendar';
import getDateInString from '@/helperFunctions/getDateInString';

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

export type TaskData = {
    taskId: string;
    taskTitle: string;
    startedOn: number;
    endsOn?: number;
};

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

export const processData = (
    itemId: string | null,
    data: []
): [object, object] => {
    if (!itemId) {
        return [{}, {}];
    } else {
        const log: any = data.find((log: LOG_TYPE) => {
            return log.userId === itemId;
        });
        if (!log || log.data?.length == 0) return [{}, {}];
        const dictWithStatus: Record<number, string> = {};
        const dictWithTask: Record<number, string> = {};
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
        return [dictWithStatus, dictWithTask];
    }
};

const populateDateRange = (
    startDayKey: number,
    endTimestamp: number,
    taskData: {
        taskId: string;
        taskTitle: string;
        startedOn: number;
        endsOn?: number;
    },
    classByDate: Record<number, string>,
    titleByDate: Record<number, string>,
    taskDataByDate: Record<number, TaskData>
) => {
    const endDate = new Date(endTimestamp * 1000);
    const cursor = new Date(startDayKey);
    const endDay = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate()
    );

    while (cursor.getTime() <= endDay.getTime()) {
        classByDate[cursor.getTime()] = 'ACTIVE';
        titleByDate[cursor.getTime()] = taskData.taskTitle;
        taskDataByDate[cursor.getTime()] = taskData;
        cursor.setDate(cursor.getDate() + 1);
    }
};

const processLogEntry = (
    log: TLogEntry,
    classByDate: Record<number, string>,
    titleByDate: Record<number, string>,
    taskDataByDate: Record<number, TaskData>
) => {
    if (log.type !== 'task' || !log.taskId || !log.taskTitle) {
        return;
    }

    const timestamp = log.timestamp * 1000;
    const logDate = new Date(timestamp);

    if (isNaN(logDate.getTime())) {
        return;
    }

    const logDayKey = new Date(
        logDate.getFullYear(),
        logDate.getMonth(),
        logDate.getDate()
    ).getTime();

    classByDate[logDayKey] = 'ACTIVE';
    titleByDate[logDayKey] = log.taskTitle;
    taskDataByDate[logDayKey] = {
        taskId: log.taskId,
        taskTitle: log.taskTitle,
        startedOn: timestamp,
        endsOn: log.endsOn,
    };

    if (log.endsOn) {
        populateDateRange(
            logDayKey,
            log.endsOn,
            taskDataByDate[logDayKey],
            classByDate,
            titleByDate,
            taskDataByDate
        );
    }
};

export const processTaskDetails = (userLogs: TLogEntry[]) => {
    const classByDate: Record<number, string> = {};
    const titleByDate: Record<number, string> = {};
    const taskDataByDate: Record<number, TaskData> = {};

    userLogs.forEach((log) => {
        processLogEntry(log, classByDate, titleByDate, taskDataByDate);
    });

    return { classByDate, titleByDate, taskDataByDate };
};

export const generateDayClickMessage = (
    date: Date,
    selectedUser: TUser,
    processedData: TProcessedData,
    taskDataByDate: Record<number, TaskData>,
    event: TCalendarClickEvent
): JSX.Element => {
    const dateStr = `${date.getDate()}-${
        MONTHS[date.getMonth()]
    }-${date.getFullYear()}`;

    if (date.getDay() === 0) {
        return React.createElement(
            'span',
            null,
            `${dateStr} is HOLIDAY(SUNDAY)!`
        );
    }

    if (event.currentTarget.classList.contains('OOO')) {
        return React.createElement(
            'span',
            null,
            `${selectedUser.username} is OOO on ${dateStr}`
        );
    }

    if (event.currentTarget.classList.contains('IDLE')) {
        return React.createElement(
            'span',
            null,
            `${selectedUser.username} is IDLE on ${dateStr}`
        );
    }

    if (processedData[1]?.[date.getTime()]) {
        const taskData = taskDataByDate[date.getTime()];
        if (taskData) {
            const startDate = getDateInString(new Date(taskData.startedOn));
            const endDate = taskData.endsOn
                ? getDateInString(new Date(taskData.endsOn * 1000))
                : 'Not specified';
            const taskLink = `https://status.realdevsquad.com/tasks/${taskData.taskId}`;

            return React.createElement(
                'div',
                null,
                React.createElement(
                    'p',
                    null,
                    `${selectedUser.username} is ACTIVE on ${dateStr}`
                ),
                React.createElement(
                    'ul',
                    null,
                    React.createElement(
                        'li',
                        null,
                        `Task: ${taskData.taskTitle}`
                    ),
                    React.createElement('li', null, `Start Date: ${startDate}`),
                    React.createElement('li', null, `End Date: ${endDate}`),
                    React.createElement(
                        'li',
                        null,
                        'Link: ',
                        React.createElement(
                            'a',
                            {
                                href: taskLink,
                                target: '_blank',
                                rel: 'noopener noreferrer',
                            },
                            taskLink
                        )
                    )
                )
            );
        } else {
            const title = processedData[1][date.getTime()];
            return React.createElement(
                'span',
                null,
                `${selectedUser.username} is ACTIVE on ${dateStr} having task with title - ${title}`
            );
        }
    }

    return React.createElement(
        'span',
        null,
        `No user status found for ${selectedUser.username} on ${dateStr}!`
    );
};
