import task, {
    CardTaskDetails,
    taskStatusUpdateHandleProp,
} from '@/interfaces/task.type';
import { useState } from 'react';
import styles from '@/components/tasks/card/card.module.scss';
import { PENDING, SAVED, ERROR_STATUS } from '../constants';
import {
    useUpdateTaskMutation,
    useUpdateSelfTaskMutation,
} from '@/app/services/tasksApi';

import { TaskStatusDropdown } from '../TaskStatusDropdown';
import {
    TASK_STATUS_UPDATE_ERROR_MESSAGE,
    TASK_STATUS_UPDATE_SUCCESS_MESSAGE,
    TASK_STATUS_MAPING,
} from '@/constants/constants';
import { toast, ToastTypes } from '@/helperFunctions/toast';

import { BACKEND_TASK_STATUS } from '@/constants/task-status';
import { useRouter } from 'next/router';

type Props = {
    task: task;
    setEditedTaskDetails: React.Dispatch<React.SetStateAction<CardTaskDetails>>;
    isSelfTask?: boolean;
    setSaveExtensionRequestStatus: React.Dispatch<React.SetStateAction<string>>;
};

// TODO: remove this after fixing the card beautify status
const beautifyStatus = (status: string) => {
    let beautifiedStatus = status;

    if (beautifiedStatus === BACKEND_TASK_STATUS.COMPLETED) {
        beautifiedStatus = 'DONE';
    }

    return (
        TASK_STATUS_MAPING[
            beautifiedStatus as keyof typeof TASK_STATUS_MAPING
        ] || status
    );
};

const TaskStatusEditMode = ({
    task,
    setEditedTaskDetails,
    isSelfTask,
    setSaveExtensionRequestStatus,
}: Props) => {
    const router = useRouter();
    const isDevMode = router.query.dev === 'true';

    const [updateTask] = useUpdateTaskMutation();
    const [updateSelfTask] = useUpdateSelfTaskMutation();
    const { SUCCESS, ERROR } = ToastTypes;

    const onChangeUpdateTaskStatus = async ({
        newStatus,
        newProgress,
    }: taskStatusUpdateHandleProp) => {
        setSaveExtensionRequestStatus(PENDING);
        const payload: { status: string; percentCompleted?: number } = {
            status: newStatus,
        };
        if (newProgress !== undefined) {
            payload.percentCompleted = newProgress;
        }

        const taskStatusUpdatePromise = isSelfTask
            ? updateSelfTask({ id: task.id, task: payload })
            : updateTask({ id: task.id, task: payload });

        setEditedTaskDetails((prev: CardTaskDetails) => ({
            ...prev,
            ...payload,
        }));

        try {
            await taskStatusUpdatePromise.unwrap();
            setSaveExtensionRequestStatus(SAVED);
            toast(SUCCESS, TASK_STATUS_UPDATE_SUCCESS_MESSAGE);
        } catch (error: any) {
            setSaveExtensionRequestStatus(ERROR_STATUS);
            toast(
                ERROR,
                error?.data?.message ?? TASK_STATUS_UPDATE_ERROR_MESSAGE
            );
        } finally {
            setTimeout(() => {
                setSaveExtensionRequestStatus('');
            }, 3000);
        }
    };

    return (
        <div className={styles.taskSection}>
            <TaskStatusDropdown
                isDevMode={isDevMode}
                oldStatus={task.status}
                oldProgress={task.percentCompleted}
                onChange={onChangeUpdateTaskStatus}
            />
        </div>
    );
};

export { TaskStatusEditMode, beautifyStatus };
