import tecnologias from '@/data/tecnologias.json'
import Tecnologia from '@/components/tecnologia/tecnologia'
export default function TecnologiasPage(){
    return(
        <>
            <h2>{tecnologias[0].title}</h2>
            <p>{tecnologias[0].description}</p>
            {tecnologias.map((tecnologias,index) =>(
                <Tecnologia
                key = {`tecno-${index}`}
                title={tecnologias.title}
                description ={tecnologias.description}
                />
            )
            )}
        </>
    )
}