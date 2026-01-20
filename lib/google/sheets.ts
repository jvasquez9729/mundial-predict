import { google } from 'googleapis'
import { env } from '@/lib/config/env'
import { logApiError } from '@/lib/utils/logger'

/**
 * Cliente autenticado de Google Sheets
 */
async function getSheetsClient() {
  if (!env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !env.GOOGLE_PRIVATE_KEY || !env.GOOGLE_SHEET_ID) {
    throw new Error('Google Sheets no está configurado. Verifica las variables de entorno GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY y GOOGLE_SHEET_ID')
  }

  const auth = new google.auth.JWT({
    email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Reemplazar \n reales
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  return google.sheets({ version: 'v4', auth })
}

/**
 * Escribir datos en una hoja de Google Sheets
 */
export async function writeToSheet(
  sheetName: string,
  headers: string[],
  rows: (string | number)[][]
): Promise<void> {
  try {
    const sheets = await getSheetsClient()
    const spreadsheetId = env.GOOGLE_SHEET_ID!

    // Verificar si la hoja existe, si no crearla
    try {
      await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1`,
      })
    } catch {
      // La hoja no existe, crearla
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName,
                },
              },
            },
          ],
        },
      })
    }

    // Limpiar la hoja si tiene datos (opcional - puedes comentar esto si quieres append)
    // await sheets.spreadsheets.values.clear({
    //   spreadsheetId,
    //   range: `${sheetName}!A:Z`,
    // })

    // Escribir headers y datos
    const values = [headers, ...rows]

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    })

    // Aplicar formato a los headers (negrita)
    const sheetId = await getSheetId(sheets, spreadsheetId, sheetName)
    if (sheetId) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId,
                  startRowIndex: 0,
                  endRowIndex: 1,
                },
                cell: {
                  userEnteredFormat: {
                    textFormat: {
                      bold: true,
                    },
                    backgroundColor: {
                      red: 0.9,
                      green: 0.9,
                      blue: 0.9,
                    },
                  },
                },
                fields: 'userEnteredFormat(textFormat,backgroundColor)',
              },
            },
            // Congelar primera fila
            {
              updateSheetProperties: {
                properties: {
                  sheetId,
                  gridProperties: {
                    frozenRowCount: 1,
                  },
                },
                fields: 'gridProperties.frozenRowCount',
              },
            },
          ],
        },
      })
    }
  } catch (error) {
    logApiError('Google Sheets writeToSheet', error)
    throw error
  }
}

/**
 * Obtener el ID de una hoja por nombre
 */
async function getSheetId(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  sheetName: string
): Promise<number | null> {
  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    })
    const sheet = response.data.sheets?.find((s) => s.properties?.title === sheetName)
    return sheet?.properties?.sheetId || null
  } catch {
    return null
  }
}

/**
 * Añadir datos a una hoja existente (append)
 */
export async function appendToSheet(
  sheetName: string,
  rows: (string | number)[][]
): Promise<void> {
  try {
    const sheets = await getSheetsClient()
    const spreadsheetId = env.GOOGLE_SHEET_ID!

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: rows,
      },
    })
  } catch (error) {
    logApiError('Google Sheets appendToSheet', error)
    throw error
  }
}
