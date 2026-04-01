/**
 * Ant org warning notification hook stub - not implemented
 */

import { useState } from 'react'

export function useAntOrgWarningNotification() {
  const [showWarning, setShowWarning] = useState(false)
  return { showWarning, setShowWarning }
}
