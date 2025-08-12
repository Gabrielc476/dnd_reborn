import { useEffect, useState } from "react";
import { Character } from "@/types/character";

const AbilitesPanel = ({ character }: { character: Character }) => {
    const [classDetails, setClassDetails] = useState<any>(undefined);

    useEffect(() => {
       
        const fetchDetails = async () => {
            try {
                const res = await fetch(
                    `https://www.dnd5eapi.co/api/2014/classes/${character.basic_info.character_class}`
                );

                if (!res.ok) {
                    throw new Error(`Erro ao buscar dados da classe: ${res.status}`);
                }

                const data = await res.json();
                setClassDetails(data);
            } catch (error) {
                console.error("Erro no fetch da classe:", error);
            }
        };

        fetchDetails();
    }, [character.basic_info.character_class]);

    return (
        <div>
            <h2>Seção de habilidades</h2>
            {classDetails ? (
                <pre>{JSON.stringify(classDetails, null, 2)}</pre>
            ) : (
                <p>Carregando...</p>
            )}
        </div>
    );
};

export default AbilitesPanel;