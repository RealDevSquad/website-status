import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { Tab } from '@/interfaces/task.type';
import FilterDropdown from '@/components/tasks/TaskSearch/FilterDropdown';
import { renderWithRouter } from '@/test_utils/createMockRouter';

const mockOnSelect = jest.fn();
const mockOnClose = jest.fn();

describe('FilterDropdown', () => {
    test('renders the modal with correct title and buttons', () => {
        renderWithRouter(
            <FilterDropdown
                tabs={[Tab.ASSIGNED, Tab.IN_PROGRESS]}
                onSelect={mockOnSelect}
                activeTab={Tab.ASSIGNED}
                onClose={mockOnClose}
            />
        );

        const modalTitle = screen.getByText('Filter');
        expect(modalTitle).toBeInTheDocument();

        const closeButton = screen.getByText('×');
        expect(closeButton).toBeInTheDocument();

        const assignedButton = screen.getByText(/assigned/i);
        expect(assignedButton).toBeInTheDocument();

        const inProgressButton = screen.getByText(/in progress/i);
        expect(inProgressButton).toBeInTheDocument();
    });

    test('renders the modal having overdue tab with correct title and buttons', () => {
        renderWithRouter(
            <FilterDropdown
                tabs={[Tab.ASSIGNED, Tab.IN_PROGRESS, Tab.OVERDUE]}
                onSelect={mockOnSelect}
                activeTab={Tab.OVERDUE}
                onClose={mockOnClose}
            />
        );

        const modalTitle = screen.getByText('Filter');
        expect(modalTitle).toBeInTheDocument();

        const closeButton = screen.getByText('×');
        expect(closeButton).toBeInTheDocument();

        const assignedButton = screen.getByText(/assigned/i);
        expect(assignedButton).toBeInTheDocument();

        const inProgressButton = screen.getByText(/in progress/i);
        expect(inProgressButton).toBeInTheDocument();

        const overdueButton = screen.getByText(/overdue/i);
        expect(overdueButton).toBeInTheDocument();
    });

    test('renders the modal with correct title and buttons', () => {
        renderWithRouter(
            <FilterDropdown
                tabs={[Tab.UNASSIGNED, Tab.DONE]}
                onSelect={mockOnSelect}
                activeTab={Tab.UNASSIGNED}
                onClose={mockOnClose}
            />
        );

        const modalTitle = screen.getByText('Filter');
        expect(modalTitle).toBeInTheDocument();

        const closeButton = screen.getByText('×');
        expect(closeButton).toBeInTheDocument();

        const unassignedButton = screen.getByText(/unassigned/i);
        expect(unassignedButton).toBeInTheDocument();

        const doneButton = screen.getByText(/done/i);
        expect(doneButton).toBeInTheDocument();
    });

    test('calls onSelect and onClose when a status button is clicked', () => {
        renderWithRouter(
            <FilterDropdown
                tabs={[Tab.ASSIGNED, Tab.IN_PROGRESS]}
                onSelect={mockOnSelect}
                activeTab={Tab.ASSIGNED}
                onClose={mockOnClose}
            />
        );

        const statusButton = screen.getByText(Tab.ASSIGNED);
        fireEvent.click(statusButton);

        expect(mockOnSelect).toBeCalled();
    });

    test('calls onClose when the close button is clicked', () => {
        renderWithRouter(
            <FilterDropdown
                tabs={[Tab.ASSIGNED, Tab.IN_PROGRESS]}
                onSelect={mockOnSelect}
                activeTab={Tab.ASSIGNED}
                onClose={mockOnClose}
            />
        );

        const closeButton = screen.getByText('×');
        fireEvent.click(closeButton);

        expect(mockOnClose).toBeCalled();
    });
    test('calls onClose when clicked on outside', () => {
        renderWithRouter(
            <FilterDropdown
                tabs={[Tab.ASSIGNED, Tab.IN_PROGRESS]}
                onSelect={mockOnSelect}
                activeTab={Tab.ASSIGNED}
                onClose={mockOnClose}
            />
        );

        const closeButton = screen.getByText('×');
        const { left, top } = closeButton.getBoundingClientRect();
        fireEvent(
            closeButton,
            new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                clientX: left + 100,
                clientY: top + 100,
            })
        );

        expect(mockOnClose).toBeCalled();
    });
    test('calls onClose when escape button is clicked', () => {
        renderWithRouter(
            <FilterDropdown
                tabs={[Tab.ASSIGNED, Tab.IN_PROGRESS]}
                onSelect={mockOnSelect}
                activeTab={Tab.ASSIGNED}
                onClose={mockOnClose}
            />
        );

        fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

        expect(mockOnClose).toBeCalled();
    });

    test('renders the modal with correct active tab', () => {
        renderWithRouter(
            <FilterDropdown
                tabs={[Tab.ASSIGNED, Tab.IN_PROGRESS]}
                onSelect={mockOnSelect}
                activeTab={Tab.ASSIGNED}
                onClose={mockOnClose}
            />
        );

        const assignedButton = screen.getByText(/assigned/i);
        expect(assignedButton).toHaveClass('status-button-active');

        const inProgressButton = screen.getByText(/in progress/i);
        expect(inProgressButton).not.toHaveClass('status-button-active');
    });

    test('renders the modal with correct active tab', () => {
        renderWithRouter(
            <FilterDropdown
                tabs={[Tab.UNASSIGNED, Tab.DONE]}
                onSelect={mockOnSelect}
                activeTab={Tab.DONE}
                onClose={mockOnClose}
            />
        );

        const doneButton = screen.getByText(/done/i);
        expect(doneButton).toHaveClass('status-button-active');

        const unassignedButton = screen.getByText(/unassigned/i);
        expect(unassignedButton).not.toHaveClass('status-button-active');
    });

    test('render the filter model having BACKLOG tab with correct title and buttons', () => {
        renderWithRouter(
            <FilterDropdown
                tabs={[Tab.UNASSIGNED, Tab.BACKLOG]}
                onSelect={mockOnSelect}
                activeTab={Tab.BACKLOG}
                onClose={mockOnClose}
            />
        );

        const backlogButton = screen.getByText(/backlog/i);
        expect(backlogButton).toBeInTheDocument();
    });

    test('onSelect Function Gets Called When the Backlog Status button is Clicked', () => {
        renderWithRouter(
            <FilterDropdown
                tabs={[Tab.BACKLOG, Tab.IN_PROGRESS]}
                onSelect={mockOnSelect}
                activeTab={Tab.BACKLOG}
                onClose={mockOnClose}
            />
        );

        const backlogButton = screen.getByRole('button', { name: 'BACKLOG' });
        fireEvent.click(backlogButton);

        expect(mockOnSelect).toHaveBeenCalledWith(Tab.BACKLOG);
    });

    test('Selection of the Backlog Button', () => {
        renderWithRouter(
            <FilterDropdown
                tabs={[Tab.BACKLOG, Tab.DONE]}
                onSelect={mockOnSelect}
                activeTab={Tab.BACKLOG}
                onClose={mockOnClose}
            />
        );

        const backlogButton = screen.getByText(/backlog/i);
        expect(backlogButton).toHaveClass('status-button-active');

        const doneButton = screen.getByText(/done/i);
        expect(doneButton).not.toHaveClass('status-button-active');
    });

    it('Renders Task tab Done', async () => {
        renderWithRouter(
            <FilterDropdown
                tabs={[Tab.BACKLOG, Tab.COMPLETED, Tab.DONE]}
                onSelect={mockOnSelect}
                activeTab={Tab.DONE}
                onClose={mockOnClose}
            />
        );

        const doneButton = screen.queryByText(/done/i);
        const completedButton = screen.queryByText(/completed/i);

        expect(doneButton).toBeInTheDocument();
        expect(completedButton).toBeNull();
    });
});
