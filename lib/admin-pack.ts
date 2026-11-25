// jgnext:admin-pack — gerado do schema. Não edite à mão.
export type AgendaCfg = { model: string; dateField: string; timeField: string | null; clientNameField: string | null; statusField: string | null; statusOptions: string[]; relations: { field: string; model: string; label: string; person?: boolean }[] };
export const PACK: { agenda: AgendaCfg | null } = {
  "agenda": {
    "model": "Appointment",
    "dateField": "dataAgendamento",
    "timeField": "horaInicio",
    "clientNameField": "nomeCliente",
    "statusField": "statusAgendamento",
    "statusOptions": [
      "pendente",
      "confirmado",
      "concluido",
      "cancelado",
      "no_show"
    ],
    "relations": [
      {
        "field": "clientId",
        "model": "User",
        "label": "Client",
        "person": false
      },
      {
        "field": "barberId",
        "model": "Barber",
        "label": "Barber",
        "person": true
      },
      {
        "field": "serviceId",
        "model": "Service",
        "label": "Service",
        "person": false
      }
    ]
  }
};
