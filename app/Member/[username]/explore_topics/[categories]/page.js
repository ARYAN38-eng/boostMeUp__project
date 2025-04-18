import React from 'react'
import ExploreTopicPage from "@/components/explore_topics"
const  ExplorePage = async ({ params }) => {


  return (
    <>
      <ExploreTopicPage category={params.categories} />
    </>
  )
}

export default ExplorePage
 
export async function generateMetadata({ params }) {
  return {
    title: `Support ${params.categories} - BoostMeUp`,
  }
}