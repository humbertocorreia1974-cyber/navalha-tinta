// jgnext:admin-data — gerado do prisma/schema.prisma. Não edite à mão: é recriado a cada geração.
export type FieldMeta = {
  name: string; label: string; kind: 'text' | 'int' | 'float' | 'decimal' | 'bool' | 'datetime' | 'json' | 'enum';
  optional: boolean; required: boolean; writable: boolean; hidden: boolean; long?: boolean; options?: string[];
  relation?: string; defaultBool?: boolean; defaultValue?: string;
};
export type ModelMeta = {
  name: string; delegate: string; label: string; idField: string; idKind: 'string' | 'int'; labelField: string;
  optionsOnly?: boolean; select: Record<string, true>; fields: FieldMeta[];
};
export const MODELS: Record<string, ModelMeta> = {
  "User": {
    "name": "User",
    "delegate": "user",
    "label": "Usuários",
    "idField": "id",
    "idKind": "string",
    "labelField": "name",
    "optionsOnly": true,
    "select": {
      "id": true,
      "name": true,
      "email": true
    },
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "kind": "text",
        "optional": false,
        "required": false,
        "writable": false,
        "hidden": true
      },
      {
        "name": "name",
        "label": "Name",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": false,
        "hidden": false
      },
      {
        "name": "email",
        "label": "Email",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": false,
        "hidden": false
      }
    ]
  },
  "Project": {
    "name": "Project",
    "delegate": "project",
    "label": "Projetos",
    "idField": "id",
    "idKind": "string",
    "labelField": "name",
    "select": {
      "id": true,
      "name": true,
      "ownerId": true,
      "createdAt": true
    },
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "kind": "text",
        "optional": false,
        "required": false,
        "writable": false,
        "hidden": true
      },
      {
        "name": "name",
        "label": "Name",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "ownerId",
        "label": "Owner",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false,
        "relation": "User"
      },
      {
        "name": "createdAt",
        "label": "Created at",
        "kind": "datetime",
        "optional": false,
        "required": false,
        "writable": false,
        "hidden": false
      }
    ]
  },
  "Barber": {
    "name": "Barber",
    "delegate": "barber",
    "label": "Barbers",
    "idField": "id",
    "idKind": "string",
    "labelField": "userId",
    "select": {
      "id": true,
      "userId": true,
      "nomeCompleto": true,
      "apelido": true,
      "emailContato": true,
      "telefoneCelular": true,
      "fotoPerfil": true,
      "especialidades": true,
      "bio": true,
      "ativo": true,
      "createdAt": true,
      "updatedAt": true
    },
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "kind": "text",
        "optional": false,
        "required": false,
        "writable": false,
        "hidden": true
      },
      {
        "name": "userId",
        "label": "User",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false,
        "relation": "User"
      },
      {
        "name": "nomeCompleto",
        "label": "Nome completo",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "apelido",
        "label": "Apelido",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false
      },
      {
        "name": "emailContato",
        "label": "Email contato",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "telefoneCelular",
        "label": "Telefone celular",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "fotoPerfil",
        "label": "Foto perfil",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false
      },
      {
        "name": "especialidades",
        "label": "Especialidades",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false
      },
      {
        "name": "bio",
        "label": "Bio",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false,
        "long": true
      },
      {
        "name": "ativo",
        "label": "Ativo",
        "kind": "bool",
        "optional": false,
        "required": false,
        "writable": true,
        "hidden": false,
        "defaultBool": true
      },
      {
        "name": "createdAt",
        "label": "Created at",
        "kind": "datetime",
        "optional": false,
        "required": false,
        "writable": false,
        "hidden": false
      },
      {
        "name": "updatedAt",
        "label": "Updated at",
        "kind": "datetime",
        "optional": false,
        "required": true,
        "writable": false,
        "hidden": false
      }
    ]
  },
  "Service": {
    "name": "Service",
    "delegate": "service",
    "label": "Serviços",
    "idField": "id",
    "idKind": "string",
    "labelField": "descricao",
    "select": {
      "id": true,
      "nomeServico": true,
      "descricao": true,
      "duracaoMinutos": true,
      "precoBase": true,
      "categoriaServico": true,
      "imagemIlustrativa": true,
      "disponivel": true,
      "createdAt": true,
      "updatedAt": true
    },
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "kind": "text",
        "optional": false,
        "required": false,
        "writable": false,
        "hidden": true
      },
      {
        "name": "nomeServico",
        "label": "Nome serviço",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "descricao",
        "label": "Descrição",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false,
        "long": true
      },
      {
        "name": "duracaoMinutos",
        "label": "Duração minutos",
        "kind": "int",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "precoBase",
        "label": "Preço base",
        "kind": "decimal",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "categoriaServico",
        "label": "Categoria serviço",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "imagemIlustrativa",
        "label": "Imagem ilustrativa",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false
      },
      {
        "name": "disponivel",
        "label": "Disponivel",
        "kind": "bool",
        "optional": false,
        "required": false,
        "writable": true,
        "hidden": false,
        "defaultBool": true
      },
      {
        "name": "createdAt",
        "label": "Created at",
        "kind": "datetime",
        "optional": false,
        "required": false,
        "writable": false,
        "hidden": false
      },
      {
        "name": "updatedAt",
        "label": "Updated at",
        "kind": "datetime",
        "optional": false,
        "required": true,
        "writable": false,
        "hidden": false
      }
    ]
  },
  "Appointment": {
    "name": "Appointment",
    "delegate": "appointment",
    "label": "Agendamentos",
    "idField": "id",
    "idKind": "string",
    "labelField": "horaInicio",
    "select": {
      "id": true,
      "dataAgendamento": true,
      "horaInicio": true,
      "horaFim": true,
      "statusAgendamento": true,
      "nomeCliente": true,
      "telefoneCliente": true,
      "observacoes": true,
      "valorTotal": true,
      "clientId": true,
      "barberId": true,
      "serviceId": true,
      "couponId": true,
      "createdAt": true,
      "updatedAt": true,
      "paymentId": true
    },
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "kind": "text",
        "optional": false,
        "required": false,
        "writable": false,
        "hidden": true
      },
      {
        "name": "dataAgendamento",
        "label": "Data agendamento",
        "kind": "datetime",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "horaInicio",
        "label": "Hora início",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "horaFim",
        "label": "Hora fim",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "statusAgendamento",
        "label": "Situação agendamento",
        "kind": "text",
        "optional": false,
        "required": false,
        "writable": true,
        "hidden": false,
        "defaultValue": "pendente"
      },
      {
        "name": "nomeCliente",
        "label": "Nome cliente",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "telefoneCliente",
        "label": "Telefone cliente",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "observacoes",
        "label": "Observações",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false,
        "long": true
      },
      {
        "name": "valorTotal",
        "label": "Valor total",
        "kind": "decimal",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "clientId",
        "label": "Client",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false,
        "relation": "User"
      },
      {
        "name": "barberId",
        "label": "Barber",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false,
        "relation": "Barber"
      },
      {
        "name": "serviceId",
        "label": "Service",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false,
        "relation": "Service"
      },
      {
        "name": "couponId",
        "label": "Coupon",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false,
        "relation": "Coupon"
      },
      {
        "name": "createdAt",
        "label": "Created at",
        "kind": "datetime",
        "optional": false,
        "required": false,
        "writable": false,
        "hidden": false
      },
      {
        "name": "updatedAt",
        "label": "Updated at",
        "kind": "datetime",
        "optional": false,
        "required": true,
        "writable": false,
        "hidden": false
      },
      {
        "name": "paymentId",
        "label": "Payment",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false,
        "relation": "Payment"
      }
    ]
  },
  "BlockedSlot": {
    "name": "BlockedSlot",
    "delegate": "blockedSlot",
    "label": "Blocked slots",
    "idField": "id",
    "idKind": "string",
    "labelField": "barberId",
    "select": {
      "id": true,
      "barberId": true,
      "data": true,
      "horaInicio": true,
      "horaFim": true,
      "motivo": true,
      "createdAt": true
    },
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "kind": "text",
        "optional": false,
        "required": false,
        "writable": false,
        "hidden": true
      },
      {
        "name": "barberId",
        "label": "Barber",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false,
        "relation": "Barber"
      },
      {
        "name": "data",
        "label": "Data",
        "kind": "datetime",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "horaInicio",
        "label": "Hora início",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "horaFim",
        "label": "Hora fim",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "motivo",
        "label": "Motivo",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false
      },
      {
        "name": "createdAt",
        "label": "Created at",
        "kind": "datetime",
        "optional": false,
        "required": false,
        "writable": false,
        "hidden": false
      }
    ]
  },
  "SubscriptionPlan": {
    "name": "SubscriptionPlan",
    "delegate": "subscriptionPlan",
    "label": "Subscription plans",
    "idField": "id",
    "idKind": "string",
    "labelField": "descricao",
    "select": {
      "id": true,
      "nomePlano": true,
      "descricao": true,
      "precoMensal": true,
      "quantidadeServicosMes": true,
      "descontoProdutos": true,
      "destaque": true,
      "ativo": true,
      "stripePriceId": true,
      "createdAt": true,
      "updatedAt": true
    },
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "kind": "text",
        "optional": false,
        "required": false,
        "writable": false,
        "hidden": true
      },
      {
        "name": "nomePlano",
        "label": "Nome plano",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "descricao",
        "label": "Descrição",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false,
        "long": true
      },
      {
        "name": "precoMensal",
        "label": "Preço mensal",
        "kind": "decimal",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "quantidadeServicosMes",
        "label": "Quantidade servicos mês",
        "kind": "int",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "descontoProdutos",
        "label": "Desconto produtos",
        "kind": "decimal",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false
      },
      {
        "name": "destaque",
        "label": "Destaque",
        "kind": "bool",
        "optional": false,
        "required": false,
        "writable": true,
        "hidden": false,
        "defaultBool": false
      },
      {
        "name": "ativo",
        "label": "Ativo",
        "kind": "bool",
        "optional": false,
        "required": false,
        "writable": true,
        "hidden": false,
        "defaultBool": true
      },
      {
        "name": "stripePriceId",
        "label": "Stripe price id",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false
      },
      {
        "name": "createdAt",
        "label": "Created at",
        "kind": "datetime",
        "optional": false,
        "required": false,
        "writable": false,
        "hidden": false
      },
      {
        "name": "updatedAt",
        "label": "Updated at",
        "kind": "datetime",
        "optional": false,
        "required": true,
        "writable": false,
        "hidden": false
      }
    ]
  },
  "Subscription": {
    "name": "Subscription",
    "delegate": "subscription",
    "label": "Subscriptions",
    "idField": "id",
    "idKind": "string",
    "labelField": "nomeAssinante",
    "select": {
      "id": true,
      "nomeAssinante": true,
      "emailAssinante": true,
      "telefoneAssinante": true,
      "dataInicio": true,
      "dataRenovacao": true,
      "statusAssinatura": true,
      "valorMensal": true,
      "stripeSubscriptionId": true,
      "stripeCustomerId": true,
      "servicosUsadosMes": true,
      "userId": true,
      "planId": true,
      "createdAt": true,
      "updatedAt": true
    },
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "kind": "text",
        "optional": false,
        "required": false,
        "writable": false,
        "hidden": true
      },
      {
        "name": "nomeAssinante",
        "label": "Nome assinante",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "emailAssinante",
        "label": "Email assinante",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "telefoneAssinante",
        "label": "Telefone assinante",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "dataInicio",
        "label": "Data início",
        "kind": "datetime",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "dataRenovacao",
        "label": "Data renovacao",
        "kind": "datetime",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "statusAssinatura",
        "label": "Situação assinatura",
        "kind": "text",
        "optional": false,
        "required": false,
        "writable": true,
        "hidden": false,
        "defaultValue": "ativa"
      },
      {
        "name": "valorMensal",
        "label": "Valor mensal",
        "kind": "decimal",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "stripeSubscriptionId",
        "label": "Stripe subscription id",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false
      },
      {
        "name": "stripeCustomerId",
        "label": "Stripe customer id",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false
      },
      {
        "name": "servicosUsadosMes",
        "label": "Servicos usados mês",
        "kind": "int",
        "optional": false,
        "required": false,
        "writable": true,
        "hidden": false,
        "defaultValue": "0"
      },
      {
        "name": "userId",
        "label": "User",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false,
        "relation": "User"
      },
      {
        "name": "planId",
        "label": "Plan",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false,
        "relation": "SubscriptionPlan"
      },
      {
        "name": "createdAt",
        "label": "Created at",
        "kind": "datetime",
        "optional": false,
        "required": false,
        "writable": false,
        "hidden": false
      },
      {
        "name": "updatedAt",
        "label": "Updated at",
        "kind": "datetime",
        "optional": false,
        "required": true,
        "writable": false,
        "hidden": false
      }
    ]
  },
  "PauseRecord": {
    "name": "PauseRecord",
    "delegate": "pauseRecord",
    "label": "Pause records",
    "idField": "id",
    "idKind": "string",
    "labelField": "subscriptionId",
    "select": {
      "id": true,
      "subscriptionId": true,
      "userId": true,
      "dataInicio": true,
      "dataFim": true,
      "motivo": true,
      "createdAt": true
    },
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "kind": "text",
        "optional": false,
        "required": false,
        "writable": false,
        "hidden": true
      },
      {
        "name": "subscriptionId",
        "label": "Subscription",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false,
        "relation": "Subscription"
      },
      {
        "name": "userId",
        "label": "User",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false,
        "relation": "User"
      },
      {
        "name": "dataInicio",
        "label": "Data início",
        "kind": "datetime",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "dataFim",
        "label": "Data fim",
        "kind": "datetime",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false
      },
      {
        "name": "motivo",
        "label": "Motivo",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false
      },
      {
        "name": "createdAt",
        "label": "Created at",
        "kind": "datetime",
        "optional": false,
        "required": false,
        "writable": false,
        "hidden": false
      }
    ]
  },
  "Category": {
    "name": "Category",
    "delegate": "category",
    "label": "Categorias",
    "idField": "id",
    "idKind": "string",
    "labelField": "descricao",
    "select": {
      "id": true,
      "nomeCategoria": true,
      "descricao": true,
      "slug": true,
      "ordemExibicao": true,
      "ativa": true,
      "createdAt": true,
      "updatedAt": true
    },
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "kind": "text",
        "optional": false,
        "required": false,
        "writable": false,
        "hidden": true
      },
      {
        "name": "nomeCategoria",
        "label": "Nome categoria",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "descricao",
        "label": "Descrição",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false,
        "long": true
      },
      {
        "name": "slug",
        "label": "Slug",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "ordemExibicao",
        "label": "Ordem exibicao",
        "kind": "int",
        "optional": false,
        "required": false,
        "writable": true,
        "hidden": false,
        "defaultValue": "0"
      },
      {
        "name": "ativa",
        "label": "Ativa",
        "kind": "bool",
        "optional": false,
        "required": false,
        "writable": true,
        "hidden": false,
        "defaultBool": true
      },
      {
        "name": "createdAt",
        "label": "Created at",
        "kind": "datetime",
        "optional": false,
        "required": false,
        "writable": false,
        "hidden": false
      },
      {
        "name": "updatedAt",
        "label": "Updated at",
        "kind": "datetime",
        "optional": false,
        "required": true,
        "writable": false,
        "hidden": false
      }
    ]
  },
  "Product": {
    "name": "Product",
    "delegate": "product",
    "label": "Produtos",
    "idField": "id",
    "idKind": "string",
    "labelField": "descricao",
    "select": {
      "id": true,
      "nomeProduto": true,
      "descricao": true,
      "precoVenda": true,
      "estoqueDisponivel": true,
      "marca": true,
      "imagemPrincipal": true,
      "ativo": true,
      "categoryId": true,
      "createdAt": true,
      "updatedAt": true
    },
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "kind": "text",
        "optional": false,
        "required": false,
        "writable": false,
        "hidden": true
      },
      {
        "name": "nomeProduto",
        "label": "Nome produto",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "descricao",
        "label": "Descrição",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false,
        "long": true
      },
      {
        "name": "precoVenda",
        "label": "Preço venda",
        "kind": "decimal",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "estoqueDisponivel",
        "label": "Estoque disponivel",
        "kind": "int",
        "optional": false,
        "required": false,
        "writable": true,
        "hidden": false,
        "defaultValue": "0"
      },
      {
        "name": "marca",
        "label": "Marca",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false
      },
      {
        "name": "imagemPrincipal",
        "label": "Imagem principal",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false
      },
      {
        "name": "ativo",
        "label": "Ativo",
        "kind": "bool",
        "optional": false,
        "required": false,
        "writable": true,
        "hidden": false,
        "defaultBool": true
      },
      {
        "name": "categoryId",
        "label": "Category",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false,
        "relation": "Category"
      },
      {
        "name": "createdAt",
        "label": "Created at",
        "kind": "datetime",
        "optional": false,
        "required": false,
        "writable": false,
        "hidden": false
      },
      {
        "name": "updatedAt",
        "label": "Updated at",
        "kind": "datetime",
        "optional": false,
        "required": true,
        "writable": false,
        "hidden": false
      }
    ]
  },
  "CartItem": {
    "name": "CartItem",
    "delegate": "cartItem",
    "label": "Cart items",
    "idField": "id",
    "idKind": "string",
    "labelField": "sessaoCarrinho",
    "select": {
      "id": true,
      "quantidade": true,
      "precoUnitario": true,
      "subtotal": true,
      "sessaoCarrinho": true,
      "observacao": true,
      "productId": true,
      "orderId": true,
      "createdAt": true
    },
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "kind": "text",
        "optional": false,
        "required": false,
        "writable": false,
        "hidden": true
      },
      {
        "name": "quantidade",
        "label": "Quantidade",
        "kind": "int",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "precoUnitario",
        "label": "Preço unitario",
        "kind": "decimal",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "subtotal",
        "label": "Subtotal",
        "kind": "decimal",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "sessaoCarrinho",
        "label": "Sessao carrinho",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "observacao",
        "label": "Observação",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false,
        "long": true
      },
      {
        "name": "productId",
        "label": "Product",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false,
        "relation": "Product"
      },
      {
        "name": "orderId",
        "label": "Order",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false,
        "relation": "Order"
      },
      {
        "name": "createdAt",
        "label": "Created at",
        "kind": "datetime",
        "optional": false,
        "required": false,
        "writable": false,
        "hidden": false
      }
    ]
  },
  "Order": {
    "name": "Order",
    "delegate": "order",
    "label": "Pedidos",
    "idField": "id",
    "idKind": "string",
    "labelField": "numeroPedido",
    "select": {
      "id": true,
      "numeroPedido": true,
      "nomeCliente": true,
      "emailCliente": true,
      "telefoneCliente": true,
      "dataPedido": true,
      "statusPedido": true,
      "valorTotal": true,
      "enderecoEntrega": true,
      "userId": true,
      "couponId": true,
      "createdAt": true,
      "updatedAt": true
    },
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "kind": "text",
        "optional": false,
        "required": false,
        "writable": false,
        "hidden": true
      },
      {
        "name": "numeroPedido",
        "label": "Numero pedido",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "nomeCliente",
        "label": "Nome cliente",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "emailCliente",
        "label": "Email cliente",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "telefoneCliente",
        "label": "Telefone cliente",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "dataPedido",
        "label": "Data pedido",
        "kind": "datetime",
        "optional": false,
        "required": false,
        "writable": true,
        "hidden": false
      },
      {
        "name": "statusPedido",
        "label": "Situação pedido",
        "kind": "text",
        "optional": false,
        "required": false,
        "writable": true,
        "hidden": false,
        "defaultValue": "pendente"
      },
      {
        "name": "valorTotal",
        "label": "Valor total",
        "kind": "decimal",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "enderecoEntrega",
        "label": "Endereço entrega",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false
      },
      {
        "name": "userId",
        "label": "User",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false,
        "relation": "User"
      },
      {
        "name": "couponId",
        "label": "Coupon",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false,
        "relation": "Coupon"
      },
      {
        "name": "createdAt",
        "label": "Created at",
        "kind": "datetime",
        "optional": false,
        "required": false,
        "writable": false,
        "hidden": false
      },
      {
        "name": "updatedAt",
        "label": "Updated at",
        "kind": "datetime",
        "optional": false,
        "required": true,
        "writable": false,
        "hidden": false
      }
    ]
  },
  "OrderItem": {
    "name": "OrderItem",
    "delegate": "orderItem",
    "label": "Itens do pedido",
    "idField": "id",
    "idKind": "string",
    "labelField": "nomeProdutoSnapshot",
    "select": {
      "id": true,
      "nomeProdutoSnapshot": true,
      "quantidade": true,
      "precoUnitario": true,
      "subtotal": true,
      "orderId": true,
      "productId": true
    },
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "kind": "text",
        "optional": false,
        "required": false,
        "writable": false,
        "hidden": true
      },
      {
        "name": "nomeProdutoSnapshot",
        "label": "Nome produto snapshot",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "quantidade",
        "label": "Quantidade",
        "kind": "int",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "precoUnitario",
        "label": "Preço unitario",
        "kind": "decimal",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "subtotal",
        "label": "Subtotal",
        "kind": "decimal",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "orderId",
        "label": "Order",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false,
        "relation": "Order"
      },
      {
        "name": "productId",
        "label": "Product",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false,
        "relation": "Product"
      }
    ]
  },
  "Payment": {
    "name": "Payment",
    "delegate": "payment",
    "label": "Pagamentos",
    "idField": "id",
    "idKind": "string",
    "labelField": "metodoPagamento",
    "select": {
      "id": true,
      "valorPago": true,
      "metodoPagamento": true,
      "statusPagamento": true,
      "dataPagamento": true,
      "codigoTransacao": true,
      "parcelas": true,
      "stripePaymentIntentId": true,
      "appointmentId": true,
      "orderId": true,
      "subscriptionId": true,
      "createdAt": true,
      "updatedAt": true
    },
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "kind": "text",
        "optional": false,
        "required": false,
        "writable": false,
        "hidden": true
      },
      {
        "name": "valorPago",
        "label": "Valor pago",
        "kind": "decimal",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "metodoPagamento",
        "label": "Metodo pagamento",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "statusPagamento",
        "label": "Situação pagamento",
        "kind": "text",
        "optional": false,
        "required": false,
        "writable": true,
        "hidden": false,
        "defaultValue": "pendente"
      },
      {
        "name": "dataPagamento",
        "label": "Data pagamento",
        "kind": "datetime",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false
      },
      {
        "name": "codigoTransacao",
        "label": "Codigo transacao",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false
      },
      {
        "name": "parcelas",
        "label": "Parcelas",
        "kind": "int",
        "optional": false,
        "required": false,
        "writable": true,
        "hidden": false,
        "defaultValue": "1"
      },
      {
        "name": "stripePaymentIntentId",
        "label": "Stripe payment intent id",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false
      },
      {
        "name": "appointmentId",
        "label": "Appointment id",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false
      },
      {
        "name": "orderId",
        "label": "Order",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false,
        "relation": "Order"
      },
      {
        "name": "subscriptionId",
        "label": "Subscription",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false,
        "relation": "Subscription"
      },
      {
        "name": "createdAt",
        "label": "Created at",
        "kind": "datetime",
        "optional": false,
        "required": false,
        "writable": false,
        "hidden": false
      },
      {
        "name": "updatedAt",
        "label": "Updated at",
        "kind": "datetime",
        "optional": false,
        "required": true,
        "writable": false,
        "hidden": false
      }
    ]
  },
  "Coupon": {
    "name": "Coupon",
    "delegate": "coupon",
    "label": "Cupons",
    "idField": "id",
    "idKind": "string",
    "labelField": "codigoCupom",
    "select": {
      "id": true,
      "codigoCupom": true,
      "tipoDesconto": true,
      "valorDesconto": true,
      "dataValidade": true,
      "quantidadeUsos": true,
      "ativo": true,
      "createdAt": true,
      "updatedAt": true
    },
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "kind": "text",
        "optional": false,
        "required": false,
        "writable": false,
        "hidden": true
      },
      {
        "name": "codigoCupom",
        "label": "Codigo cupom",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "tipoDesconto",
        "label": "Tipo desconto",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "valorDesconto",
        "label": "Valor desconto",
        "kind": "decimal",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "dataValidade",
        "label": "Data validade",
        "kind": "datetime",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "quantidadeUsos",
        "label": "Quantidade usos",
        "kind": "int",
        "optional": false,
        "required": false,
        "writable": true,
        "hidden": false,
        "defaultValue": "0"
      },
      {
        "name": "ativo",
        "label": "Ativo",
        "kind": "bool",
        "optional": false,
        "required": false,
        "writable": true,
        "hidden": false,
        "defaultBool": true
      },
      {
        "name": "createdAt",
        "label": "Created at",
        "kind": "datetime",
        "optional": false,
        "required": false,
        "writable": false,
        "hidden": false
      },
      {
        "name": "updatedAt",
        "label": "Updated at",
        "kind": "datetime",
        "optional": false,
        "required": true,
        "writable": false,
        "hidden": false
      }
    ]
  },
  "Notification": {
    "name": "Notification",
    "delegate": "notification",
    "label": "Notificações",
    "idField": "id",
    "idKind": "string",
    "labelField": "titulo",
    "select": {
      "id": true,
      "titulo": true,
      "mensagem": true,
      "tipoNotificacao": true,
      "canalEnvio": true,
      "dataEnvio": true,
      "lida": true,
      "destinatarioEmail": true,
      "userId": true,
      "appointmentId": true,
      "orderId": true,
      "subscriptionId": true,
      "createdAt": true
    },
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "kind": "text",
        "optional": false,
        "required": false,
        "writable": false,
        "hidden": true
      },
      {
        "name": "titulo",
        "label": "Título",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "mensagem",
        "label": "Mensagem",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false,
        "long": true
      },
      {
        "name": "tipoNotificacao",
        "label": "Tipo notificacao",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "canalEnvio",
        "label": "Canal envio",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "dataEnvio",
        "label": "Data envio",
        "kind": "datetime",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false
      },
      {
        "name": "lida",
        "label": "Lida",
        "kind": "bool",
        "optional": false,
        "required": false,
        "writable": true,
        "hidden": false,
        "defaultBool": false
      },
      {
        "name": "destinatarioEmail",
        "label": "Destinatario email",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false
      },
      {
        "name": "userId",
        "label": "User",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false,
        "relation": "User"
      },
      {
        "name": "appointmentId",
        "label": "Appointment",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false,
        "relation": "Appointment"
      },
      {
        "name": "orderId",
        "label": "Order",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false,
        "relation": "Order"
      },
      {
        "name": "subscriptionId",
        "label": "Subscription",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false,
        "relation": "Subscription"
      },
      {
        "name": "createdAt",
        "label": "Created at",
        "kind": "datetime",
        "optional": false,
        "required": false,
        "writable": false,
        "hidden": false
      }
    ]
  },
  "GalleryItem": {
    "name": "GalleryItem",
    "delegate": "galleryItem",
    "label": "Gallery items",
    "idField": "id",
    "idKind": "string",
    "labelField": "titulo",
    "select": {
      "id": true,
      "titulo": true,
      "descricao": true,
      "imagemTrabalho": true,
      "estiloCorte": true,
      "dataPublicacao": true,
      "destaque": true,
      "ordemExibicao": true,
      "barberId": true,
      "userId": true,
      "createdAt": true,
      "updatedAt": true
    },
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "kind": "text",
        "optional": false,
        "required": false,
        "writable": false,
        "hidden": true
      },
      {
        "name": "titulo",
        "label": "Título",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "descricao",
        "label": "Descrição",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false,
        "long": true
      },
      {
        "name": "imagemTrabalho",
        "label": "Imagem trabalho",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "estiloCorte",
        "label": "Estilo corte",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false
      },
      {
        "name": "dataPublicacao",
        "label": "Data publicacao",
        "kind": "datetime",
        "optional": false,
        "required": false,
        "writable": true,
        "hidden": false
      },
      {
        "name": "destaque",
        "label": "Destaque",
        "kind": "bool",
        "optional": false,
        "required": false,
        "writable": true,
        "hidden": false,
        "defaultBool": false
      },
      {
        "name": "ordemExibicao",
        "label": "Ordem exibicao",
        "kind": "int",
        "optional": false,
        "required": false,
        "writable": true,
        "hidden": false,
        "defaultValue": "0"
      },
      {
        "name": "barberId",
        "label": "Barber",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false,
        "relation": "Barber"
      },
      {
        "name": "userId",
        "label": "User",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false,
        "relation": "User"
      },
      {
        "name": "createdAt",
        "label": "Created at",
        "kind": "datetime",
        "optional": false,
        "required": false,
        "writable": false,
        "hidden": false
      },
      {
        "name": "updatedAt",
        "label": "Updated at",
        "kind": "datetime",
        "optional": false,
        "required": true,
        "writable": false,
        "hidden": false
      }
    ]
  },
  "Address": {
    "name": "Address",
    "delegate": "address",
    "label": "Address",
    "idField": "id",
    "idKind": "string",
    "labelField": "userId",
    "select": {
      "id": true,
      "userId": true,
      "cep": true,
      "logradouro": true,
      "numero": true,
      "complemento": true,
      "bairro": true,
      "cidade": true,
      "estado": true,
      "principal": true,
      "createdAt": true,
      "updatedAt": true
    },
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "kind": "text",
        "optional": false,
        "required": false,
        "writable": false,
        "hidden": true
      },
      {
        "name": "userId",
        "label": "User",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false,
        "relation": "User"
      },
      {
        "name": "cep",
        "label": "Cep",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "logradouro",
        "label": "Logradouro",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "numero",
        "label": "Numero",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "complemento",
        "label": "Complemento",
        "kind": "text",
        "optional": true,
        "required": false,
        "writable": true,
        "hidden": false
      },
      {
        "name": "bairro",
        "label": "Bairro",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "cidade",
        "label": "Cidade",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "estado",
        "label": "Estado",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "principal",
        "label": "Principal",
        "kind": "bool",
        "optional": false,
        "required": false,
        "writable": true,
        "hidden": false,
        "defaultBool": false
      },
      {
        "name": "createdAt",
        "label": "Created at",
        "kind": "datetime",
        "optional": false,
        "required": false,
        "writable": false,
        "hidden": false
      },
      {
        "name": "updatedAt",
        "label": "Updated at",
        "kind": "datetime",
        "optional": false,
        "required": true,
        "writable": false,
        "hidden": false
      }
    ]
  },
  "Lead": {
    "name": "Lead",
    "delegate": "lead",
    "label": "Contatos",
    "idField": "id",
    "idKind": "string",
    "labelField": "name",
    "select": {
      "id": true,
      "name": true,
      "email": true,
      "message": true,
      "createdAt": true
    },
    "fields": [
      {
        "name": "id",
        "label": "ID",
        "kind": "text",
        "optional": false,
        "required": false,
        "writable": false,
        "hidden": true
      },
      {
        "name": "name",
        "label": "Name",
        "kind": "text",
        "optional": false,
        "required": false,
        "writable": true,
        "hidden": false,
        "defaultValue": ""
      },
      {
        "name": "email",
        "label": "Email",
        "kind": "text",
        "optional": false,
        "required": true,
        "writable": true,
        "hidden": false
      },
      {
        "name": "message",
        "label": "Message",
        "kind": "text",
        "optional": false,
        "required": false,
        "writable": true,
        "hidden": false,
        "defaultValue": ""
      },
      {
        "name": "createdAt",
        "label": "Created at",
        "kind": "datetime",
        "optional": false,
        "required": false,
        "writable": false,
        "hidden": false
      }
    ]
  }
};
