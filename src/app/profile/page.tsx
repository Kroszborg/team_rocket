'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth, withAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { toast } from 'sonner'

interface ProfileData {
  full_name: string;
  company?: string;
  role?: string;
}

const profileSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  company: z.string().optional(),
  role: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

function ProfilePage() {
  const { user, signOut } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      company: '',
      role: '',
    },
  })

  const { isSubmitting } = form.formState

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true)
      try {
        const profileData: ProfileData = await apiClient.getProfile()
        if (profileData) {
          form.reset({
            full_name: profileData.full_name || user?.full_name || '',
            company: profileData.company || '',
            role: profileData.role || '',
          })
        }
      } catch (error) {
        console.error('Failed to fetch profile', error)
        toast.error('Failed to load your profile data.')
        // Set form defaults from auth context if API fails
        form.reset({ full_name: user?.full_name || '' })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchProfile()
    }
  }, [user, form])

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      await apiClient.updateProfile(values)
      toast.success('Your profile has been updated.')
    } catch (error) {
      console.error('Failed to update profile', error)
      toast.error('Failed to update your profile.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-3xl py-8 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and personal information.</p>
      </header>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details here.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user?.email || ''} disabled className="cursor-not-allowed" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" {...form.register('full_name')} disabled={isSubmitting} />
                {form.formState.errors.full_name && (
                  <p className="text-sm text-red-500">{form.formState.errors.full_name.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" {...form.register('company')} disabled={isSubmitting} placeholder="Your company name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select onValueChange={(value) => form.setValue('role', value)} value={form.watch('role')} disabled={isSubmitting}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="marketing-manager">Marketing Manager</SelectItem>
                    <SelectItem value="digital-marketer">Digital Marketer</SelectItem>
                    <SelectItem value="campaign-manager">Campaign Manager</SelectItem>
                    <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <LoadingSpinner className="mr-2 h-4 w-4" />} Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>Manage your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <h3 className="font-medium">Sign Out</h3>
                <p className="text-sm text-muted-foreground">Sign out of your account on this device.</p>
              </div>
              <Button variant="outline" onClick={signOut}>Sign Out</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default withAuth(ProfilePage)
