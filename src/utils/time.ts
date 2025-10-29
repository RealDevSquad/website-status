export const getDateRelativeToToday = (
    daysFromToday: number,
    format: 'timestamp' | 'formattedDate'
): number | string => {
    const today = new Date();
    const calculatedDate = new Date(today);
    calculatedDate.setDate(today.getDate() + daysFromToday);
    if (format === 'timestamp') {
        return calculatedDate.getTime() / 1000;
    } else if (format === 'formattedDate') {
        // Converting the date to a string in the "yyyy-mm-dd" format
        return `${calculatedDate.getFullYear()}-${(
            calculatedDate.getMonth() + 1
        )
            .toString()
            .padStart(2, '0')}-${calculatedDate
            .getDate()
            .toString()
            .padStart(2, '0')}`;
    } else {
        throw new Error(
            'Invalid format parameter. Use "timestamp" or "formattedDate".'
        );
    }
};

export const formatTimestampToDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ];

    return `${
        months[date.getMonth()]
    } ${date.getDate()}, ${date.getFullYear()}`;
};
