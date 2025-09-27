import { TaskStatusDropdown } from '@/components/tasks/TaskStatusDropdown';
import TaskDropDownModel from '@/components/tasks/TaskDropDownModel';
import { MSG_ON_0_PROGRESS, MSG_ON_100_PROGRESS } from '@/constants/constants';
import { BACKEND_TASK_STATUS } from '@/constants/task-status';
import { fireEvent, render, screen } from '@testing-library/react';

jest.mock('@/hooks/useUserData', () => ({
    __esModule: true,
    default: () => ({
        data: { roles: { super_user: true } },
        isSuccess: true,
        isLoading: false,
    }),
}));

const onChange = jest.fn();

describe('TaskStatusDropdown', () => {
    beforeEach(() => {
        onChange.mockReset();
    });
    it('should display model informing user that proceeding further will make progress 100%, on task status change from in progress to needs review', () => {
        const oldProgress = 80;
        const oldStatus = BACKEND_TASK_STATUS.IN_PROGRESS;

        render(
            <TaskStatusDropdown
                isDevMode={true}
                oldProgress={oldProgress}
                oldStatus={oldStatus}
                onChange={onChange}
            />
        );

        const msg = `The progress of current task is ${oldProgress}%. ${MSG_ON_100_PROGRESS}`;
        fireEvent.change(screen.getByTestId('task-status'), {
            target: { value: BACKEND_TASK_STATUS.NEEDS_REVIEW },
        });

        const msgTag = screen.getByTestId('msg');
        expect(msgTag).toBeInTheDocument();
        expect(msgTag).toHaveTextContent(msg);
    });
    it('should display model informing user that proceeding further will make progress 0%, on task status change from needs review to assigned', () => {
        const oldProgress = 100;
        const oldStatus = BACKEND_TASK_STATUS.NEEDS_REVIEW;

        render(
            <TaskStatusDropdown
                isDevMode={true}
                oldProgress={oldProgress}
                oldStatus={oldStatus}
                onChange={onChange}
            />
        );

        const msg = `The progress of current task is ${oldProgress}%. ${MSG_ON_0_PROGRESS}`;
        fireEvent.change(screen.getByTestId('task-status'), {
            target: { value: BACKEND_TASK_STATUS.ASSIGNED },
        });

        const msgTag = screen.getByTestId('msg');
        expect(msgTag).toBeInTheDocument();
        expect(msgTag).toHaveTextContent(msg);
    });
    it('should send changed status and progress if user click the proceed button of the model, on task status change from needs review to assigned', () => {
        const oldProgress = 100;
        const oldStatus = BACKEND_TASK_STATUS.NEEDS_REVIEW;

        render(
            <TaskStatusDropdown
                isDevMode={true}
                oldProgress={oldProgress}
                oldStatus={oldStatus}
                onChange={onChange}
            />
        );

        fireEvent.change(screen.getByTestId('task-status'), {
            target: { value: BACKEND_TASK_STATUS.ASSIGNED },
        });
        fireEvent.click(screen.getByTestId('proceed'));
        expect(onChange).toHaveBeenCalledWith({
            newStatus: BACKEND_TASK_STATUS.ASSIGNED,
            newProgress: 0,
        });
        expect(onChange).toHaveBeenCalledTimes(1);
    });
    it('should send reset status and progress if user click the cancel button of the model, on task status change from needs review to assigned', () => {
        const oldProgress = 100;
        const oldStatus = BACKEND_TASK_STATUS.NEEDS_REVIEW;

        render(
            <TaskStatusDropdown
                isDevMode={true}
                oldProgress={oldProgress}
                oldStatus={oldStatus}
                onChange={onChange}
            />
        );

        fireEvent.change(screen.getByTestId('task-status'), {
            target: { value: BACKEND_TASK_STATUS.ASSIGNED },
        });
        fireEvent.click(screen.getByTestId('cancel'));
        expect(onChange).toHaveBeenCalledTimes(0);
        expect(screen.getByTestId('task-status')).toHaveValue(oldStatus);
    });

    it('should show text Done as selected option when a task with completed status is passed down.', () => {
        const oldProgress = 100;
        const oldStatus = BACKEND_TASK_STATUS.COMPLETED;

        render(
            <TaskStatusDropdown
                oldProgress={oldProgress}
                oldStatus={oldStatus}
                onChange={onChange}
            />
        );
        const option: HTMLOptionElement = screen.getByTestId(
            'task-status-DONE'
        ) as HTMLOptionElement;
        expect(option.selected).toBeTruthy();
    });
    it('should not show any model info on change of status from in progress to blocked', () => {
        const oldProgress = 70;
        const oldStatus = BACKEND_TASK_STATUS.IN_PROGRESS;

        render(
            <TaskStatusDropdown
                isDevMode={true}
                oldProgress={oldProgress}
                oldStatus={oldStatus}
                onChange={onChange}
            />
        );

        fireEvent.change(screen.getByTestId('task-status'), {
            target: { value: BACKEND_TASK_STATUS.BLOCKED },
        });
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith({
            newStatus: BACKEND_TASK_STATUS.BLOCKED,
        });
        const msgTag = screen.queryByTestId('msg');
        expect(msgTag).toBeNull();
    });
    it('should show text Backlog when a task with Backlog status is passed down.', () => {
        const oldProgress = 100;
        const oldStatus = BACKEND_TASK_STATUS.BACKLOG;

        render(
            <TaskStatusDropdown
                oldProgress={oldProgress}
                oldStatus={oldStatus}
                onChange={onChange}
            />
        );
        const element = screen.getByTestId('task-status-backlog');
        expect(element).toHaveTextContent('Backlog');
    });
    describe('TaskDropDownModel', () => {
        const handleProceed = jest.fn();
        const resetProgressAndStatus = jest.fn();
        it('should render message sent to it', () => {
            const msg = 'This is random msg';
            render(
                <TaskDropDownModel
                    message={msg}
                    handleProceed={handleProceed}
                    resetProgressAndStatus={resetProgressAndStatus}
                />
            );
            const msgTag = screen.queryByTestId('msg');
            expect(msgTag).toHaveTextContent(msg);
        });
    });
    describe('Task Status Dropdown Rendering in DevMode', () => {
        it('should renders TaskStatusDropdown with correct classes', () => {
            render(
                <TaskStatusDropdown
                    isDevMode={true}
                    oldProgress={0}
                    oldStatus={BACKEND_TASK_STATUS.IN_PROGRESS}
                    onChange={onChange}
                />
            );

            const label = screen.getByTestId('task-status-label');
            expect(label).toHaveClass('cardPurposeAndStatusFont');

            const select = screen.getByTestId('task-status');
            expect(select).toHaveClass('taskStatusUpdate');
        });

        it('should update state and call onChange when selecting a status', () => {
            const onChange = jest.fn();

            const { getByTestId } = render(
                <TaskStatusDropdown
                    oldStatus={BACKEND_TASK_STATUS.UN_ASSIGNED}
                    oldProgress={0}
                    onChange={onChange}
                />
            );

            const statusSelect = getByTestId('task-status');

            fireEvent.change(statusSelect, {
                target: { value: BACKEND_TASK_STATUS.NEEDS_REVIEW },
            });

            expect(statusSelect).toHaveValue(BACKEND_TASK_STATUS.NEEDS_REVIEW);
            expect(onChange).toHaveBeenCalledWith({
                newStatus: BACKEND_TASK_STATUS.NEEDS_REVIEW,
            });
        });

        it('should show the current status as selected', () => {
            const currentStatus = BACKEND_TASK_STATUS.BLOCKED;

            render(
                <TaskStatusDropdown
                    isDevMode={true}
                    oldProgress={0}
                    oldStatus={currentStatus}
                    onChange={onChange}
                />
            );

            const select = screen.getByTestId('task-status');
            expect(select).toHaveValue(currentStatus);
        });
    });

    describe('Task Status Dropdown Rendering in non-DevMode', () => {
        it('should not render TaskStatusDropdown', () => {
            render(
                <TaskStatusDropdown
                    isDevMode={false}
                    oldProgress={0}
                    oldStatus={BACKEND_TASK_STATUS.IN_PROGRESS}
                    onChange={onChange}
                />
            );

            const label = screen.getByText('Status:');
            expect(label).toBeInTheDocument();

            expect(label).not.toHaveClass('cardPurposeAndStatusFont');

            const select = screen.getByTestId('task-status');
            expect(select).toHaveClass('taskStatusUpdate');
        });
    });

    describe('Status Change Handling', () => {
        it('should not call onChange when selected status is the same as current status', () => {
            const currentStatus = BACKEND_TASK_STATUS.IN_PROGRESS;

            render(
                <TaskStatusDropdown
                    isDevMode={true}
                    oldProgress={0}
                    oldStatus={currentStatus}
                    onChange={onChange}
                />
            );

            fireEvent.change(screen.getByTestId('task-status'), {
                target: { value: currentStatus },
            });

            expect(onChange).not.toHaveBeenCalled();
        });
    });
});
