import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from './ui'
import type { ButtonVariant } from './ui'

interface Props {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: Extract<ButtonVariant, 'primary' | 'danger'>
  onConfirm: () => Promise<unknown> | void
  onClose: () => void
}

/** Geri qaytarıla bilməyən əməliyyatlar üçün təsdiq dialoqu */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Təsdiqlə',
  cancelLabel = 'Ləğv et',
  tone = 'danger',
  onConfirm,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false)

  const run = async () => {
    setLoading(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm leading-relaxed text-ink-600">{description}</p>
      <div className="mt-5 flex gap-2">
        <Button variant="secondary" block onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={tone} block loading={loading} onClick={run}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
