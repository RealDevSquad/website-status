import { fireEvent, screen, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react-hooks';
import Card from '@/components/tasks/card/index';
import { store } from '@/app/store';
import { Provider } from 'react-redux';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import {
    createMockRouter,
    renderWithRouter,
} from '@/test_utils/createMockRouter';
import { NextRouter } from 'next/router';
import * as tasksApi from '@/app/services/tasksApi';
import { CONTENT } from '../../../../__mocks__/db/tasks';
import {
    APPROVED,
    ASSIGNED,
    AVAILABLE,
    BLOCKED,
    COMPLETED,
    DONE,
    IN_PROGRESS,
    MERGED,
    NEEDS_REVIEW,
    VERIFIED,
} from '@/constants/task-status';

const DEFAULT_PROPS = {
    content: {
        id: 'firestoreDocumentId123',
        lossRate: {
            dinero: 10,
            neelam: 5,
        },
        links: ['https://realdevsquad.com/learn-site'],
        completionAward: {
            dinero: 110,
            neelam: 10,
        },
        dependsOn: [],
        assignee: 'ankur',
        startedOn: '1618790400',
        isNoteworthy: true,
        title: 'test 1 for drag and drop',
        purpose: 'string',
        percentCompleted: 0,
        endsOn: 1618790400,
        status: COMPLETED,
        featureUrl: 'string',
        type: 'feature',
        createdBy: 'ankush',
        priority: 'HIGH',
    },
    shouldEdit: true,
    onContentChange: jest.fn(),
};

jest.mock('@/hooks/useUserData', () => {
    return () => ({
        data: {
            roles: {
                admin: true,
                super_user: true,
            },
        },
        isUserAuthorized: true,
        isSuccess: true,
    });
});

const getFirestoreDateNDaysBefore = (n = 1) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return new Date(d).getTime() / 1000;
};

