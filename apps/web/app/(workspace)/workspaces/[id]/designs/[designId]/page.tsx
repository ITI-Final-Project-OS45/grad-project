"use client";

import { useDesign, useDesignById } from '@/hooks/use-designs';
import { DesignResponse } from '@repo/types';
import { useParams } from 'next/navigation';
import React from 'react';

export default function DesignPage() {  
  
  const { designId }: {designId: string} = useParams()
  const {data:design, error, isLoading} = useDesignById(designId)

  console.log('ialoading: ', isLoading);
  console.log('error: ', error);
  console.log('data: ', design);
  

  if (isLoading) return <div>loading...</div>
  if (error) return <div>Resource Not Found</div>

  return (
    <div className="m-5">
      <div>{design?._id}</div>
      <div>{design?.description}</div>
      {design && design.type ==='figma' && 
        <iframe style={{ border: "1px solid rgba(0, 0, 0, 0.1)" }} width="800" height="450" src={design.assetUrl} allowFullScreen></iframe>
      }
      
      {design && design.type ==='mockup' && 
        <img src={design.assetUrl} alt="" className="w-"/>
      }

    </div>
  )
}
