import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

// Convert Excel serial date to JavaScript Date
function excelSerialToDate(serial) {
  if (typeof serial !== 'number') return new Date(serial);
  const utc_days = Math.floor(serial - 25569); // Excel epoch starts at 1900-01-01
  const utc_value = utc_days * 86400 * 1000; // Convert to milliseconds
  return new Date(utc_value);
}

export async function POST(request) {
  try {
    const {
      id,
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
      password,
      reseller_id,
      user_id
    } = await request.json()

    // console.log('received data', {
    //   id,
    //   date,
    //   reseller,
    //   hoDate,
    //   pkg,
    //   actDate,
    //   endDate,
    //   customer,
    //   address,
    //   name,
    //   email,
    //   tel,
    //   city,
    //   code,
    //   accMail,
    //   password,
    //   reseller_id,
    //   user_id
    // })

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      )
    }

    // Normalize DateTime fields
    const normalizedDate = date ? excelSerialToDate(date).toISOString() : undefined;
    const normalizedHoDate = hoDate ? excelSerialToDate(hoDate).toISOString() : null;
    const normalizedActDate = actDate ? excelSerialToDate(actDate).toISOString() : null;
    const normalizedEndDate = endDate ? excelSerialToDate(endDate).toISOString() : null;

    // Find the existing credentials record
    const existingCredentials = await prisma.credentials.findUnique({
      where: { id: Number(id) },
      include: {
        user: true,
        pkg: true
      }
    })

    if (!existingCredentials) {
      return NextResponse.json(
        { error: 'Credentials record not found' },
        { status: 404 }
      )
    }

    // Update user information if provided
    if (existingCredentials.user || user_id) {
      // If user_id is provided, update the user association
      if (user_id) {
        await prisma.credentials.update({
          where: { id: Number(id) },
          data: {
            user_id: Number(user_id)
          }
        });
      }
      
      // If user details are provided, update the user record
      if (existingCredentials.user && (name || email || customer || tel || address || city)) {
        await prisma.user.update({
          where: { id: existingCredentials.user_id },
          data: {
            ...(name && { name }),
            ...(email && { email }),
            ...(customer && { company: customer }),
            ...(tel && { tel: parseInt(tel) }),
            ...(address && { address }),
            ...(city && { city: parseInt(city) }),
            updated_at: new Date()
          }
        })
      }
    }

    // Update credentials information if provided
    if (existingCredentials) {
      // Find package if pkg name is provided
      let pkgId = existingCredentials.pkg_id
      if (pkg) {
        const packageRecord = await prisma.pkg.findFirst({
          where: { name: pkg }
        })
        if (packageRecord) {
          pkgId = packageRecord.id
        }
      }

      await prisma.credentials.update({
        where: { id: Number(id) },
        data: {
          ...(code && { code }),
          ...(accMail && { email: accMail }),
          ...(password && { password }),
          ...(pkgId && { pkg_id: pkgId }),
          ...(normalizedActDate && { actDate: normalizedActDate }),
          ...(normalizedEndDate && { endDate: normalizedEndDate }),
          updated_at: new Date()
        }
      })
    }

    // Update reseller association if reseller_id is provided
    if (reseller_id) {
      // Check if a sale record already exists for this credential
      const existingSale = await prisma.sales.findFirst({
        where: { credentials_id: Number(id) }
      });
      
      if (existingSale) {
        // Update existing sale record
        await prisma.sales.update({
          where: { id: existingSale.id },
          data: { reseller_id: Number(reseller_id) }
        });
      } else {
        // Create new sale record
        await prisma.sales.create({
          data: {
            reseller_id: Number(reseller_id),
            credentials_id: Number(id)
          }
        });
      }
    }

    // Return the updated data in the format expected by frontend
    const updatedCredentials = await prisma.credentials.findUnique({
      where: { id: Number(id) },
      include: {
        user: true,
        pkg: true,
        sales: {
          include: {
            reseller: true
          }
        }
      }
    })

    const responseData = {
      id: updatedCredentials.id,
      credential_id: updatedCredentials.id,
      user_id: updatedCredentials.user_id,
      actDate: updatedCredentials.actDate,
      endDate: updatedCredentials.endDate,
      created_at: updatedCredentials.created_at,
      updated_at: updatedCredentials.updated_at,
      // Flatten the related data
      reseller: updatedCredentials.sales?.[0]?.reseller?.company_name || null,
      customer: updatedCredentials.user?.company || updatedCredentials.user?.name || null,
      code: updatedCredentials.code || null,
      accMail: updatedCredentials.email || null,
      password: updatedCredentials.password || null,
      package: updatedCredentials.pkg?.name || null,
      name: updatedCredentials.user?.name || null,
      email: updatedCredentials.user?.email || null,
      tel: updatedCredentials.user?.tel || null,
      address: updatedCredentials.user?.address || null,
      city: updatedCredentials.user?.city || null,
      hoDate: null,
      date: updatedCredentials.created_at
    }

    return NextResponse.json({ 
      success: true,
      message: 'Record updated successfully',
      user: responseData 
    }, { status: 200 })
  } catch (error) {
    console.error('Error updating credentials data:', error)
    return NextResponse.json(
      { error: 'Failed to update credentials data', details: error.message },
      { status: 500 }
    )
  }
}