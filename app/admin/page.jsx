// app/admin/page.jsx
'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import ValidateUser from '../actions/validateUser'


export default function TabsDemo () {
  const [showAlert, setShowAlert] = useState(true)
  const [alertName, setAlertName] = useState('')
  const [alertPassword, setAlertPassword] = useState('')

  const  handleOkClick =async () => {
    console.log('Submit Data:', {
      name: alertName,
      password: alertPassword
    })
    const data = {
      userName: alertName,
      password: alertPassword
    }
    const response = await ValidateUser(data);
    setShowAlert(true);
  }

  return (
    <div className='flex-1 w-full gap-6'>
      <Dialog open={showAlert}>
        <form>
          <DialogContent className='sm:max-w-[425px]'>
            <DialogHeader>
              <DialogTitle>Login Admin</DialogTitle>
              <DialogDescription>
                Enter your credentials to access the admin panel.
              </DialogDescription>
            </DialogHeader>
            <div className='grid gap-4'>
              <div className='grid gap-3'>
                <Label htmlFor='name-1'>User Name</Label>
                <Input
                  id='name-1'
                  name='name'
                  type='text'
                  onChange={e => setAlertName(e.target.value)}
                  value={alertName}
                />
              </div>
              <div className='grid gap-3'>
                <Label htmlFor='username-1'>Password</Label>
                <Input
                  id='username-1'
                  value={alertPassword}
                  name='username'
                  type='password'
                  onChange={e => setAlertPassword(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleOkClick} type='submit'>
                Login
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>
      {!showAlert && (
        <Tabs defaultValue='account'>
          <TabsList>
            <TabsTrigger value='account'>Account</TabsTrigger>
            <TabsTrigger value='password'>Password</TabsTrigger>
          </TabsList>
          <TabsContent value='account'>
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>
                  Make changes to your account here. Click save when you&apos;re
                  done.
                </CardDescription>
              </CardHeader>
              <CardContent className='grid gap-6'>
                <div className='grid gap-3'>
                  <Label htmlFor='tabs-demo-name'>Name</Label>
                  <Input id='tabs-demo-name' defaultValue='Pedro Duarte' />
                </div>
                <div className='grid gap-3'>
                  <Label htmlFor='tabs-demo-username'>Username</Label>
                  <Input id='tabs-demo-username' defaultValue='@peduarte' />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value='password'>
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                  Change your password here. After saving, you&apos;ll be logged
                  out.
                </CardDescription>
              </CardHeader>
              <CardContent className='grid gap-6'>
                <div className='grid gap-3'>
                  <Label htmlFor='tabs-demo-current'>Current password</Label>
                  <Input id='tabs-demo-current' type='password' />
                </div>
                <div className='grid gap-3'>
                  <Label htmlFor='tabs-demo-new'>New password</Label>
                  <Input id='tabs-demo-new' type='password' />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save password</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
