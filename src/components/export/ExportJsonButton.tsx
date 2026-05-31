import { Button } from '../ui/Button'

type ExportJsonButtonProps = {
  label: string
  onClick: () => void
  disabled?: boolean
}

export function ExportJsonButton({ label, onClick, disabled }: ExportJsonButtonProps) {
  return (
    <Button type="button" variant="secondary" onClick={onClick} disabled={disabled}>
      {label}
    </Button>
  )
}
