// components/ui/ToastContainer.tsx  (o ToastWrapper.tsx)
'use client';

import { Toast } from '@heroui/react';

export function ToastContainer() {
  return <Toast.Container placement="bottom end" gap={14} maxVisibleToasts={3} />;
}
