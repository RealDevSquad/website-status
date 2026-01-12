import React from 'react';
import { screen, render, fireEvent, waitFor } from '@testing-library/react';
import NavBar from '../../../../src/components/navBar/index';
import * as authHooks from '@/hooks/useAuthenticated';
import { renderWithProviders } from '@/test-utils/renderWithProvider';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import handlers from '../../../../__mocks__/handlers';

const server = setupServer(...handlers);

beforeAll(() => {
    server.listen();
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Navbar', () => {
    test('shows skeleton loader first, then displays user info if logged in', async () => {
        renderWithProviders(<NavBar />);
        const loadingSkeleton = screen.getByTestId('loading-skeleton');
        expect(loadingSkeleton).toBeInTheDocument();

        await waitFor(() => {
            const userGreet = screen.getByText(/Hello, Mahima/i);
            expect(userGreet).toBeInTheDocument();
        });
    });

    test('shows "Sign In With Github" button when not logged in', async () => {
        server.use(
            rest.get(
                `${process.env.NEXT_PUBLIC_BASE_URL}/users?profile=true`,
                (_, res, ctx) => {
                    return res(
                        ctx.status(401),
                        ctx.json({ error: 'Not Authenticated' })
                    );
                }
            )
        );
        renderWithProviders(<NavBar />);
        await waitFor(() => {
            const signInButton = screen.getByRole('button', {
                name: /Sign In With Github/i,
            });
            expect(signInButton).toBeInTheDocument();
        });
    });

    test('renders the hamburger icon', async () => {
        const { getByTestId } = renderWithProviders(<NavBar />);
        await screen.findAllByTestId('navbar');
        const hamburgerIcon = getByTestId('hamburgerIcon');
        expect(hamburgerIcon).toBeInTheDocument();
    });

    test('renders Navbar Links', async () => {
        renderWithProviders(<NavBar />);
        await screen.findAllByTestId('navbar');
        const homeLink = screen.getByRole('link', { name: 'Welcome' });
        const eventLink = screen.getByRole('link', { name: 'Events' });
        const memberLink = screen.getByRole('link', { name: 'Members' });
        // TODO: Uncomment when crypto is added
        // const cryptoLink = screen.getByRole('link', { name: 'Crypto' });
        const statusLink = screen.getByRole('link', { name: 'Status' });

        expect(homeLink).toBeInTheDocument();
        expect(eventLink).toBeInTheDocument();
        expect(memberLink).toBeInTheDocument();
        // TODO: Uncomment when crypto is added
        // expect(cryptoLink).toBeInTheDocument();
        expect(statusLink).toBeInTheDocument();
    });

    test('should navigate to different route when different navbar link is clicked', async () => {
        renderWithProviders(<NavBar />);
        await screen.findAllByTestId('navbar');
        const welcomelink = screen.getByRole('link', { name: 'Welcome' });
        const eventLink = screen.getByRole('link', { name: 'Events' });
        const memberLink = screen.getByRole('link', { name: 'Members' });
        // TODO: Uncomment when crypto is added
        // const cryptoLink = screen.getByRole('link', { name: 'Crypto' });
        const statusLink = screen.getByRole('link', { name: 'Status' });

        expect(welcomelink).toHaveAttribute(
            'href',
            'https://welcome.realdevsquad.com'
        );
        expect(eventLink).toHaveAttribute(
            'href',
            'https://www.realdevsquad.com/events'
        );
        expect(memberLink).toHaveAttribute(
            'href',
            'https://members.realdevsquad.com'
        );
        // TODO: Uncomment when crypto is added
        // expect(cryptoLink).toHaveAttribute(
        //     'href',
        //     'https://crypto.realdevsquad.com'
        // );
        expect(statusLink).toHaveAttribute(
            'href',
            'https://status.realdevsquad.com'
        );
    });

    test('whether logo is rendering or not', async () => {
        const { getByTestId } = renderWithProviders(<NavBar />);
        await screen.findAllByTestId('navbar');
        const logo = getByTestId('logo');
        expect(logo).toBeInTheDocument();
    });

    test('should toggle the dropdown', async () => {
        renderWithProviders(<NavBar />);
        const button = await screen.findByTestId('toggler');
        fireEvent.click(button);
        expect(screen.getByTestId('dropdown')).toBeInTheDocument();
    });
});
