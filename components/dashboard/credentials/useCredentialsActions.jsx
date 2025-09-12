"use client"
import * as React from "react"
import UpdateCredential from '../../../app/actions/updateCredential'
import DeleteCredential, { BulkDeleteCredentials } from '../../../app/actions/deleteCredential'
import { toast } from "sonner"

export function useCredentialsActions(data, setData, setRowSelection) {
  const togglePasswordVisibility = React.useCallback((id, showPasswords, setShowPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }, [])

  const handleInlineEdit = React.useCallback(async (rowId, field, value) => {
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
        console.log("Inline editing:", { rowId, field, value })
      } else {
        toast.error(result.error || 'Failed to update field')
      }
    } catch (error) {
      console.error('Error updating field:', error)
      toast.error('An unexpected error occurred')
    }
  }, [data, setData])

  const handleDeleteCredential = React.useCallback(async (id) => {
    try {
      const result = await DeleteCredential(id)
      
      if (result.success) {
        setData(prev => prev.filter(item => item.id !== id))
        toast.success(result.message || 'Credential deleted successfully')
        console.log("Deleting credential with ID:", id)
      } else {
        toast.error(result.error || 'Failed to delete credential')
      }
    } catch (error) {
      console.error('Error deleting credential:', error)
      toast.error('An unexpected error occurred')
    }
  }, [setData])

  const handleBulkDelete = React.useCallback(async (rowSelection) => {
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
        console.log("Bulk deleting credentials with IDs:", selectedIds)
      } else {
        toast.error(result.error || 'Failed to delete credentials')
      }
    } catch (error) {
      console.error('Error bulk deleting credentials:', error)
      toast.error('An unexpected error occurred')
    }
  }, [data, setData, setRowSelection])

  return {
    togglePasswordVisibility,
    handleInlineEdit,
    handleDeleteCredential,
    handleBulkDelete
  }
}