jest.useFakeTimers();
describe('Task card', () => {
    let updateTaskSpy: any;
    beforeEach(() => {
        updateTaskSpy = jest.spyOn(tasksApi, 'useUpdateTaskMutation');
    });
    test('Should render card', () => {
        const { getByText } = renderWithRouter(
            <Provider store={store()}>
                <Card {...DEFAULT_PROPS} />
            </Provider>,
            {
                query: { dev: 'true' },
            }
        );

        expect(getByText('test 1 for drag and drop')).toBeInTheDocument();
    });

    test('Should show n days ago for due tasks', () => {
        let props = {
            ...DEFAULT_PROPS,
            content: {
                ...DEFAULT_PROPS.content,
                endsOn: getFirestoreDateNDaysBefore(1),
            },
        };
        const { rerender, getByText } = renderWithRouter(
            <Provider store={store()}>
                <Card {...props} />
            </Provider>
        );

        expect(getByText('a day ago')).toBeInTheDocument();

        // With updated props
        props = {
            ...props,
            content: {
                ...props.content,
                endsOn: getFirestoreDateNDaysBefore(2),
            },
        };

        rerender(
            <Provider store={store()}>
                <RouterContext.Provider
                    value={createMockRouter({}) as NextRouter}
                >
                    <Card {...props} />
                </RouterContext.Provider>
            </Provider>
        );

        expect(getByText('2 days ago')).toBeInTheDocument();
    });

    test('should show the redesign only with feature flag on', () => {
        const { getByTestId, queryByTestId } = renderWithRouter(
            <Provider store={store()}>
                <Card {...DEFAULT_PROPS} />
            </Provider>,
            {}
        );

        expect(queryByTestId('task-card')).toBeInTheDocument();
    });

    test('should show edit button when ALT key is long pressed', () => {
        const { getByTestId, queryByTestId } = renderWithRouter(
            <Provider store={store()}>
                <Card {...DEFAULT_PROPS} />
            </Provider>,
            {}
        );

        const component = getByTestId('task-card');

        act(() => {
            fireEvent.keyDown(component, { key: 'Alt', code: 'AltLeft' });
            jest.advanceTimersByTime(300);
        });

        expect(queryByTestId('edit-button')).toBeInTheDocument();
    });
    test('task should be editable if edit button clicked', async () => {
        const { getByTestId, queryByTestId } = renderWithRouter(
            <Provider store={store()}>
                <Card {...DEFAULT_PROPS} />
            </Provider>,
            {}
        );
        const component = getByTestId('task-card');

        act(() => {
            fireEvent.keyDown(component, { key: 'Alt', code: 'AltLeft' });
            jest.advanceTimersByTime(300);
        });
        const editButton = getByTestId('edit-button');
        fireEvent.click(editButton);
        await screen.findByTestId('assignee-input');
    });

    it('Should render "Close task" button when parent issue is closed', function () {
        const PROPS = {
            ...DEFAULT_PROPS,
            content: {
                ...DEFAULT_PROPS.content,
                status: ASSIGNED,
                github: {
                    issue: {
                        closedAt: '2023-04-02T17:31:50',
                        status: 'closed',
                        id: 12278,
                        html_url: 'https://github.com',
                    },
                },
            },
        };

        const screen = renderWithRouter(
            <Provider store={store()}>
                <Card {...PROPS} />
            </Provider>
        );

        const closeTaskBtn = screen.getByRole('button', {
            name: /Close the task/i,
        });
        expect(closeTaskBtn).toBeInTheDocument();
    });

    it('Should not render "Close task" button when parent issue is closed but the task was already completed', function () {
        const PROPS = {
            ...DEFAULT_PROPS,
            content: {
                ...DEFAULT_PROPS.content,
                github: {
                    issue: {
                        html_url: 'https://github.com',
                        closedAt: '2023-04-02T17:31:50',
                        status: 'closed',
                        id: 12278,
                    },
                },
            },
        };

        const screen = renderWithRouter(
            <Provider store={store()}>
                <Card {...PROPS} />
            </Provider>
        );

        const closeTaskBtn = screen.queryByRole('button', {
            name: /Close the task/i,
        });
        expect(closeTaskBtn).not.toBeInTheDocument();
    });

    it('Should render "Assign to username" button when parent issue has an assignee and is open, the task is available and has not been assigned', function () {
        const PROPS = {
            ...DEFAULT_PROPS,
            content: {
                ...DEFAULT_PROPS.content,
                status: 'Available',
                assignee: undefined,
                github: {
                    issue: {
                        html_url: 'https://github.com',
                        assignee: 'johndoe',
                        status: 'open',
                        id: 12278,
                        assigneeRdsInfo: {
                            username: 'john',
                            firstName: 'John',
                            lastName: 'Doe',
                        },
                    },
                },
            },
        };

        const screen = renderWithRouter(
            <Provider store={store()}>
                <Card {...PROPS} />
            </Provider>
        );

        const closeTaskBtn = screen.queryByRole('button', {
            name: /Assign to john/i,
        });
        expect(closeTaskBtn).toBeInTheDocument();

        const dummyNameImage = screen.getByAltText('Dummy Name');
        const assignToText = screen.getByText('Assign to');

        expect(dummyNameImage).toBeInTheDocument();
        expect(assignToText).toBeInTheDocument();
    });

    it('Should not render "Assign to username" button when parent issue has an assignee and is open, the task status is "Completed" and has not been assigned', function () {
        const PROPS = {
            ...DEFAULT_PROPS,
            content: {
                ...DEFAULT_PROPS.content,
                assignee: undefined,
                github: {
                    issue: {
                        html_url: 'https://github.com',
                        assignee: 'johndoe',
                        status: 'open',
                        id: 12278,
                        assigneeRdsInfo: {
                            username: 'john',
                            firstName: 'John',
                            lastName: 'Doe',
                        },
                    },
                },
            },
        };

        const screen = renderWithRouter(
            <Provider store={store()}>
                <Card {...PROPS} />
            </Provider>
        );

        const closeTaskBtn = screen.queryByRole('button', {
            name: /Assign to john/i,
        });
        expect(closeTaskBtn).not.toBeInTheDocument();
    });

    it('Should show test "Assigned to" when the task has an assignee', function () {
        const screen = renderWithRouter(
            <Provider store={store()}>
                <Card {...DEFAULT_PROPS} />
            </Provider>
        );

        const assignedToText = screen.getByText('Assigned to');
        expect(assignedToText).toBeInTheDocument();
        const assignToText = screen.queryByText('Assign to');
        expect(assignToText).not.toBeInTheDocument();
    });

    it('Should show test "Assign to" when the task does not have an assignee', function () {
        const PROPS = {
            ...DEFAULT_PROPS,
            content: {
                ...DEFAULT_PROPS.content,
                assignee: undefined,
            },
        };
        const screen = renderWithRouter(
            <Provider store={store()}>
                <Card {...PROPS} />
            </Provider>
        );

        const assignedToText = screen.queryByText('Assigned to');
        expect(assignedToText).not.toBeInTheDocument();
        const assignToText = screen.getByText('Assign to');
        expect(assignToText).toBeInTheDocument();
    });

    it('Should render task assignee name in user input search field in edit mode', async () => {
        const screen = renderWithRouter(
            <Provider store={store()}>
                <Card {...DEFAULT_PROPS} shouldEdit={true} />
            </Provider>,
            {}
        );

        const taskCard = screen.getByTestId('task-card');

        act(() => {
            fireEvent.keyDown(taskCard, { key: 'Alt', code: 'AltLeft' });
            jest.advanceTimersByTime(300);
        });

        const editIcon = screen.getByTestId('edit-button');
        expect(editIcon).toBeInTheDocument();

        act(() => {
            fireEvent.click(editIcon);
            jest.advanceTimersByTime(300);
        });

        const userSelect = await screen.findByDisplayValue(
            DEFAULT_PROPS.content.assignee
        );
        expect(userSelect).toBeInTheDocument();
    });

    it('Should not have any assignee name in user input search field in edit mode when task has no assignee', async () => {
        const PROPS = {
            ...DEFAULT_PROPS,
            content: {
                ...DEFAULT_PROPS.content,
                status: AVAILABLE,
                assignee: undefined,
            },
        };

        const screen = renderWithRouter(
            <Provider store={store()}>
                <Card {...PROPS} shouldEdit={true} />
            </Provider>,
            {}
        );

        const taskCard = screen.getByTestId('task-card');

        act(() => {
            fireEvent.keyDown(taskCard, { key: 'Alt', code: 'AltLeft' });
            jest.advanceTimersByTime(300);
        });

        const editIcon = screen.getByTestId('edit-button');
        expect(editIcon).toBeInTheDocument();

        act(() => {
            fireEvent.click(editIcon);
            jest.advanceTimersByTime(300);
        });

        const userSelect = await screen.findByTestId('assignee-input');
        expect(userSelect).toHaveValue('');
    });
    test('should show cancel edit button when in edit mode', () => {
        const { getByTestId, queryByTestId } = renderWithRouter(
            <Provider store={store()}>
                <Card {...DEFAULT_PROPS} />
            </Provider>,
            {}
        );
        const component = getByTestId('task-card');
        act(() => {
            fireEvent.keyDown(component, { key: 'Alt', code: 'AltLeft' });
            jest.advanceTimersByTime(300);
        });
        const editButton = getByTestId('edit-button');
        fireEvent.click(editButton);
        expect(queryByTestId('cancel-edit-button')).toBeInTheDocument();
    });
    test('should show text area for title when in edit mode', () => {
        const { getByTestId, queryByTestId } = renderWithRouter(
            <Provider store={store()}>
                <Card {...DEFAULT_PROPS} />
            </Provider>,
            {}
        );
        const component = getByTestId('task-card');
        act(() => {
            fireEvent.keyDown(component, { key: 'Alt', code: 'AltLeft' });
            jest.advanceTimersByTime(300);
        });
        const editButton = getByTestId('edit-button');
        fireEvent.click(editButton);
        expect(queryByTestId('title-textarea')).toBeInTheDocument();
    });
    test('should change the title value when user starts typing', async () => {
        const { getByTestId } = renderWithRouter(
            <Provider store={store()}>
                <Card {...DEFAULT_PROPS} />
            </Provider>,
            {}
        );
        const component = getByTestId('task-card');

        act(() => {
            fireEvent.keyDown(component, { key: 'Alt', code: 'AltLeft' });
            jest.advanceTimersByTime(300);
        });
        const editButton = getByTestId('edit-button');
        fireEvent.click(editButton);

        const textarea = screen.getByTestId('title-textarea');

        fireEvent.change(textarea, { target: { value: 't' } });

        jest.runAllTimers();

        expect(updateTaskSpy).toBeCalled();

        await waitFor(
            () => {
                expect(screen.getByTestId('small-spinner')).toBeInTheDocument();
            },
            { timeout: 2000 }
        );
        await waitFor(() => {
            expect(screen.getByTestId('error')).toBeInTheDocument();
        });
    });
    test('should change the date value when date is selected', () => {
        const { getByTestId } = renderWithRouter(
            <Provider store={store()}>
                <Card {...DEFAULT_PROPS} />
            </Provider>,
            {}
        );
        const component = getByTestId('task-card');
        act(() => {
            fireEvent.keyDown(component, { key: 'Alt', code: 'AltLeft' });
            jest.advanceTimersByTime(300);
        });

        const editButton = getByTestId('edit-button');
        fireEvent.click(editButton);

        const dateInput = screen.getByTestId('date');
        fireEvent.change(dateInput, { target: { value: '2023-08-25' } });

        jest.runAllTimers();

        expect(updateTaskSpy).toBeCalled();
    });
    test('should change the assignee when new user is selected from list', async () => {
        const { getByTestId } = renderWithRouter(
            <Provider store={store()}>
                <Card {...DEFAULT_PROPS} />
            </Provider>,
            {}
        );
        const component = getByTestId('task-card');
        act(() => {
            fireEvent.keyDown(component, { key: 'Alt', code: 'AltLeft' });
            jest.advanceTimersByTime(300);
        });

        const editButton = getByTestId('edit-button');
        fireEvent.click(editButton);
        const assignee = screen.getByTestId('assignee-input');

        fireEvent.change(assignee, { target: { value: 'John' } });

        jest.runAllTimers();

        expect(updateTaskSpy).toBeCalled();
    });

    it('renders "Not started" if status is AVAILABLE', () => {
        const PROPS = {
            ...DEFAULT_PROPS,
            content: {
                ...DEFAULT_PROPS.content,
                status: AVAILABLE,
            },
        };
        const { getByTestId } = renderWithRouter(
            <Provider store={store()}>
                <Card {...PROPS} />
            </Provider>,
            {}
        );
        const spanElement = screen.getByTestId('started-on');
        expect(spanElement).toHaveTextContent('Not started');
    });

    it('renders "Started" with a specific date if status is not AVAILABLE', () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2025-01-01T00:00:00Z'));
        const { getByTestId } = renderWithRouter(
            <Provider store={store()}>
                <Card
                    content={CONTENT[2]}
                    shouldEdit={true}
                    onContentChange={jest.fn()}
                />
            </Provider>,
            {}
        );
        const spanElement = screen.getByTestId('started-on');
        expect(spanElement).toHaveTextContent('Started 4 years ago'); // Mocked date from moment
        jest.useRealTimers();
    });
    it('Should show the status of the task', () => {
        renderWithRouter(
            <Provider store={store()}>
                <Card {...DEFAULT_PROPS} />
            </Provider>
        );
        const spanElement = screen.getByTestId('task-status');
        expect(spanElement).toHaveTextContent('Done');
    });
});

