import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkData() {
  try {
    console.log('\n===== CHECKING IMPORTED DATA =====\n')
    
    const flats = await prisma.flat.findMany({
      include: {
        flatmates: true
      }
    })
    
    console.log(`Total Flats: ${flats.length}`)
    console.log('\n----- FLAT DETAILS -----\n')
    
    flats.forEach((flat, index) => {
      console.log(`${index + 1}. Flat: ${flat.number}`)
      console.log(`   BHK: ${flat.bhk || 'N/A'}`)
      console.log(`   Area: ${flat.sizeSqft || 'N/A'} sqft`)
      console.log(`   Floor: ${flat.floor || 'N/A'}`)
      console.log(`   Flatmates: ${flat.flatmates.length}`)
      
      if (flat.flatmates.length > 0) {
        flat.flatmates.forEach(fm => {
          console.log(`      - ${fm.fullName}`)
          console.log(`        Phone: ${fm.phone || 'N/A'}`)
          console.log(`        Email: ${fm.email || 'N/A'}`)
        })
      }
      console.log('')
    })
    
    console.log('===== DATA CHECK COMPLETE =====\n')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkData()
