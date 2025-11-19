import Link from "next/link"
import Orgulho from "../orgulho/orgulho"

export default function ComponentesProjetos(){

    return(
        <>
            <h2>Projetos</h2>
            <p>Em DIW fizemos varios projetos usando HTML,CSS e javaScript</p>
            <p>OS projetos estao disponiveis em <Link href = ""></Link> </p>
            <h2>Orgulho</h2>
            <Orgulho
            nome="loja"
            link="https://vinicius-v-c.github.io/viniciuscardoso.github.io"
            />
        </>
    )

}