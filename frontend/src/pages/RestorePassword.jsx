import React from 'react'
import { useParams } from 'react-router-dom';

export default function RestorePassword() {
    const { restore } = useParams();
    console.log(restore);

    
  return (
    <div>RestorePassword</div>
  )
}
