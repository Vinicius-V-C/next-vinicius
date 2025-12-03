import Contador from "@/components/componenteContadorPersonalizado/contador";

interface TecnologiaProps {
  title: string;
  description: string;
}

export default function Tecnologia({ title, description }: TecnologiaProps) {
  return (
    <div
      className="
        p-4
        m-2
        bg-blue-100
        "
    >
      <h2>{title}</h2>
      <p>{description}</p>

      <Contador title={title} />
    </div>
  );
}
