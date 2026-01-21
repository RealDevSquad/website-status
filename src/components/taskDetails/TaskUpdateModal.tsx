import React from 'react';
import ProgressContainer from '../tasks/card/progressContainer';
import Modal from '../Modal';
import getCurrentDate from '@/utils/getLatestDate';
import { questions } from '@/constants/ProgressUpdates';
import ProgressForm from '../ProgressForm/ProgressForm';
import task from '@/interfaces/task.type';
import { IoMdClose } from 'react-icons/io';
type Props = {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    styles: {
        readonly [key: string]: string;
    };
    taskDetailsData: task;
    editedTaskDetails: task;
    onUpdateSuccess: () => void;
};

function TaskUpdateModal({
    isOpen,
    setIsOpen,
    styles,
    taskDetailsData,
    editedTaskDetails,
    onUpdateSuccess,
}: Props) {
    return (
        <Modal isOpen={isOpen} toggle={() => setIsOpen(false)}>
            <div className={styles.taskUpdateModal}>
                <button
                    className={styles.closeButton}
                    onClick={() => setIsOpen(false)}
                    data-testid="task-update-modal-close-button"
                    aria-label="Close"
                >
                    <IoMdClose size={25} />
                </button>
                <h3 className={styles.updateProgress}>Update Progress</h3>
                <section className={styles.containerUpdate}>
                    <h1 className={styles.formHeading}>Task Updates</h1>
                    <h2 className={styles.dateUpdated}>
                        On {getCurrentDate()}
                    </h2>
                    <ProgressForm
                        questions={questions}
                        onUpdateSuccess={() => {
                            onUpdateSuccess();
                            setIsOpen(false);
                        }}
                    />
                </section>
                <div className={styles.hr} />
                <ProgressContainer
                    content={taskDetailsData}
                    key={editedTaskDetails?.percentCompleted}
                    readOnly={false}
                />
            </div>
        </Modal>
    );
}

export default TaskUpdateModal;
