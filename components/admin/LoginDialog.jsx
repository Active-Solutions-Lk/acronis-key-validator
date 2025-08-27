// components/LoginDialog.jsx
import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function LoginDialog({
  showAlert,
  alertName,
  setAlertName,
  alertPassword,
  setAlertPassword,
  message,
  setMessage,
  loading,
  handleOkClick
}) {
  // Prevent dialog from closing unless explicitly allowed
  const handleOpenChange = (open) => {
    if (!open) {
      // Ignore attempts to close the dialog
      return
    }
  }

  return (
    <Dialog open={showAlert} onOpenChange={handleOpenChange}>
      <form>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Login Admin</DialogTitle>
            <DialogDescription>
              Enter your credentials to access the admin panel. You must log in to proceed.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">User Name</Label>
              <Input
                id="name-1"
                name="name"
                type="text"
                onChange={(e) => setAlertName(e.target.value)}
                value={alertName}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="username-1">Password</Label>
              <Input
                id="username-1"
                value={alertPassword}
                name="username"
                type="password"
                onChange={(e) => setAlertPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            {message && <p className="text-red-500">{message}</p>}
            <Button onClick={handleOkClick} type="submit" disabled={loading}>
              {loading ? 'Validating...' : 'Login'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}

export default LoginDialog