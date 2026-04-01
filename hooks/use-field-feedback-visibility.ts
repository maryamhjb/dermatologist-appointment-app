'use client'

import { useFormState, type Control, type FieldPath, type FieldValues } from 'react-hook-form'

/** True after the user has typed (dirty) or blurred (touched) — use for inline error/success UI. */
export function useFieldFeedbackVisibility<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>(control: Control<TFieldValues>, name: TName) {
  const { dirtyFields, touchedFields } = useFormState({ control })
  const dirty = Boolean(dirtyFields[name as keyof typeof dirtyFields])
  const touched = Boolean(touchedFields[name as keyof typeof touchedFields])
  return dirty || touched
}
