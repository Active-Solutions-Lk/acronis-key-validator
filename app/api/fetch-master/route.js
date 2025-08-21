'use server'

import prisma from '@/lib/prisma'

export async function GET () {
  try {
    const record = await prisma.master.findMany()

    if (!record) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No records available in the data base'
        }),
        { status: 404 }
      )
    }

    // console.log('Master data fetched successfully:', record)

    return new Response(
      JSON.stringify({ success: true, data: record }),
      { status: 200 }
    )
  } catch (err) {
    console.error('API error:', err)
    return new Response(
      JSON.stringify({ success: false, error: 'Server error' }),
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