describe('Task card, color based on status ', () => {
    const OVER_DUE_CLASS = 'overdueTask';
    it('Should not render card in red, if task status is DONE ', () => {
        const TASK_DATA = DEFAULT_PROPS;
        TASK_DATA.content.status = DONE;
        renderWithRouter(
            <Provider store={store()}>
                <Card {...TASK_DATA} />
            </Provider>
        );
        const taskCard = screen.getByTestId('task-card');
        expect(taskCard).not.toHaveClass(OVER_DUE_CLASS);
    });
    it('Should not render card in red, if task status is DONE ', () => {
        const TASK_DATA = DEFAULT_PROPS;
        TASK_DATA.content.status = DONE;
        renderWithRouter(
            <Provider store={store()}>
                <Card {...TASK_DATA} />
            </Provider>
        );
        const taskCard = screen.getByTestId('task-card');
        expect(taskCard).not.toHaveClass(OVER_DUE_CLASS);
    });
    it('Should not render card in red, if task status is VERIFIED ', () => {
        const TASK_DATA = DEFAULT_PROPS;
        TASK_DATA.content.status = VERIFIED;
        renderWithRouter(
            <Provider store={store()}>
                <Card {...TASK_DATA} />
            </Provider>
        );
        const taskCard = screen.getByTestId('task-card');
        expect(taskCard).not.toHaveClass(OVER_DUE_CLASS);
    });
    it('Should not render card in red, if task status is AVAILABLE ', () => {
        const TASK_DATA = DEFAULT_PROPS;
        TASK_DATA.content.status = AVAILABLE;
        renderWithRouter(
            <Provider store={store()}>
                <Card {...TASK_DATA} />
            </Provider>
        );
        const taskCard = screen.getByTestId('task-card');
        expect(taskCard).not.toHaveClass(OVER_DUE_CLASS);
    });
    it('Should not render card in red, if task status is ASSIGNED ', () => {
        const TASK_DATA = DEFAULT_PROPS;
        TASK_DATA.content.status = ASSIGNED;
        renderWithRouter(
            <Provider store={store()}>
                <Card {...TASK_DATA} />
            </Provider>
        );
        const taskCard = screen.getByTestId('task-card');
        expect(taskCard).toHaveClass(OVER_DUE_CLASS);
    });
    it('Should render card in red if task status is BLOCKED', () => {
        const TASK_DATA = DEFAULT_PROPS;
        TASK_DATA.content.status = BLOCKED;
        renderWithRouter(
            <Provider store={store()}>
                <Card {...TASK_DATA} />
            </Provider>
        );
        const taskCard = screen.getByTestId('task-card');
        expect(taskCard).toHaveClass(OVER_DUE_CLASS);
    });
    it('Should render card in red if task status is IN_PROGRESS', () => {
        const TASK_DATA = DEFAULT_PROPS;
        TASK_DATA.content.status = IN_PROGRESS;
        renderWithRouter(
            <Provider store={store()}>
                <Card {...TASK_DATA} />
            </Provider>
        );
        const taskCard = screen.getByTestId('task-card');
        expect(taskCard).toHaveClass(OVER_DUE_CLASS);
    });
    it('Should render card in red if task status is NEEDS_REVIEW', () => {
        const TASK_DATA = DEFAULT_PROPS;
        TASK_DATA.content.status = NEEDS_REVIEW;
        renderWithRouter(
            <Provider store={store()}>
                <Card {...TASK_DATA} />
            </Provider>
        );
        const taskCard = screen.getByTestId('task-card');
        expect(taskCard).toHaveClass(OVER_DUE_CLASS);
    });
    it('Should render card in red if task status is APPROVED', () => {
        const TASK_DATA = DEFAULT_PROPS;
        TASK_DATA.content.status = APPROVED;
        renderWithRouter(
            <Provider store={store()}>
                <Card {...TASK_DATA} />
            </Provider>
        );
        const taskCard = screen.getByTestId('task-card');
        expect(taskCard).toHaveClass(OVER_DUE_CLASS);
    });
    it('Should render card in red if task status is MERGED', () => {
        const TASK_DATA = DEFAULT_PROPS;
        TASK_DATA.content.status = MERGED;
        renderWithRouter(
            <Provider store={store()}>
                <Card {...TASK_DATA} />
            </Provider>
        );
        const taskCard = screen.getByTestId('task-card');
        expect(taskCard).toHaveClass(OVER_DUE_CLASS);
    });
});
