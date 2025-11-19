import tecnologias from '@/data/tecnologias.json';
import Tecnologia from '@/components/tecnologia/tecnologia'

export default function TecnologiasPage() {
    return(
        <>
            {tecnologias.map((tecnologia, index) => (
                <Tecnologia
                    key={`tecno-${index}`}
                    title={tecnologia.title}
                    description={tecnologia.description}
                />
                )
            )}
        </>
    )
}