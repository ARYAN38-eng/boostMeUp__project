import React from 'react'
import CreatorPage from '@/components/CreatorPage'
import { notFound } from "next/navigation"
import connectDb from '@/db/connectDb'
import User from '@/models/User'

const Username = async ({ params }) => {
  const { username } = await params  

  await connectDb()
  const u = await User.findOne({ username })
  
  if (!u) {
    notFound()  
  }


  return (
    <>
      <CreatorPage username={username} />
    </>
  )
}

export default Username

export async function generateMetadata({ params }) {
  return {
    title: `Support ${params.username} - BoostMeUp`,
  }
}




