import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { writeToSheet } from '@/lib/google/sheets'
import { handleApiError } from '@/lib/utils/api-error'
import { env } from '@/lib/config/env'

/**
 * GET - Probar conexión con Google Sheets
 */
export async function GET() {
  try {
    await requireAdmin()

    // Verificar que las variables estén configuradas
    if (!env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !env.GOOGLE_PRIVATE_KEY || !env.GOOGLE_SHEET_ID) {
      return NextResponse.json({
        success: false,
        error: 'Google Sheets no está configurado',
        missing: {
          serviceAccountEmail: !env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          privateKey: !env.GOOGLE_PRIVATE_KEY,
          sheetId: !env.GOOGLE_SHEET_ID,
        },
      }, { status: 400 })
    }

    // Intentar escribir una hoja de prueba
    const testSheetName = `Test Conexión - ${new Date().toISOString().split('T')[0]}`
    const headers = ['Fecha', 'Hora', 'Estado', 'Mensaje']
    const rows = [[
      new Date().toLocaleDateString('es-CO'),
      new Date().toLocaleTimeString('es-CO'),
      'OK',
      'Conexión con Google Sheets exitosa',
    ]]

    await writeToSheet(testSheetName, headers, rows)

    return NextResponse.json({
      success: true,
      message: 'Conexión con Google Sheets exitosa',
      sheetName: testSheetName,
      config: {
        serviceAccountEmail: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        sheetId: env.GOOGLE_SHEET_ID,
        privateKeyLength: env.GOOGLE_PRIVATE_KEY?.length || 0,
      },
    })

  } catch (error) {
    return handleApiError('/api/admin/reports/test', error)
  }
}
