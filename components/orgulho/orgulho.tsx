import Link from "next/link"
interface OrgulhoProps{
    nome: string
    link: string
}
export default function({nome, link}: OrgulhoProps) {
    return (
        <>

        <p> 
            O meu orgulho é {nome} que fiz nesse link {link}
        </p>

        <div>
            <p>https://vinicius-v-c.github.io/viniciuscardoso.github.io
            </p>
        </div>
        </>
    )
}