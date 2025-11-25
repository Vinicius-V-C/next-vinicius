'use client'

import tecnologias from '@/data/tecnologias.json'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function CaracteristicasPage(){
    const params = useParams();
    const id = Number(params.tecnologia)
    
    return (
        <>
        <h2>{tecnologias[id].title}</h2>
        <p>{tecnologias[id].description}</p>        
        </>

    )
}