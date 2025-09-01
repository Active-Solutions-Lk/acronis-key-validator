import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request) {
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
    if (id === null || id === undefined) {
      // For creating new records, require date (non-nullable in schema)
      if (!date) {
        return NextResponse.json(
          { error: 'Missing required field: date' },
          { status: 400 }
        )
      }
    } else {
      // For updates, only require id
      if (!id) {
        return NextResponse.json(
          { error: 'Missing required field: id' },
          { status: 400 }
        )
      }
    }

    // Normalize DateTime fields
    const normalizedActDate = actDate ? new Date(actDate).toISOString() : null
    const normalizedEndDate = endDate ? new Date(endDate).toISOString() : null

    // Update or create record
    let user

    if (id === null || id === undefined) {
      // Create new record
      user = await prisma.master.create({
        data: {
          mspCreate: mspCreate ?? null,
          date: new Date(date).toISOString(),
          reseller: reseller ?? null,
          hoDate: hoDate ? new Date(hoDate).toISOString() : null,
          package: pkg ?? null,
          actDate: normalizedActDate,
          endDate: normalizedEndDate,
          customer: customer ?? null,
          address: address ?? null,
          name: name ?? null,
          email: email ?? null,
          tel: tel ?? null,
          city: city ?? null,
          code: code ?? null,
          accMail: accMail ?? null,
          password: password ?? null,
          created_at: new Date(),
          updated_at: new Date()
        }
      })
    } else {
      // Update existing record
      user = await prisma.master.update({
        where: { id: Number(id) },
        data: {
          mspCreate: mspCreate ?? null,
          date: date ? new Date(date).toISOString() : undefined,
          reseller: reseller ?? null,
          hoDate: hoDate ? new Date(hoDate).toISOString() : null,
          package: pkg ?? null,
          actDate: normalizedActDate,
          endDate: normalizedEndDate,
          customer: customer ?? null,
          address: address ?? null,
          name: name ?? null,
          email: email ?? null,
          tel: tel ?? null,
          city: city ?? null,
          code: code ?? null,
          accMail: accMail ?? null,
          password: password ?? null,
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