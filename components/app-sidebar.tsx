'use client'

import * as React from 'react'
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconKey,
  IconListDetails,
  IconMailShare,
  IconSettings,
  IconTimeDuration10,
  IconUsers
} from '@tabler/icons-react'
import { NavDocuments } from '@/components/nav-documents'
import { NavMain } from '@/components/nav-main'
import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: IconDashboard
    },
    {
      title: 'Credentials Management',
      url: '/dashboard/credentials',
      icon: IconListDetails
    },
    {
      title: 'Expiry Loockup',
      url: '/dashboard/expiry',
      icon: IconTimeDuration10
    },
    {
      title: 'Sales',
      url: '/dashboard/sales',
      icon: IconChartBar
    },
    {
      title: 'Settings',
      url: '/dashboard/settings',
      icon: IconSettings
    }
  ],
  navClouds: [
    {
      title: 'Capture',
      icon: IconCamera,
      isActive: true,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#'
        },
        {
          title: 'Archived',
          url: '#'
        }
      ]
    },
    {
      title: 'Proposal',
      icon: IconFileDescription,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#'
        },
        {
          title: 'Archived',
          url: '#'
        }
      ]
    },
    {
      title: 'Prompts',
      icon: IconFileAi,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#'
        },
        {
          title: 'Archived',
          url: '#'
        }
      ]
    }
  ],
  navSecondary: [
    // {
    //   title: 'Settings',
    //   url: '/dashboard/settings',
    //   icon: IconSettings
    // }
  ],
  documents: [
    {
      name: 'Sync',
      url: '/dashboard/sync',
      icon: IconMailShare
    },
    {
      name: 'Users',
      url: '/dashboard/users',
      icon: IconUsers
    },
     {
      name: 'Packages',
      url: '/dashboard/packages',
      icon: IconUsers
    },
    {
      name: 'Resellers',
      url: '/dashboard/resellers',
      icon: IconFileWord
    },

    {
      name: 'Credentials',
      url: '/dashboard/credentials',
      icon: IconKey
    }
  ]
}

export function AppSidebar ({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible='offcanvas' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className='data-[slot=sidebar-menu-button]:!p-1.5'
            >
              <a href='#'>
                <span className='text-base font-semibold'>
                  Active Solutions
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className='mt-none' />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}