/**
 * Frustration detection hook stub - not implemented
 */

import { useState } from 'react'

export function useFrustrationDetection() {
  const [isFrustrated, setIsFrustrated] = useState(false)
  return { isFrustrated, setIsFrustrated }
}
