import Image from 'next/image'
import Link from 'next/link'
import tecnologias from '@/data/tecnologias.json'

export default function Sobre() {
  return (
    <div className="card-sobre">
      <h1>Sobre React e Next</h1>

      <div className="logo-linha">
        <Image
          src="/tecnologias/transferir.svg"
          alt="Logotipo do React"
          width={40}
          height={40}
        />
        <span>Logotipo do React</span>
      </div>

      <h2>Tecnologias deste projeto</h2>

      <div className="lista-tecnologias">
        {tecnologias.map((tec, index) => (
          <Link
            key={`tec-${index}`}
            href={`/tecnologias/${index}`}
            className="card-tecnologia"
          >
            <div className="card-tecnologia-header">
              <Image
                src={`/tecnologias/${tec.image}`}
                alt={tec.title}
                width={32}
                height={32}
              />
              <div>
                <h3>{tec.title}</h3>
                <p className="rating">
                  {'⭐'.repeat(tec.rating)}{' '}
                  <span className="rating-num">{tec.rating}/5</span>
                </p>
              </div>
            </div>
            <p className="descricao-tec">{tec.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
