export default function MagiaDoJSX() {7
    const magia = <strong>HTML dentro de JavaScript!</strong>
    const tecnologias = "React e Next.js"

    return (
        <div className='bg-blue-300 p-3 m-3 rounded-x1'>
            <p>Este é o meu compoente MagiaDoJSX.</p>
            <p>Um componete é uma funcao que retorna JSX - {magia}.</p>
            <p>Os componentes sao usados em {tecnologias}</p>


        </div>
    )
}