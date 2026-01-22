import Searchbar from '@/components/Dashboard/Searchbar';
import { splitNSearch } from '@/utils/splitNSearch';
import { fireEvent, render, screen } from '@testing-library/react';

let testFunc;

jest.mock('../../../../src/utils/splitNSearch', () => ({
    splitNSearch: jest.fn(),
}));
describe('test searchbar component', function () {
    it('renders the searchbar with appropriate label', function () {
        render(<Searchbar label="test-label" />);

        const label = screen.getByLabelText('test-label');
        expect(label).toBeInTheDocument();
    });

    it('checks if we can type into the searchbar', function () {
        render(<Searchbar label="test-label" />);

        const input = screen.getByLabelText('test-label') as HTMLInputElement;

        fireEvent.change(input, { target: { value: '123,456' } });
        expect(input.value).toBe('123,456');
    });

    it('tests if the click handler is called', function () {
        render(<Searchbar label="test-label" />);

        const input = screen.getByLabelText('test-label') as HTMLInputElement;

        const searchButton = screen.getByRole('button');

        fireEvent.change(input, { tatget: { value: '123' } });
        fireEvent.click(searchButton);

        expect(splitNSearch).toBeCalledTimes(1);
    });

    it('tests if enter key calls search', function () {
        render(<Searchbar label="test-label" />);

        const input = screen.getByLabelText('test-label') as HTMLInputElement;

        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });

        expect(splitNSearch).toBeCalledTimes(2);
    });

    it('tests other key down events do not call search', function () {
        render(<Searchbar label="test-label" />);

        const input = screen.getByLabelText('test-label') as HTMLInputElement;

        fireEvent.keyDown(input, { key: 'A', code: 'KeyA' });

        expect(splitNSearch).toBeCalledTimes(2);
    });
});
