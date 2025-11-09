import { Router } from 'express'
import multer from 'multer'
import * as XLSX from 'xlsx'
import { prisma } from '../lib/prisma'

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

type Row = Record<string, any>

function getCell<T = any>(row: Row, keys: string[], transform?: (v: any) => T): T | undefined {
  const foundKey = Object.keys(row).find(k => keys.some(h => k.toLowerCase().includes(h)))
  if (!foundKey) return undefined
  const val = row[foundKey]
  return transform ? transform(val) : (val as T)
}

function toNumber(v: any): number | undefined {
  if (v === undefined || v === null || v === '') return undefined
  const n = typeof v === 'number' ? v : Number(String(v).replace(/[^0-9.\-]/g, ''))
  return Number.isFinite(n) ? n : undefined
}

router.post('/excel', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'file is required (field name: file)' })
  try {
    const wb = XLSX.read(req.file.buffer, { type: 'buffer' })
    // Always use the first sheet
    const sheetName = wb.SheetNames[0]
    const ws = wb.Sheets[sheetName]
    const json: Row[] = XLSX.utils.sheet_to_json(ws, { defval: null })

    const upserts = [] as Promise<any>[]

    for (const row of json) {
      const number = getCell<string>(row, ['flat', 'apt', 'unit', 'door', 'no'])?.toString().trim()
      if (!number) continue
      const floor = getCell<number>(row, ['floor', 'lvl'], toNumber)
      const bhk = getCell<string>(row, ['bhk', 'type', 'bedroom'])?.toString().trim()
      const sizeSqft = getCell<number>(row, ['sqft', 'area', 'size'], toNumber)
      const name = getCell<string>(row, ['name', 'owner', 'resident'])?.toString().trim()
      const email = getCell<string>(row, ['email', 'mail'])?.toString().trim()
      const phone = getCell<string>(row, ['phone', 'mobile', 'contact'])?.toString().trim()
      // Use 'Per Sq. Feet basis' column as the fixed monthly amount for the flat.
      // Ignore any 'Fixed Basis' column completely.
      const perSqFtBasisAmount = toNumber(
        getCell(row, [
          'per sq. feet basis',
          'per sq feet basis',
          'per sqft basis',
          'per sq ft basis',
          'per sq. ft. basis',
          'per sq ft'
        ])
      )

      const fixedMonthlyDue = perSqFtBasisAmount
      const maintenanceBasis = fixedMonthlyDue ? 'fixed' : 'per_sqft'

      upserts.push(
        prisma.flat.upsert({
          where: { number },
          update: {
            floor: floor ?? undefined,
            bhk: bhk ?? undefined,
            sizeSqft: sizeSqft ?? undefined,
            maintenanceBasis: maintenanceBasis as any,
            fixedMonthlyDue: fixedMonthlyDue ? new prisma.Prisma.Decimal(fixedMonthlyDue) : undefined,
          },
          create: {
            number,
            floor: floor ?? undefined,
            bhk: bhk ?? undefined,
            sizeSqft: sizeSqft ?? undefined,
            maintenanceBasis: maintenanceBasis as any,
            fixedMonthlyDue: fixedMonthlyDue ? new prisma.Prisma.Decimal(fixedMonthlyDue) : undefined,
          }
        }).then(async flat => {
          if (name) {
            await prisma.flatmate.upsert({
              where: { id: 0 }, // force create below
              update: {},
              create: {
                fullName: name,
                email: email ?? undefined,
                phone: phone ?? undefined,
                flatId: flat.id,
              }
            }).catch(async () => {
              // No natural unique on flatmate; create without upsert
              await prisma.flatmate.create({ data: { fullName: name, email: email ?? undefined, phone: phone ?? undefined, flatId: flat.id } })
            })
          }
        })
      )
    }

    await Promise.all(upserts)
    res.json({ imported: upserts.length })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) })
  }
})

export default router


