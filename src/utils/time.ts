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

export const toMs = (value: number): number => {
    const num = Number(value);
    if (!num) return 0;
    return num < 1e12 ? num * 1000 : num;
};
