interface ApiSuccess<T> {
  success: true
  data: T
}

/** Thin wrapper around $fetch that unwraps our { success, data } response shape. */
export async function useApi<T>(url: string, options: Parameters<typeof $fetch>[1] = {}): Promise<T> {
  const res = await $fetch<ApiSuccess<T>>(url, {
    ...options,
    onResponseError({ response }) {
      const message = (response._data as { statusMessage?: string; message?: string } | undefined)
        ?.statusMessage || (response._data as { message?: string } | undefined)?.message
      throw new Error(message || 'Something went wrong. Please try again.')
    }
  })
  return res.data
}
