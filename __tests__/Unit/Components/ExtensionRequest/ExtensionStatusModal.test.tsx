import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
    ExtensionStatusModal,
    formatToRelativeTime,
} from '@/components/ExtensionRequest/ExtensionStatusModal';
import { useGetSelfExtensionRequestsQuery } from '@/app/services/tasksApi';
import { mockExtensionRequests } from '../../../../__mocks__/db/extensionRequests';

jest.mock('@/app/services/tasksApi', () => ({
    useGetSelfExtensionRequestsQuery: jest.fn(),
    useCreateExtensionRequestMutation: jest.fn(() => [
        jest.fn(),
        { isLoading: false },
    ]),
}));

const mockQuery = useGetSelfExtensionRequestsQuery as jest.Mock;
const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    taskId: '123',
    dev: true,
    assignee: 'john',
};

const setupTest = (queryReturnValue: any) => {
    mockQuery.mockReturnValue(queryReturnValue);
    return render(<ExtensionStatusModal {...defaultProps} />);
};

describe('ExtensionStatusModal Component', () => {
    test('should render loading state correctly', () => {
        setupTest({ isLoading: true, data: null });
        expect(screen.getByTestId('modal-title')).toBeInTheDocument();
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    test('should hide request extension button when pending request exists', () => {
        setupTest({
            isLoading: false,
            data: { allExtensionRequests: [{ id: 1, status: 'PENDING' }] },
        });
        expect(
            screen.queryByTestId('request-extension-button')
        ).not.toBeInTheDocument();
    });

    test('should handle modal interactions correctly', () => {
        setupTest({ isLoading: false, data: { allExtensionRequests: [] } });

        fireEvent.click(screen.getByTestId('close-button'));
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);

        jest.clearAllMocks();
        fireEvent.click(screen.getByTestId('extension-modal-overlay'));
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);

        jest.clearAllMocks();
        fireEvent.click(screen.getByTestId('extension-modal-content'));
        expect(defaultProps.onClose).not.toHaveBeenCalled();

        fireEvent.keyDown(document, { key: 'Escape' });
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);

        jest.clearAllMocks();
        fireEvent.keyDown(document, { key: 'Enter' });
        expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    test('should render close button correctly', () => {
        setupTest({ isLoading: false, data: { allExtensionRequests: [] } });

        const closeButton = screen.getByTestId('close-button');
        expect(closeButton).toBeInTheDocument();
        expect(closeButton).toBeVisible();
        expect(closeButton).toHaveTextContent('Close');
    });

    test('should show request extension button when no pending requests', () => {
        setupTest({
            isLoading: false,
            data: {
                allExtensionRequests: [
                    { id: 1, status: 'APPROVED', reviewedBy: 'Admin' },
                ],
            },
        });
        expect(
            screen.getByTestId('request-extension-button')
        ).toBeInTheDocument();
    });

    test('should render modal correctly for approved request with large timestamp', () => {
        const approvedRequest = mockExtensionRequests.find(
            (req) => req.status === 'APPROVED'
        );

        setupTest({
            isLoading: false,
            data: {
                allExtensionRequests: [approvedRequest],
            },
        });
        expect(screen.getByTestId('modal-title')).toBeInTheDocument();
    });

    test('should render modal for denied extension requests', () => {
        const deniedRequest = mockExtensionRequests.find(
            (req) => req.status === 'DENIED'
        );

        setupTest({
            isLoading: false,
            data: {
                allExtensionRequests: [deniedRequest],
            },
        });
        expect(screen.getByTestId('modal-title')).toBeInTheDocument();
    });

    test('should test formatToRelativeTime function', () => {
        jest.useFakeTimers().setSystemTime(new Date('2025-01-01T00:00:00Z'));
        const timestamp = 1640995200;
        const result = formatToRelativeTime(timestamp);
        expect(result).toBe('3 years ago');
        jest.useRealTimers();
    });

    test('should open extension request form when request extension button is clicked', () => {
        const onCloseMock = jest.fn();
        mockQuery.mockReturnValue({
            isLoading: false,
            data: { allExtensionRequests: [] },
        });

        const { rerender } = render(
            <ExtensionStatusModal {...defaultProps} onClose={onCloseMock} />
        );

        const requestButton = screen.getByTestId('request-extension-button');
        fireEvent.click(requestButton);

        expect(onCloseMock).toHaveBeenCalledTimes(1);

        rerender(
            <ExtensionStatusModal
                {...defaultProps}
                isOpen={false}
                onClose={onCloseMock}
            />
        );

        expect(screen.getByTestId('extension-form-modal')).toBeInTheDocument();
        expect(screen.getByTestId('form-heading')).toHaveTextContent(
            'Extension Request Form'
        );
        expect(screen.getByTestId('reason-input')).toBeInTheDocument();
        expect(screen.getByTestId('new-eta-input')).toBeInTheDocument();
        expect(screen.getByTestId('title-input')).toBeInTheDocument();
        expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
        expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    test('should handle initialOldEndsOn prop correctly', () => {
        const initialDate = new Date('2024-01-15T10:00:00Z');
        const propsWithInitialDate = {
            ...defaultProps,
            initialOldEndsOn: initialDate,
        };

        render(<ExtensionStatusModal {...propsWithInitialDate} />);

        expect(screen.getByTestId('modal-title')).toBeInTheDocument();
    });
});
