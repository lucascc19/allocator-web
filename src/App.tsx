import axios from "axios";
import React, { useEffect, useState } from "react";
import "./index.css";

interface Demand {
  id: number;
  name: string;
  hours: number;
  order: number;
}

interface Developer {
  id: number;
  name: string;
  hoursAvailable: number;
}

interface Allocation {
  developer: Developer;
  allocatedDemands: Demand[];
  remainingHours: number;
}

interface AllocationResponse {
  result: Allocation[];
  csvPath: string;
}

export const App: React.FC = () => {
  const [, setDemands] = useState<Demand[]>([]);
  const [, setDevelopers] = useState<Developer[]>([]);
  const [allocation, setAllocation] = useState<Allocation[]>([]);
  const [csvPath, setCsvPath] = useState<string | null>(null);
  const [newDemand, setNewDemand] = useState({
    name: "",
    hours: "",
    order: "",
  });
  const [newDeveloper, setNewDeveloper] = useState({
    name: "",
    hoursAvailable: "",
  });

  useEffect(() => {
    fetchDemands();
    fetchDevelopers();
  }, []);

  const fetchDemands = async () => {
    const response = await axios.get<Demand[]>("http://localhost:3000/demands");
    setDemands(response.data);
  };

  const fetchDevelopers = async () => {
    const response = await axios.get<Developer[]>(
      "http://localhost:3000/developers"
    );
    setDevelopers(response.data);
  };

  const handleAllocation = async () => {
    const response = await axios.post<AllocationResponse>(
      "http://localhost:3000/allocate"
    );
    setAllocation(response.data.result);
    setCsvPath(response.data.csvPath);
  };

  const handleReorderAllocation = async () => {
    const response = await axios.post<AllocationResponse>(
      "http://localhost:3000/reorder-allocate"
    );
    setAllocation(response.data.result);
    setCsvPath(response.data.csvPath);
  };

  const handleAddDemand = async () => {
    await axios.post("http://localhost:3000/demands", newDemand);
    fetchDemands();
    setNewDemand({ name: "", hours: "", order: "" });
  };

  const handleAddDeveloper = async () => {
    await axios.post("http://localhost:3000/developers", newDeveloper);
    fetchDevelopers();
    setNewDeveloper({ name: "", hoursAvailable: "" });
  };

  const handleResetAllocations = async () => {
    await axios.delete("http://localhost:3000/reset");
    setDemands([]);
    setDevelopers([]);
    setAllocation([]);
  };

  const downloadCsv = () => {
    if (csvPath) {
      const link = document.createElement("a");
      link.href = `http://localhost:3000${csvPath}`;
      link.download = "allocation_result.csv";
      link.click();
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h1 style={{ margin: 0 }}>Alocação de Horas</h1>
      <div>
        <h2>Adicionar Nova Demanda</h2>
        <input
          type="text"
          placeholder="Nome da Demanda"
          value={newDemand.name}
          onChange={(e) => setNewDemand({ ...newDemand, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Horas Necessárias"
          value={newDemand.hours}
          onChange={(e) =>
            setNewDemand({ ...newDemand, hours: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Prioridade (Order)"
          value={newDemand.order}
          onChange={(e) =>
            setNewDemand({ ...newDemand, order: e.target.value })
          }
        />
        <button onClick={handleAddDemand}>Adicionar Demanda</button>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <h2>Adicionar Novo Desenvolvedor</h2>
        <input
          type="text"
          placeholder="Nome do Desenvolvedor"
          value={newDeveloper.name}
          onChange={(e) =>
            setNewDeveloper({ ...newDeveloper, name: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Horas Disponíveis"
          value={newDeveloper.hoursAvailable}
          onChange={(e) =>
            setNewDeveloper({ ...newDeveloper, hoursAvailable: e.target.value })
          }
        />
        <button onClick={handleAddDeveloper}>Adicionar Desenvolvedor</button>
      </div>

      <div
        style={{
          display: "flex",
          gap: "0.75rem",
        }}
      >
        <button onClick={handleAllocation}>Realizar Alocação</button>
        <button onClick={downloadCsv} disabled={!allocation.length}>
          Baixar arquivo CSV
        </button>
        <button onClick={handleResetAllocations}>Resetar Alocações</button>
        <button onClick={handleReorderAllocation}>Reordenar Alocações</button>
      </div>

      <div>
        <h2>Alocação Resultado</h2>
        {allocation.map((alloc, index) => (
          <div key={index}>
            <h3>{alloc.developer.name}</h3>
            <ul>
              {alloc.allocatedDemands.map((demand) => (
                <li key={demand.id}>
                  {demand.name} - {demand.hours} horas (Prioridade:{" "}
                  {demand.order})
                </li>
              ))}
            </ul>
            <p>Horas Restantes: {alloc.remainingHours}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
