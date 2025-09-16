import { PrismaClient } from './generated/prisma/index.js';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Severity levels
export const SEVERITY = {
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

// Action types
export const ACTION = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  READ: 'READ',
  LOGIN: 'LOGIN',
  SYNC: 'SYNC'
};

/**
 * Get the current admin ID from the session
 * @returns {Promise<number|null>} The current admin ID or null if not authenticated
 */
async function getCurrentAdminId() {
  try {
    // Check if we're in a Next.js server component context where cookies() is available
    if (typeof cookies === 'function') {
      let cookieStore;
      try {
        cookieStore = await cookies();
      } catch (error) {
        // In production, we might want to log this only in development
        if (process.env.NODE_ENV === 'development') {
          console.log('Cookies not available in current context:', error.message);
        }
        return null;
      }
      
      const sessionCookie = cookieStore.get('session');

      if (process.env.NODE_ENV === 'development') {
        console.log('Session cookie in logger:', sessionCookie);
      }
      
      if (!sessionCookie || !sessionCookie.value) {
        if (process.env.NODE_ENV === 'development') {
          console.log('No session cookie found');
        }
        return null;
      }
      
      // Use the same JWT_SECRET as in auth.js
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
      let decoded;
      try {
        decoded = jwt.verify(sessionCookie.value, JWT_SECRET);
      } catch (error) {
        // In production, we might want to log this only in development
        if (process.env.NODE_ENV === 'development') {
          console.warn('Error verifying JWT token:', error.message);
        }
        return null;
      }
      
      if (!decoded || !decoded.userId) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Invalid JWT token or missing userId');
        }
        return null;
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('Decoded session in logger:', decoded);
      }
      
      // Validate that the admin exists
      const admin = await prisma.admin.findUnique({
        where: { id: decoded.userId }
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('Admin found in logger:', admin);
      }
      
      return admin ? admin.id : null;
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('Cookies function not available in this context');
      }
      return null;
    }
  } catch (error) {
    // In production, we might want to log this only in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Error getting current admin ID from session:', error);
    }
    return null;
  }
}

/**
 * Log an action to the logs table
 * @param {Object} params - Log parameters
 * @param {string} params.relatedTable - The table related to this log entry
 * @param {number} params.relatedTableId - The ID of the related record
 * @param {number} params.severity - Severity level (1=info, 2=warning, 3=error)
 * @param {string} params.message - Log message
 * @param {number} params.adminId - ID of the admin user performing the action (optional, will be auto-extracted from session if not provided)
 * @param {string} params.action - Action type (CREATE, UPDATE, DELETE, etc.)
 * @param {number} params.statusCode - HTTP status code or custom status
 * @param {Object|string} params.additionalData - Additional data to store
 */
export const logAction = async ({
  relatedTable,
  relatedTableId,
  severity,
  message,
  adminId, // This is now optional
  action,
  statusCode,
  additionalData
}) => {
  try {
    // If adminId is not provided, try to get it from the session
    let validatedAdminId = adminId;
    if (!validatedAdminId) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Attempting to extract adminId from session...');
      }
      validatedAdminId = await getCurrentAdminId();
      if (process.env.NODE_ENV === 'development') {
        console.log('Extracted adminId from session:', validatedAdminId);
      }
    } else {
      // If adminId was provided, validate that the admin exists
      try {
        const admin = await prisma.admin.findUnique({
          where: { id: adminId }
        });
        if (!admin) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Provided adminId does not exist:', adminId);
          }
          validatedAdminId = null; // Admin doesn't exist
        }
      } catch (error) {
        // In production, we might want to log this only in development
        if (process.env.NODE_ENV === 'development') {
          console.warn('Error checking provided admin existence:', error);
        }
        validatedAdminId = null;
      }
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Creating log entry with admin_id:', validatedAdminId);
    }
    
    await prisma.logs.create({
      data: {
        related_table: relatedTable,
        related_table_id: relatedTableId,
        severity: severity,
        message: message,
        admin_id: validatedAdminId, // Will be null if admin doesn't exist or wasn't provided and couldn't be extracted
        action: action,
        status_code: statusCode,
        additional_data: additionalData ? JSON.stringify(additionalData) : null,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
  } catch (error) {
    // In production, we might want to log this only in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to create log entry:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
};

// Convenience functions for common logging scenarios
export const logInfo = (params) => logAction({ ...params, severity: SEVERITY.INFO });
export const logWarn = (params) => logAction({ ...params, severity: SEVERITY.WARN });
export const logError = (params) => logAction({ ...params, severity: SEVERITY.ERROR });