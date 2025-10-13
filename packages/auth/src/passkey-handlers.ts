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
  options?: { userName?: string; userDisplayName?: string }
) {
  const config = await createPasskeyConfig()
  return await libStartRegistration(userId, config, options)
}

export async function finishRegistration(
  userId: string,
  credential: any,
  options?: { userName?: string; userDisplayName?: string; deviceInfo?: any; managementOptions?: any }
) {
  const config = await createPasskeyConfig()
  const result = await libFinishRegistration(userId, credential, config, options)

  if (result.verified) {
    await createSession(userId)
  }

  return result
}

export async function startAuthentication(userId: string) {
  const config = await createPasskeyConfig()
  return await libStartAuthentication(userId, config)
}

export async function finishAuthentication(userId: string, credential: any) {
  const config = await createPasskeyConfig()
  const result = await libFinishAuthentication(userId, credential, config)

  if (result.verified) {
    await createSession(userId)
  }

  return result
}

export async function deletePasskey(userId: string, credentialId: string) {
  const config = await createPasskeyConfig()
  return await libDeletePasskey(userId, credentialId, config)
}

export async function listPasskeys(userId: string) {
  const config = await createPasskeyConfig()
  return await libListUserPasskeys(userId, config)
}

