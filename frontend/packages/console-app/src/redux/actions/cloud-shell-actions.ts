import { useCallback } from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore: FIXME missing exports due to out-of-sync @types/react-redux version
import { useDispatch, Dispatch } from 'react-redux';
import { RootState } from '@console/internal/redux';
import { action, ActionType } from 'typesafe-actions';
import { isCloudShellExpanded, isCloudShellActive } from '../reducers/cloud-shell-selectors';

export enum Actions {
  SetCloudShellExpanded = 'setCloudShellExpanded',
  SetCloudShellActive = 'setCloudShellActive',
  SetCloudShellCommand = 'SetCloudShellCommand',
}

const cloudShellCommand = (command: string | null) =>
  action(Actions.SetCloudShellCommand, { command });

export const useCloudShellCommandDispatch = (): ((command: string | null) => void) => {
  const dispatch = useDispatch();
  const setCloudShellCommand = useCallback(
    (command: string) => {
      dispatch(cloudShellCommand(command));
    },
    [dispatch],
  );
  return setCloudShellCommand;
};

export const setCloudShellExpanded = (isExpanded: boolean) =>
  action(Actions.SetCloudShellExpanded, { isExpanded });

export const toggleCloudShellExpanded = () => async (
  dispatch: Dispatch,
  getState: () => RootState,
) => {
  const expanded = isCloudShellExpanded(getState());
  if (expanded && isCloudShellActive(getState())) {
    (await import('../../components/cloud-shell/cloudShellConfirmationModal')).default(() =>
      dispatch(setCloudShellExpanded(false)),
    );
  } else {
    dispatch(setCloudShellExpanded(!expanded));
  }
};

export const setCloudShellActive = (isActive: boolean) =>
  action(Actions.SetCloudShellActive, { isActive });

const actions = {
  setCloudShellExpanded,
  setCloudShellActive,
  cloudShellCommand,
};

export type CloudShellActions = ActionType<typeof actions>;
