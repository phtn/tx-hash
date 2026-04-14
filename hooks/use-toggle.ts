import { useCallback, useMemo, useReducer, type SetStateAction } from 'react'

type ToggleNextValue = SetStateAction<boolean>

interface ToggleActions {
  off: () => void
  on: () => void
  set: (nextValue: ToggleNextValue) => void
  toggle: () => void
}

function toggleReducer(currentValue: boolean, nextValue?: ToggleNextValue) {
  if (typeof nextValue === 'function') {
    return nextValue(currentValue)
  }

  if (typeof nextValue === 'boolean') {
    return nextValue
  }

  return !currentValue
}

export function useToggle(initialValue = false): readonly [boolean, ToggleActions] {
  const [value, dispatch] = useReducer(toggleReducer, initialValue)

  const set = useCallback((nextValue: ToggleNextValue) => {
    dispatch(nextValue)
  }, [])

  const toggle = useCallback(() => {
    dispatch(undefined)
  }, [])

  const on = useCallback(() => {
    dispatch(true)
  }, [])

  const off = useCallback(() => {
    dispatch(false)
  }, [])

  const actions = useMemo(
    () => ({
      off,
      on,
      set,
      toggle
    }),
    [off, on, set, toggle]
  )

  return [value, actions] as const
}
