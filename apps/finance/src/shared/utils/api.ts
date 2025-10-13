import { ApiResponse } from "@repo/types"
import { NextRequest, NextResponse } from "next/server"

const SESSION_COOKIE = 'passkey_session'

export async function getJsonInput(request: NextRequest) {
    try {
        return await request.json()
    } catch {
        return null
    }
}

export async function getFormDataInput(request: NextRequest) {
    try {
        return await request.formData()
    } catch {
        return null
    }
}

export function getQueryParamsInput(request: NextRequest) {
    try {
        return request.nextUrl.searchParams
    } catch {
        return null
    }
}

export function getPathParamsInput(request: NextRequest) {
    try {
        return request.nextUrl.pathname
    } catch {
        return null
    }
}

export function UnauthorizedResponse<T>(userId: string | null | undefined): NextResponse<ApiResponse<T>> {
    const response = NextResponse.json(
        { success: false as const, data: null, message: "Unauthorized", error: { userId } }, 
        { status: 401 }
    )
    
    response.cookies.set(SESSION_COOKIE, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        domain: process.env.NODE_ENV === 'production' ? '.youssefaltai.com' : undefined,
        path: '/',
        maxAge: 0,
    })
    
    return response as NextResponse<ApiResponse<T>>
}

export function BadRequestResponse<T>(error?: unknown): NextResponse<ApiResponse<T>> {
    return NextResponse.json({ success: false, data: null, message: "Bad Request", error }, { status: 400 })
}

export function NotFoundResponse<T>(message?: string): NextResponse<ApiResponse<T>> {
    return NextResponse.json({ success: false, data: null, message: message || "Not Found", error: null }, { status: 404 })
}

export function InternalServerErrorResponse<T>(error?: unknown): NextResponse<ApiResponse<T>> {
    return NextResponse.json({ success: false, data: null, message: "Internal Server Error", error }, { status: 500 })
}

export function SuccessResponse<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
    return NextResponse.json({ success: true, data, message: message ?? "Success", error: null }, { status: 200 })
}

/**
 * Generic CRUD route handler factory
 * Creates standard POST/GET handlers for account-type resources
 * Eliminates ~30 lines of boilerplate per resource
 */
import { verifyAuth } from "@repo/auth/verify-auth"

export function createAccountRouteHandlers<T>(config: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createFn: (userId: string, data: any) => Promise<T>
  getAllFn: (userId: string) => Promise<T[]>
}) {
  const { createFn, getAllFn } = config

  async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<T>>> {
    const { authenticated, userId } = await verifyAuth()
    if (!authenticated) return UnauthorizedResponse(userId)

    const jsonInput = await getJsonInput(request)
    if (!jsonInput) return BadRequestResponse(jsonInput)

    try {
      const response = await createFn(userId, jsonInput)
      return SuccessResponse(response)
    } catch (error) {
      console.error('Error in POST:', error)
      return BadRequestResponse<T>(error instanceof Error ? error.message : 'Failed to create resource')
    }
  }

  async function GET(): Promise<NextResponse<ApiResponse<T[]>>> {
    const { authenticated, userId } = await verifyAuth()
    if (!authenticated) return UnauthorizedResponse(userId)

    try {
      const response = await getAllFn(userId)
      return SuccessResponse(response)
    } catch (error) {
      console.error('Error in GET:', error)
      return BadRequestResponse<T[]>(error instanceof Error ? error.message : 'Failed to get resources')
    }
  }

  return { POST, GET }
}