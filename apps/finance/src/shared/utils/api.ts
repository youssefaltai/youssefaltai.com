import { ApiResponse } from "@repo/types"
import { NextRequest, NextResponse } from "next/server"
import { COOKIE_NAME } from "@repo/auth"  // Edge-safe export

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
    
    // Clear invalid auth cookie
    response.cookies.set(COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        domain: process.env.NODE_ENV === 'production' ? '.youssefaltai.com' : undefined,
        path: '/',
        maxAge: 0, // Immediate expiration
    })
    
    return response as NextResponse<ApiResponse<T>>
}

export function BadRequestResponse<T>(error?: any): NextResponse<ApiResponse<T>> {
    return NextResponse.json({ success: false, data: null, message: "Bad Request", error }, { status: 400 })
}

export function NotFoundResponse<T>(message?: string): NextResponse<ApiResponse<T>> {
    return NextResponse.json({ success: false, data: null, message: message || "Not Found", error: null }, { status: 404 })
}

export function InternalServerErrorResponse<T>(error?: any): NextResponse<ApiResponse<T>> {
    return NextResponse.json({ success: false, data: null, message: "Internal Server Error", error }, { status: 500 })
}

export function SuccessResponse<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
    return NextResponse.json({ success: true, data, message: message ?? "Success", error: null }, { status: 200 })
}