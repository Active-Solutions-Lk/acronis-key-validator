import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST (request) {
  try {
    const {
      id,
      mspCreate,
      date,
      reseller,
      hoDate,
      pkg,
      actDate,
      endDate,
      customer,
      address,
      name,
      email,
      tel,
      city,
      code,
      accMail,
      password
    } = await request.json()

    console.log('received data', {
      id,
      mspCreate,
      date,
      reseller,
      hoDate,
      pkg,
      actDate,
      endDate,
      customer,
      address,
      name,
      email,
      tel,
      city,
      code,
      accMail,
      password
    })

    // Validate required fields
    if (!date || !code || !accMail || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Normalize DateTime fields
    const normalizedActDate = actDate ? new Date(actDate).toISOString() : null
    const normalizedEndDate = endDate ? new Date(endDate).toISOString() : null

    // Update user in the database
    let user

    if (id === null || id === undefined) {
      // Create new record
      user = await prisma.master.create({
        data: {
          mspCreate,
          date: new Date(date).toISOString(),
          reseller: reseller ?? null,
          hoDate: hoDate ? new Date(hoDate).toISOString() : null,
          package: pkg,
          actDate: normalizedActDate,
          endDate: normalizedEndDate,
          customer,
          address,
          name,
          email,
          tel,
          city,
          code,
          accMail,
          password,
          created_at: new Date(),
          updated_at: new Date()
        }
      })
    } else {
      // Update existing record
      user = await prisma.master.update({
        where: { id },
        data: {
          mspCreate,
          date: new Date(date).toISOString(),
          reseller: reseller ?? null,
          hoDate: hoDate ? new Date(hoDate).toISOString() : null,
          package: pkg,
          actDate: normalizedActDate,
          endDate: normalizedEndDate,
          customer,
          address,
          name,
          email,
          tel,
          city,
          code,
          accMail,
          password,
          updated_at: new Date()
        }
      })
    }

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('Error updating master data:', error)
    return NextResponse.json(
      { error: 'Failed to update master data', details: error.message },
      { status: 500 }
    )
  }
}
