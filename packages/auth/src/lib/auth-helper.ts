import { getSession } from './session-simple'

export async function requireAuth(): Promise<string | Response> {
  const userId = await getSession()
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  return userId
}

export async function requireMatchingUser(
  requestedUserId: string
): Promise<true | Response> {
  const userId = await getSession()
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  if (userId !== requestedUserId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  return true
}

