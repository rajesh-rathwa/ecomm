import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import React from 'react'

async function page() {
    const session = await getServerSession();
    if (!session) {
        redirect("/");
      }
    return (
        <div>Dashboard</div>
    )
}

export default page