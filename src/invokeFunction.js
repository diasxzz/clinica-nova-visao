import { supabase } from './supabaseClient.js'

export async function invokeFunction(functionName, body) {
  const { data, error } = await supabase.functions.invoke(functionName, { body })

  if (data?.error) {
    throw new Error(data.error)
  }

  if (error) {
    throw new Error(error.message || 'Não foi possível concluir a operação.')
  }

  return data
}
