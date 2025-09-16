"use client"
import * as React from "react"
import UpdateCredential from '../../../app/actions/updateCredential'
import DeleteCredential, { BulkDeleteCredentials } from '../../../app/actions/deleteCredential'
import { toast } from "sonner"
import { usePermissions } from '@/hooks/usePermissions'

export function useCredentialsActions(data, setData, setRowSelection) {
  // Get permissions
  const { canEdit, canDelete } = usePermissions()
  
  const togglePasswordVisibility = React.useCallback((id, showPasswords, setShowPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }, [])

  const handleInlineEdit = React.useCallback(async (rowId, field, value) => {
    // Check if user has permission to edit
    if (!canEdit('credentials')) {
      toast.error('You do not have permission to edit credentials')
      return
    }
    
    try {
      const credential = data.find(item => item.id === rowId)
      if (!credential) return

      const updateData = { [field]: value }
      const result = await UpdateCredential(rowId, updateData)
      
      if (result.success) {
        const updatedData = data.map(item => 
          item.id === rowId 
            ? { ...item, [field]: value, updated_at: new Date().toISOString() }
            : item
        )
        setData(updatedData)
        toast.success('Field updated successfully')
    //    console.log("Inline editing:", { rowId, field, value })
      } else {
        toast.error(result.error || 'Failed to update field')
      }
    } catch (error) {
      console.error('Error updating field:', error)
      toast.error('An unexpected error occurred')
    }
  }, [data, setData, canEdit])

  const handleDeleteCredential = React.useCallback(async (id) => {
    // Check if user has permission to delete
    if (!canDelete('credentials')) {
      toast.error('You do not have permission to delete credentials')
      return
    }
    
    try {
      const result = await DeleteCredential(id)
      
      if (result.success) {
        setData(prev => prev.filter(item => item.id !== id))
        toast.success(result.message || 'Credential deleted successfully')
      //  console.log("Deleting credential with ID:", id)
      } else {
        toast.error(result.error || 'Failed to delete credential')
      }
    } catch (error) {
      console.error('Error deleting credential:', error)
      toast.error('An unexpected error occurred')
    }
  }, [setData, canDelete])

  const handleBulkDelete = React.useCallback(async (rowSelection) => {
    // Check if user has permission to delete
    if (!canDelete('credentials')) {
      toast.error('You do not have permission to delete credentials')
      return
    }
    
    try {
      const selectedIds = Object.keys(rowSelection).map(key => data[parseInt(key)].id)
      
      if (selectedIds.length === 0) {
        toast.error('No credentials selected')
        return
      }

      const result = await BulkDeleteCredentials(selectedIds)
      
      if (result.success) {
        setData(prev => prev.filter(item => !selectedIds.includes(item.id)))
        setRowSelection({})
        toast.success(result.message || `Successfully deleted ${result.deletedCount} credential(s)`)
      //  console.log("Bulk deleting credentials with IDs:", selectedIds)
      } else {
        toast.error(result.error || 'Failed to delete credentials')
      }
    } catch (error) {
      console.error('Error bulk deleting credentials:', error)
      toast.error('An unexpected error occurred')
    }
  }, [data, setData, setRowSelection, canDelete])

  return {
    togglePasswordVisibility,
    handleInlineEdit,
    handleDeleteCredential,
    handleBulkDelete
  }
}