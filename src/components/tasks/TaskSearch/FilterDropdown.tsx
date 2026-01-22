import styles from './tasksearch.module.scss';
import { Tab, depreciatedTaskStatus } from '@/interfaces/task.type';
import { getChangedStatusName } from '@/utils/getChangedStatusName';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

type FilterModalProps = {
    tabs: Tab[];
    onSelect: (tab: Tab) => void;
    activeTab?: Tab;
    onClose: () => void;
};

const FilterDropdown = ({
    tabs,
    onSelect,
    activeTab,
    onClose,
}: FilterModalProps) => {
    const onKeyDownHandler = (event: KeyboardEvent) => {
        onClose();
    };
    useEffect(() => {
        document.addEventListener('keydown', onKeyDownHandler);
        return () => document.removeEventListener('keydown', onKeyDownHandler);
    }, []);

    const router = useRouter();
    const isDevMode = router.query.dev === 'true';

    return (
        <>
            <div
                onClick={onClose}
                className={styles['filter-modal-background']}
            ></div>
            <div
                className={`${styles['filter-modal']} ${styles['filter-modal-dev']}`}
                data-testid="filter-modal"
            >
                <div className={styles['filter-modal-title']}>
                    <span>Filter</span>
                    <span className={styles['close-button']} onClick={onClose}>
                        &times;
                    </span>
                </div>
                <div className={styles['status-filter']}>
                    {tabs
                        .filter(
                            (tab: Tab) =>
                                !depreciatedTaskStatus.includes(tab) &&
                                tab !== 'COMPLETED'
                        )
                        .map((tab) => (
                            <button
                                key={tab}
                                className={`${styles['status-button']} ${
                                    activeTab === tab
                                        ? styles['status-button-active']
                                        : ''
                                }`}
                                onClick={() => {
                                    onSelect(tab);
                                    onClose();
                                }}
                            >
                                {getChangedStatusName(tab)}
                            </button>
                        ))}
                </div>
            </div>
        </>
    );
};

export default FilterDropdown;
