
import React from 'react'
import PaymentPage from '@/components/PaymentPage'
import { notFound } from "next/navigation"
import connectDb from '@/db/connectDb'
import User from '@/models/User'
const Username = async ({ params }) => {

  // If the username is not present in the database, show a 404 page
  const checkUser = async () => {
    await connectDb()
    let u = await User.findOne({ username: params.creators })
    if (!u) {
      return notFound()
    }
  }
  await checkUser()

 
  return (
    <>
      <PaymentPage username={params.username} creators={params.creators} />
    </>
  )
}

export default Username
 
export async function generateMetadata({ params }) {
  return {
    title: `Support ${params.creators} - BoostMeUp`,
  }
}