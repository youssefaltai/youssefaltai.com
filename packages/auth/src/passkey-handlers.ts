import {
  startRegistration as libStartRegistration,
  finishRegistration as libFinishRegistration,
  startAuthentication as libStartAuthentication,
  finishAuthentication as libFinishAuthentication,
  deletePasskey as libDeletePasskey,
  listUserPasskeys as libListUserPasskeys,
} from 'next-passkey-webauthn/server'
import { createPasskeyConfig } from './lib/passkey-config'
import { createSession } from './lib/session-simple'

export async function startRegistration(
  userId: string,
  request: Request,
  options?: { userName?: string; userDisplayName?: string }
) {
  const config = await createPasskeyConfig(request)
  return await libStartRegistration(userId, config, options)
}

export async function finishRegistration(
  userId: string,
  credential: any,
  request: Request,
  options?: { userName?: string; userDisplayName?: string; deviceInfo?: any; managementOptions?: any }
) {
  const config = await createPasskeyConfig(request)
  const result = await libFinishRegistration(userId, credential, config, options)
  
  if (result.verified) {
    await createSession(userId)
  }
  
  return result
}

export async function startAuthentication(userId: string, request: Request) {
  const config = await createPasskeyConfig(request)
  return await libStartAuthentication(userId, config)
}

export async function finishAuthentication(userId: string, credential: any, request: Request) {
  const config = await createPasskeyConfig(request)
  const result = await libFinishAuthentication(userId, credential, config)
  
  if (result.verified) {
    await createSession(userId)
  }
  
  return result
}

export async function deletePasskey(userId: string, credentialId: string, request: Request) {
  const config = await createPasskeyConfig(request)
  return await libDeletePasskey(userId, credentialId, config)
}

export async function listPasskeys(userId: string, request: Request) {
  const config = await createPasskeyConfig(request)
  return await libListUserPasskeys(userId, config)
}

