import { supabase } from './supabaseClient.js'

async function readFunctionError(error) {
  if (error?.context && typeof error.context.json === 'function') {
    try {
      const payload = await error.context.json()
      if (payload?.error) {
        return payload.error
      }
    } catch {
      // ignore parse errors
    }
  }

  return error?.message || 'Não foi possível concluir a operação.'
}

export async function invokeFunction(functionName, body) {
  const { data, error } = await supabase.functions.invoke(functionName, { body })

  if (data?.error) {
    throw new Error(data.error)
  }

  if (error) {
    throw new Error(await readFunctionError(error))
  }

  return data
}
