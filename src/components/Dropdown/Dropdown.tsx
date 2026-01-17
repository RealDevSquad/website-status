import Link from 'next/link';
import { LOGOUT_URL, MAIN_SITE_URL } from '../../constants/url';
import styles from '@/components/Dropdown/dropdown.module.scss';

export const logout = () => {
    fetch(LOGOUT_URL, {
        method: 'GET',
        credentials: 'include',
    }).then(() => {
        location.reload();
    });
};

const Dropdown = () => {
    return (
        <div className={styles.dropdown} data-testid="dropdown">
            <ul className={styles.dropdownList} data-testid="options">
                <Link href={MAIN_SITE_URL} className={styles.dropdownLink}>
                    <li className={styles.dropdownItem}>Home</li>
                </Link>
                <Link
                    href={`${MAIN_SITE_URL}/status`}
                    className={styles.dropdownLink}
                >
                    <li className={styles.dropdownItem}>Status</li>
                </Link>
                <Link
                    href={`${MAIN_SITE_URL}/profile`}
                    className={styles.dropdownLink}
                >
                    <li className={styles.dropdownItem}>Profile</li>
                </Link>
                <Link href="/tasks" className={styles.dropdownLink}>
                    <li className={styles.dropdownItem}>Tasks</li>
                </Link>
                <Link
                    href={`${MAIN_SITE_URL}/identity`}
                    className={styles.dropdownLink}
                >
                    <li className={styles.dropdownItem}>Identity</li>
                </Link>
                <hr className={styles.line} />
                <li
                    className={styles.dropdownItem}
                    onClick={logout}
                    data-testid="signout"
                >
                    Sign out
                </li>
            </ul>
        </div>
    );
};

export default Dropdown;
