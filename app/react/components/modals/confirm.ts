import { ReactNode } from 'react';

import { openDialog, DialogOptions } from './Dialog';
import { OnSubmit, ModalType } from './Modal';
import { ButtonOptions } from './types';
import { buildCancelButton, buildConfirmButton } from './utils';

export type ConfirmCallback = OnSubmit<boolean>;

export interface ConfirmOptions
  extends Omit<DialogOptions<boolean>, 'title' | 'buttons'> {
  title: string;
  confirmButton?: ButtonOptions<true>;
  cancelButtonLabel?: string;
}

export async function openConfirm({
  confirmButton = buildConfirmButton(),
  cancelButtonLabel,
  ...options
}: ConfirmOptions) {
  const result = await openDialog({
    ...options,
    buttons: [buildCancelButton(cancelButtonLabel), confirmButton],
  });
  return !!result;
}

export function confirm(options: ConfirmOptions) {
  return openConfirm(options);
}

export function confirmDestructive(options: Omit<ConfirmOptions, 'modalType'>) {
  return openConfirm({
    ...options,
    modalType: ModalType.Destructive,
  });
}

export function confirmWebEditorDiscard() {
  return openConfirm({
    modalType: ModalType.Warn,
    title: '确定要离开吗？',
    message:
      '您当前在编辑器中有未保存的更改。确定要离开吗？',
    confirmButton: buildConfirmButton('是', 'danger'),
  });
}

export function confirmDelete(message: ReactNode) {
  return confirmDestructive({
    title: '确定要删除吗？',
    message,
    confirmButton: buildConfirmButton('删除', 'danger'),
  });
}

export async function confirmUpdate(
  message: string,
  callback: ConfirmCallback
) {
  const result = await openConfirm({
    title: '确定要更新吗？',
    modalType: ModalType.Warn,
    message,
    confirmButton: buildConfirmButton('更新'),
  });

  callback(result);

  return result;
}

export function confirmChangePassword() {
  return openConfirm({
    modalType: ModalType.Warn,
    title: '确定要更改密码吗？',
    message:
      '更改密码后，您将被注销。您要更改密码吗？',
    confirmButton: buildConfirmButton('更改'),
  });
}
