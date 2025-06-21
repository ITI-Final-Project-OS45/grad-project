"use client";

import { useDesigns } from '@/hooks/use-designs'
import React from 'react'

export default function designsPage() {

    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    const workspacesId = path.split('/')[2] || ''
    console.log(workspacesId);
    
    const { data: designs , error, isLoading } = useDesigns(workspacesId);
    console.log('---------------------------------------------------------------------------------------', designs);
    
    
    return (
    <div>  {designs && designs[1]?.description} page</div>
    )
}
