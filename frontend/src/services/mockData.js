// Mock data for demo mode - all data is fictional
export const mockData = {
  "login": {
    "success": true,
    "user": {
      "id": 1,
      "email": "demo@demo-client.demo",
      "role": "Admin",
      "external_client_id": null,
      "logo_url": null
    }
  },
  "users_list": [
    {
      "id": 2,
      "email": "cliente@demo-client.demo",
      "is_active": 1,
      "last_login": null,
      "role": "Client",
      "external_client_id": "DEMO-CLIENT",
      "logo_url": "https://static.vecteezy.com/system/resources/thumbnails/022/705/701/small/customer-care-icon-management-support-and-help-client-illustration-symbol-patient-assistance-sign-or-logo-vector.jpg"
    },
    {
      "id": 1,
      "email": "demo@demo-client.demo",
      "is_active": 1,
      "last_login": null,
      "role": "Admin",
      "external_client_id": null,
      "logo_url": null
    }
  ],
  "settings": {
    "notion_integration_token": "ntn_demo_XXXXXXXXXXXXXXXXXXXX",
    "notion_invoices_database_id": "demo_invoices_db_id",
    "notion_offers_database_id": "demo_offers_db_id",
    "notion_projects_database_id": "demo_projects_db_id",
    "notion_tasks_database_id": "demo_tasks_db_id"
  },
  "me": {
    "id": 1,
    "email": "demo@demo-client.demo",
    "role": "Admin",
    "external_client_id": null,
    "logo_url": null
  },
  "projects": {
    "data": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-000100000000",
        "last_edited_time": "2026-03-20T09:00:00.000Z",
        "identification": {
          "name": "PR0101 - DEMO-CLIENT - Instalación Solar Residencial Avda. del Sol 23",
          "project_relation": [],
          "offer_relation": []
        },
        "status": {
          "main": {
            "name": "En curso",
            "color": "yellow"
          },
          "phase": {
            "name": "Proyecto",
            "color": "blue"
          },
          "progress": 60
        },
        "client": {
          "details": {
            "name": "DEMO-CLIENT",
            "color": "purple"
          }
        },
        "financials": {
          "totalOffered": 4500,
          "totalBilled": 1800,
          "totalPending": 2700,
          "billingPercentage": 40
        },
        "assets": {
          "projectSheet": {
            "name": "PR0101_HOJA_PROYECTO.pdf",
            "url": "https://demo-files.demo-client.demo/docs/PR0101_HOJA_PROYECTO.pdf"
          },
          "offerFile": {
            "name": "OF-2026-001.pdf",
            "url": "https://demo-files.demo-client.demo/offers/OF-2026-001.pdf"
          },
          "offerCode": "OF-2026-001",
          "offerLink": null
        },
        "metadata": [
          {
            "label": "Margen (€)",
            "value": 890.5,
            "type": "formula"
          },
          {
            "label": "Coste interno (€)",
            "value": 909.5,
            "type": "formula"
          }
        ],
        "has_unread_interactions": true
      },
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-000200000000",
        "last_edited_time": "2026-03-19T10:00:00.000Z",
        "identification": {
          "name": "PR0102 - DEMO-CLIENT - Climatización Nave Industrial Pol. Norte",
          "project_relation": [],
          "offer_relation": []
        },
        "status": {
          "main": {
            "name": "En curso",
            "color": "yellow"
          },
          "phase": {
            "name": "Obra",
            "color": "orange"
          },
          "progress": 100
        },
        "client": {
          "details": {
            "name": "DEMO-CLIENT",
            "color": "purple"
          }
        },
        "financials": {
          "totalOffered": 12300,
          "totalBilled": 8610,
          "totalPending": 3690,
          "billingPercentage": 70
        },
        "assets": {
          "projectSheet": {
            "name": "PR0102_HOJA_PROYECTO.pdf",
            "url": "https://demo-files.demo-client.demo/docs/PR0102_HOJA_PROYECTO.pdf"
          },
          "offerFile": null,
          "offerCode": "OF-2026-002",
          "offerLink": null
        },
        "metadata": [
          {
            "label": "Margen (€)",
            "value": 3200,
            "type": "formula"
          },
          {
            "label": "Coste interno (€)",
            "value": 5410,
            "type": "formula"
          }
        ],
        "has_unread_interactions": true
      },
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-000300000000",
        "last_edited_time": "2026-03-18T11:00:00.000Z",
        "identification": {
          "name": "PR0103 - DEMO-CLIENT - Auditoría Energética Edificio Neptuno",
          "project_relation": [],
          "offer_relation": []
        },
        "status": {
          "main": {
            "name": "En curso",
            "color": "yellow"
          },
          "phase": {
            "name": "Legalizacion",
            "color": "brown"
          },
          "progress": 25
        },
        "client": {
          "details": {
            "name": "DEMO-CLIENT",
            "color": "purple"
          }
        },
        "financials": {
          "totalOffered": 2100,
          "totalBilled": 840,
          "totalPending": 1260,
          "billingPercentage": 40
        },
        "assets": {
          "projectSheet": {
            "name": "PR0103_HOJA_PROYECTO.pdf",
            "url": "https://demo-files.demo-client.demo/docs/PR0103_HOJA_PROYECTO.pdf"
          },
          "offerFile": null,
          "offerCode": "OF-2026-003",
          "offerLink": null
        },
        "metadata": [
          {
            "label": "Margen (€)",
            "value": 340,
            "type": "formula"
          },
          {
            "label": "Coste interno (€)",
            "value": 500,
            "type": "formula"
          }
        ],
        "has_unread_interactions": false
      },
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-000400000000",
        "last_edited_time": "2026-03-17T12:00:00.000Z",
        "identification": {
          "name": "PR0104 - DEMO-CLIENT - Reforma Eléctrica Local Comercial C/ Luna 8",
          "project_relation": [],
          "offer_relation": []
        },
        "status": {
          "main": {
            "name": "En curso",
            "color": "yellow"
          },
          "phase": {
            "name": "Obra",
            "color": "orange"
          },
          "progress": 80
        },
        "client": {
          "details": {
            "name": "DEMO-CLIENT",
            "color": "purple"
          }
        },
        "financials": {
          "totalOffered": 3750,
          "totalBilled": 2250,
          "totalPending": 1500,
          "billingPercentage": 60
        },
        "assets": {
          "projectSheet": {
            "name": "PR0104_HOJA_PROYECTO.pdf",
            "url": "https://demo-files.demo-client.demo/docs/PR0104_HOJA_PROYECTO.pdf"
          },
          "offerFile": {
            "name": "OF-2026-004.pdf",
            "url": "https://demo-files.demo-client.demo/offers/OF-2026-004.pdf"
          },
          "offerCode": "OF-2026-004",
          "offerLink": null
        },
        "metadata": [
          {
            "label": "Margen (€)",
            "value": 1100,
            "type": "formula"
          },
          {
            "label": "Coste interno (€)",
            "value": 1150,
            "type": "formula"
          }
        ],
        "has_unread_interactions": false
      },
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-000500000000",
        "last_edited_time": "2026-03-16T13:00:00.000Z",
        "identification": {
          "name": "PR0105 - DEMO-CLIENT - Legalización BT Restaurante El Faro",
          "project_relation": [],
          "offer_relation": []
        },
        "status": {
          "main": {
            "name": "En curso",
            "color": "yellow"
          },
          "phase": {
            "name": "Legalizacion",
            "color": "brown"
          },
          "progress": 50
        },
        "client": {
          "details": {
            "name": "DEMO-CLIENT",
            "color": "purple"
          }
        },
        "financials": {
          "totalOffered": 1800,
          "totalBilled": 720,
          "totalPending": 1080,
          "billingPercentage": 40
        },
        "assets": {
          "projectSheet": {
            "name": "PR0105_HOJA_PROYECTO.pdf",
            "url": "https://demo-files.demo-client.demo/docs/PR0105_HOJA_PROYECTO.pdf"
          },
          "offerFile": null,
          "offerCode": "OF-2026-005",
          "offerLink": null
        },
        "metadata": [
          {
            "label": "Margen (€)",
            "value": 280,
            "type": "formula"
          },
          {
            "label": "Coste interno (€)",
            "value": 440,
            "type": "formula"
          }
        ],
        "has_unread_interactions": true
      },
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-000600000000",
        "last_edited_time": "2026-03-15T14:00:00.000Z",
        "identification": {
          "name": "PR0106 - DEMO-CLIENT - Proyecto Gas Vivienda Unifamiliar C/ Estrella 3",
          "project_relation": [],
          "offer_relation": []
        },
        "status": {
          "main": {
            "name": "En curso",
            "color": "yellow"
          },
          "phase": {
            "name": "Proyecto",
            "color": "blue"
          },
          "progress": 10
        },
        "client": {
          "details": {
            "name": "DEMO-CLIENT",
            "color": "purple"
          }
        },
        "financials": {
          "totalOffered": 950,
          "totalBilled": 380,
          "totalPending": 570,
          "billingPercentage": 40
        },
        "assets": {
          "projectSheet": {
            "name": "PR0106_HOJA_PROYECTO.pdf",
            "url": "https://demo-files.demo-client.demo/docs/PR0106_HOJA_PROYECTO.pdf"
          },
          "offerFile": null,
          "offerCode": "OF-2026-006",
          "offerLink": null
        },
        "metadata": [
          {
            "label": "Margen (€)",
            "value": 150,
            "type": "formula"
          },
          {
            "label": "Coste interno (€)",
            "value": 230,
            "type": "formula"
          }
        ],
        "has_unread_interactions": false
      },
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-000700000000",
        "last_edited_time": "2026-03-14T15:00:00.000Z",
        "identification": {
          "name": "PR0107 - DEMO-CLIENT - Instalación Fotovoltaica Autoconsumo Almacén Rayo",
          "project_relation": [],
          "offer_relation": []
        },
        "status": {
          "main": {
            "name": "En curso",
            "color": "yellow"
          },
          "phase": {
            "name": "Obra",
            "color": "orange"
          },
          "progress": 45
        },
        "client": {
          "details": {
            "name": "DEMO-CLIENT",
            "color": "purple"
          }
        },
        "financials": {
          "totalOffered": 8200,
          "totalBilled": 4100,
          "totalPending": 4100,
          "billingPercentage": 50
        },
        "assets": {
          "projectSheet": {
            "name": "PR0107_HOJA_PROYECTO.pdf",
            "url": "https://demo-files.demo-client.demo/docs/PR0107_HOJA_PROYECTO.pdf"
          },
          "offerFile": {
            "name": "OF-2026-007.pdf",
            "url": "https://demo-files.demo-client.demo/offers/OF-2026-007.pdf"
          },
          "offerCode": "OF-2026-007",
          "offerLink": null
        },
        "metadata": [
          {
            "label": "Margen (€)",
            "value": 2400,
            "type": "formula"
          },
          {
            "label": "Coste interno (€)",
            "value": 1700,
            "type": "formula"
          }
        ],
        "has_unread_interactions": true
      },
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-000800000000",
        "last_edited_time": "2026-03-13T16:00:00.000Z",
        "identification": {
          "name": "PR0108 - DEMO-CLIENT - Certificado Eficiencia Energética Bloque Vía Celeste",
          "project_relation": [],
          "offer_relation": []
        },
        "status": {
          "main": {
            "name": "En curso",
            "color": "yellow"
          },
          "phase": {
            "name": "Legalizacion",
            "color": "brown"
          },
          "progress": 90
        },
        "client": {
          "details": {
            "name": "DEMO-CLIENT",
            "color": "purple"
          }
        },
        "financials": {
          "totalOffered": 650,
          "totalBilled": 520,
          "totalPending": 130,
          "billingPercentage": 80
        },
        "assets": {
          "projectSheet": {
            "name": "PR0108_HOJA_PROYECTO.pdf",
            "url": "https://demo-files.demo-client.demo/docs/PR0108_HOJA_PROYECTO.pdf"
          },
          "offerFile": null,
          "offerCode": "OF-2026-008",
          "offerLink": null
        },
        "metadata": [
          {
            "label": "Margen (€)",
            "value": 210,
            "type": "formula"
          },
          {
            "label": "Coste interno (€)",
            "value": 310,
            "type": "formula"
          }
        ],
        "has_unread_interactions": false
      }
    ]
  },
  "client_info": {
    "id": "DEMO-CLIENT",
    "logo_url": "https://static.vecteezy.com/system/resources/thumbnails/022/705/701/small/customer-care-icon-management-support-and-help-client-illustration-symbol-patient-assistance-sign-or-logo-vector.jpg"
  },
  "unread": {
    "count": 12,
    "has_unread": true,
    "items": [
      {
        "id": "demo-unread-1:2026-03-14:0",
        "parent_id": "a1b2c3d4-e5f6-7890-abcd-000100000000",
        "project_name": "PR0101 - DEMO-CLIENT - Instalación Solar Residencial Avda. del Sol 23",
        "identification": {
          "name": "El instalador confirma que la estructura de soporte para los paneles ya está anclada. Pendiente la c"
        },
        "last_edited_time": "2026-03-14",
        "text": "El instalador confirma que la estructura de soporte para los paneles ya está anclada. Pendiente la conexión del inversor.",
        "is_unread": true,
        "type": "interacción"
      },
      {
        "id": "demo-unread-2:2026-03-12:457",
        "parent_id": "a1b2c3d4-e5f6-7890-abcd-000100000000",
        "project_name": "PR0101 - DEMO-CLIENT - Instalación Solar Residencial Avda. del Sol 23",
        "identification": {
          "name": "Revisión del circuito de protecciones completada. Se detectó un diferencial con calibre inadecuado q"
        },
        "last_edited_time": "2026-03-12",
        "text": "Revisión del circuito de protecciones completada. Se detectó un diferencial con calibre inadecuado que será sustituido mañana.",
        "is_unread": true,
        "type": "interacción"
      },
      {
        "id": "demo-unread-3:2026-03-09:8ae",
        "parent_id": "a1b2c3d4-e5f6-7890-abcd-000100000000",
        "project_name": "PR0101 - DEMO-CLIENT - Instalación Solar Residencial Avda. del Sol 23",
        "identification": {
          "name": "Reunión con el técnico de la distribuidora para coordinar el punto de conexión. Confirma disponibili"
        },
        "last_edited_time": "2026-03-09",
        "text": "Reunión con el técnico de la distribuidora para coordinar el punto de conexión. Confirma disponibilidad para la semana que viene.",
        "is_unread": true,
        "type": "interacción"
      },
      {
        "id": "demo-unread-4:2026-03-04:d05",
        "parent_id": "a1b2c3d4-e5f6-7890-abcd-000100000000",
        "project_name": "PR0101 - DEMO-CLIENT - Instalación Solar Residencial Avda. del Sol 23",
        "identification": {
          "name": "Se envía documentación de proyecto al organismo de control para la solicitud de inspección inicial."
        },
        "last_edited_time": "2026-03-04",
        "text": "Se envía documentación de proyecto al organismo de control para la solicitud de inspección inicial.",
        "is_unread": true,
        "type": "interacción"
      },
      {
        "id": "demo-unread-5:2026-03-03:115c",
        "parent_id": "a1b2c3d4-e5f6-7890-abcd-000100000000",
        "project_name": "PR0101 - DEMO-CLIENT - Instalación Solar Residencial Avda. del Sol 23",
        "identification": {
          "name": "Inspección no favorable: 5 deficiencias menores detectadas. Se procede a la corrección inmediata."
        },
        "last_edited_time": "2026-03-03",
        "text": "Inspección no favorable: 5 deficiencias menores detectadas. Se procede a la corrección inmediata.",
        "is_unread": true,
        "type": "interacción"
      },
      {
        "id": "demo-unread-6:2026-02-26:15b3",
        "parent_id": "a1b2c3d4-e5f6-7890-abcd-000100000000",
        "project_name": "PR0101 - DEMO-CLIENT - Instalación Solar Residencial Avda. del Sol 23",
        "identification": {
          "name": "Se programa inspección OCA para el 3 de marzo a las 10:00. Inspector asignado: Sr. García."
        },
        "last_edited_time": "2026-02-26",
        "text": "Se programa inspección OCA para el 3 de marzo a las 10:00. Inspector asignado: Sr. García.",
        "is_unread": true,
        "type": "interacción"
      },
      {
        "id": "demo-unread-7:2026-02-18:1a0a",
        "parent_id": "a1b2c3d4-e5f6-7890-abcd-000200000000",
        "project_name": "PR0102 - DEMO-CLIENT - Climatización Nave Industrial Pol. Norte",
        "identification": {
          "name": "Seguimiento con el equipo de obra. Avance al 85% en la instalación de bandejas portacables."
        },
        "last_edited_time": "2026-02-18",
        "text": "Seguimiento con el equipo de obra. Avance al 85% en la instalación de bandejas portacables.",
        "is_unread": true,
        "type": "interacción"
      },
      {
        "id": "demo-unread-8:2026-03-13:1e61",
        "parent_id": "a1b2c3d4-e5f6-7890-abcd-000200000000",
        "project_name": "PR0102 - DEMO-CLIENT - Climatización Nave Industrial Pol. Norte",
        "identification": {
          "name": "Se solicita al instalador revisión del expediente y propuesta de fecha para resolver deficiencias pe"
        },
        "last_edited_time": "2026-03-13",
        "text": "Se solicita al instalador revisión del expediente y propuesta de fecha para resolver deficiencias pendientes.",
        "is_unread": true,
        "type": "interacción"
      },
      {
        "id": "demo-unread-9:2026-03-11:22b8",
        "parent_id": "a1b2c3d4-e5f6-7890-abcd-000200000000",
        "project_name": "PR0102 - DEMO-CLIENT - Climatización Nave Industrial Pol. Norte",
        "identification": {
          "name": "Visita al local para verificar el estado del cuadro eléctrico general. Se tomarán mediciones."
        },
        "last_edited_time": "2026-03-11",
        "text": "Visita al local para verificar el estado del cuadro eléctrico general. Se tomarán mediciones.",
        "is_unread": true,
        "type": "interacción"
      },
      {
        "id": "demo-unread-10:2026-03-05:270f",
        "parent_id": "a1b2c3d4-e5f6-7890-abcd-000200000000",
        "project_name": "PR0102 - DEMO-CLIENT - Climatización Nave Industrial Pol. Norte",
        "identification": {
          "name": "Contacto con el propietario para agendar visita técnica. Disponible cualquier día de 10 a 14h."
        },
        "last_edited_time": "2026-03-05",
        "text": "Contacto con el propietario para agendar visita técnica. Disponible cualquier día de 10 a 14h.",
        "is_unread": true,
        "type": "interacción"
      },
      {
        "id": "demo-unread-11:2026-03-04:2b66",
        "parent_id": "a1b2c3d4-e5f6-7890-abcd-000200000000",
        "project_name": "PR0102 - DEMO-CLIENT - Climatización Nave Industrial Pol. Norte",
        "identification": {
          "name": "El cuadro eléctrico actual no cumple con la normativa vigente. Se recomienda sustitución completa."
        },
        "last_edited_time": "2026-03-04",
        "text": "El cuadro eléctrico actual no cumple con la normativa vigente. Se recomienda sustitución completa.",
        "is_unread": true,
        "type": "interacción"
      },
      {
        "id": "demo-unread-12:2026-03-04:2fbd",
        "parent_id": "a1b2c3d4-e5f6-7890-abcd-000200000000",
        "project_name": "PR0102 - DEMO-CLIENT - Climatización Nave Industrial Pol. Norte",
        "identification": {
          "name": "Preparación de la memoria técnica de diseño para la legalización de la instalación de baja tensión."
        },
        "last_edited_time": "2026-03-04",
        "text": "Preparación de la memoria técnica de diseño para la legalización de la instalación de baja tensión.",
        "is_unread": true,
        "type": "interacción"
      }
    ],
    "user_id": 1,
    "client_id": "DEMO-CLIENT"
  },
  "tasks": {
    "data": [
      {
        "id": "f1e2d3c4-b5a6-7890-abcd-006400000000",
        "last_edited_time": "2026-03-20T09:00:00.000Z",
        "identification": {
          "name": "Cálculo de secciones circuitos",
          "project_relation": [
            "a1b2c3d4-e5f6-7890-abcd-000100000000"
          ]
        },
        "status": {
          "main": {
            "name": "Completado",
            "color": "green"
          },
          "phase": null,
          "progress": 100
        },
        "assigned": {
          "name": "Ana López Martín",
          "email": "ana.lopez@demo.com"
        },
        "priority": {
          "name": "Alta",
          "color": "red"
        },
        "due_date": {
          "start": "2026-03-23T12:30:00.000+01:00",
          "end": null
        }
      },
      {
        "id": "f1e2d3c4-b5a6-7890-abcd-006500000000",
        "last_edited_time": "2026-03-19T09:00:00.000Z",
        "identification": {
          "name": "Esquema unifilar revisión 2",
          "project_relation": [
            "a1b2c3d4-e5f6-7890-abcd-000100000000"
          ]
        },
        "status": {
          "main": {
            "name": "Completado",
            "color": "green"
          },
          "phase": null,
          "progress": 100
        },
        "assigned": {
          "name": "Ana López Martín",
          "email": "ana.lopez@demo.com"
        },
        "priority": {
          "name": "Alta",
          "color": "red"
        },
        "due_date": {
          "start": "2026-03-23T17:30:00.000+01:00",
          "end": null
        }
      },
      {
        "id": "f1e2d3c4-b5a6-7890-abcd-006600000000",
        "last_edited_time": "2026-03-18T09:00:00.000Z",
        "identification": {
          "name": "Solicitud punto de conexión",
          "project_relation": [
            "a1b2c3d4-e5f6-7890-abcd-000100000000"
          ]
        },
        "status": {
          "main": {
            "name": "Por hacer",
            "color": "blue"
          },
          "phase": null,
          "progress": 0
        },
        "assigned": {
          "name": "Ana López Martín",
          "email": "ana.lopez@demo.com"
        },
        "priority": {
          "name": "Alta",
          "color": "red"
        },
        "due_date": {
          "start": "2026-03-24",
          "end": null
        }
      },
      {
        "id": "f1e2d3c4-b5a6-7890-abcd-006700000000",
        "last_edited_time": "2026-03-17T09:00:00.000Z",
        "identification": {
          "name": "Inspección OCA BT",
          "project_relation": [
            "a1b2c3d4-e5f6-7890-abcd-000100000000"
          ]
        },
        "status": {
          "main": {
            "name": "Programado",
            "color": "purple"
          },
          "phase": null,
          "progress": 50
        },
        "assigned": {
          "name": "Ana López Martín",
          "email": "ana.lopez@demo.com"
        },
        "priority": {
          "name": "Alta",
          "color": "red"
        },
        "due_date": {
          "start": "2026-03-25T12:00:00.000+01:00",
          "end": null
        }
      },
      {
        "id": "f1e2d3c4-b5a6-7890-abcd-006800000000",
        "last_edited_time": "2026-03-16T09:00:00.000Z",
        "identification": {
          "name": "Memoria técnica de diseño",
          "project_relation": [
            "a1b2c3d4-e5f6-7890-abcd-000100000000"
          ]
        },
        "status": {
          "main": {
            "name": "Por hacer",
            "color": "blue"
          },
          "phase": null,
          "progress": 0
        },
        "assigned": null,
        "priority": {
          "name": "Alta",
          "color": "red"
        },
        "due_date": {
          "start": "2026-03-26",
          "end": null
        }
      },
      {
        "id": "f1e2d3c4-b5a6-7890-abcd-006900000000",
        "last_edited_time": "2026-03-20T09:00:00.000Z",
        "identification": {
          "name": "Certificado final de instalación",
          "project_relation": [
            "a1b2c3d4-e5f6-7890-abcd-000100000000"
          ]
        },
        "status": {
          "main": {
            "name": "En espera",
            "color": "yellow"
          },
          "phase": null,
          "progress": 50
        },
        "assigned": null,
        "priority": {
          "name": "Media",
          "color": "yellow"
        },
        "due_date": null
      },
      {
        "id": "f1e2d3c4-b5a6-7890-abcd-006a00000000",
        "last_edited_time": "2026-03-19T09:00:00.000Z",
        "identification": {
          "name": "Trámite legalización distribuidora",
          "project_relation": [
            "a1b2c3d4-e5f6-7890-abcd-000100000000"
          ]
        },
        "status": {
          "main": {
            "name": "En espera",
            "color": "yellow"
          },
          "phase": null,
          "progress": 50
        },
        "assigned": null,
        "priority": null,
        "due_date": null
      },
      {
        "id": "f1e2d3c4-b5a6-7890-abcd-006b00000000",
        "last_edited_time": "2026-03-18T09:00:00.000Z",
        "identification": {
          "name": "Planos de planta actualización",
          "project_relation": [
            "a1b2c3d4-e5f6-7890-abcd-000100000000"
          ]
        },
        "status": {
          "main": {
            "name": "Bloqueado",
            "color": "red"
          },
          "phase": null,
          "progress": 50
        },
        "assigned": null,
        "priority": null,
        "due_date": null
      },
      {
        "id": "f1e2d3c4-b5a6-7890-abcd-006c00000000",
        "last_edited_time": "2026-03-17T09:00:00.000Z",
        "identification": {
          "name": "Revisión cuadro eléctrico",
          "project_relation": [
            "a1b2c3d4-e5f6-7890-abcd-000200000000"
          ]
        },
        "status": {
          "main": {
            "name": "Completado",
            "color": "green"
          },
          "phase": null,
          "progress": 100
        },
        "assigned": {
          "name": "Carlos Ruiz Pérez",
          "email": "carlos.ruiz@demo.com"
        },
        "priority": {
          "name": "Alta",
          "color": "red"
        },
        "due_date": {
          "start": "2026-03-25",
          "end": null
        }
      },
      {
        "id": "f1e2d3c4-b5a6-7890-abcd-006d00000000",
        "last_edited_time": "2026-03-16T09:00:00.000Z",
        "identification": {
          "name": "Dimensionado protecciones",
          "project_relation": [
            "a1b2c3d4-e5f6-7890-abcd-000200000000"
          ]
        },
        "status": {
          "main": {
            "name": "Por hacer",
            "color": "blue"
          },
          "phase": null,
          "progress": 0
        },
        "assigned": {
          "name": "Carlos Ruiz Pérez",
          "email": "carlos.ruiz@demo.com"
        },
        "priority": {
          "name": "Media",
          "color": "yellow"
        },
        "due_date": {
          "start": "2026-03-26",
          "end": null
        }
      },
      {
        "id": "f1e2d3c4-b5a6-7890-abcd-006e00000000",
        "last_edited_time": "2026-03-20T09:00:00.000Z",
        "identification": {
          "name": "Estudio de eficiencia lumínica",
          "project_relation": [
            "a1b2c3d4-e5f6-7890-abcd-000300000000"
          ]
        },
        "status": {
          "main": {
            "name": "Por hacer",
            "color": "blue"
          },
          "phase": null,
          "progress": 0
        },
        "assigned": {
          "name": "Ana López Martín",
          "email": "ana.lopez@demo.com"
        },
        "priority": {
          "name": "Alta",
          "color": "red"
        },
        "due_date": {
          "start": "2026-03-27",
          "end": null
        }
      },
      {
        "id": "f1e2d3c4-b5a6-7890-abcd-006f00000000",
        "last_edited_time": "2026-03-19T09:00:00.000Z",
        "identification": {
          "name": "Informe de consumos históricos",
          "project_relation": [
            "a1b2c3d4-e5f6-7890-abcd-000300000000"
          ]
        },
        "status": {
          "main": {
            "name": "En espera",
            "color": "yellow"
          },
          "phase": null,
          "progress": 50
        },
        "assigned": null,
        "priority": {
          "name": "Baja",
          "color": "green"
        },
        "due_date": null
      }
    ]
  },
  "detail": {
    "id": "a1b2c3d4-e5f6-7890-abcd-000100000000",
    "last_edited_time": "2026-03-21T12:42:00.000Z",
    "project": {
      "identification": {
        "name": "PR0101 - DEMO-CLIENT - Instalación Solar Residencial Avda. del Sol 23",
        "project_relation": [],
        "offer_relation": []
      },
      "status": {
        "main": {
          "name": "En curso",
          "color": "yellow"
        },
        "phase": {
          "name": "Proyecto",
          "color": "blue"
        },
        "progress": 60
      },
      "client": {
        "details": {
          "name": "DEMO-CLIENT",
          "color": "purple"
        }
      },
      "financials": {
        "totalOffered": 4500,
        "totalBilled": 1800,
        "totalPending": 2700,
        "billingPercentage": 40
      },
      "assets": {
        "projectSheet": {
          "name": "PR0101_HOJA_PROYECTO.pdf",
          "url": "https://demo-files.demo-client.demo/docs/PR0101_HOJA_PROYECTO.pdf"
        },
        "offerFile": {
          "name": "OF-2026-001.pdf",
          "url": "https://demo-files.demo-client.demo/offers/OF-2026-001.pdf"
        },
        "offerCode": "OF-2026-001",
        "offerLink": null
      },
      "metadata": [
        {
          "label": "Margen (€)",
          "value": 890.5,
          "type": "formula"
        },
        {
          "label": "Coste interno (€)",
          "value": 909.5,
          "type": "formula"
        }
      ]
    },
    "page_content": [
      {
        "type": "heading_2",
        "text": "Tareas del proyecto"
      }
    ],
    "has_tasks": true,
    "has_interactions": true,
    "has_deliveries": true,
    "has_contacts": true,
    "has_unread_interactions": true
  },
  "detail_tasks": [
    {
      "object": "page",
      "id": "f1e2d3c4-b5a6-7890-abcd-006400000000",
      "created_time": "2026-02-26T09:00:00.000Z",
      "last_edited_time": "2026-03-20T16:00:00.000Z",
      "created_by": {
        "object": "user",
        "id": "a0b1c2d3-e4f5-6789-0abc-def012345678"
      },
      "last_edited_by": {
        "object": "user",
        "id": "a0b1c2d3-e4f5-6789-0abc-def012345678"
      },
      "cover": null,
      "icon": {
        "type": "external",
        "external": {
          "url": "https://www.notion.so/icons/clipping_lightgray.svg"
        }
      },
      "parent": {
        "type": "database_id",
        "database_id": "demo-tasks-db-000"
      },
      "in_trash": false,
      "is_archived": false,
      "is_locked": false,
      "properties": {
        "Cliente": {
          "id": "%40Jq%60",
          "type": "rollup",
          "rollup": {
            "type": "array",
            "array": [
              {
                "type": "multi_select",
                "multi_select": [
                  {
                    "id": "demo",
                    "name": "DEMO-CLIENT",
                    "color": "purple"
                  }
                ]
              }
            ],
            "function": "show_original"
          }
        },
        "Nombre de la tarea": {
          "id": "title",
          "type": "title",
          "title": [
            {
              "type": "text",
              "text": {
                "content": "Cálculo de secciones circuitos",
                "link": null
              },
              "annotations": {
                "bold": false,
                "italic": false,
                "strikethrough": false,
                "underline": false,
                "code": false,
                "color": "default"
              },
              "plain_text": "Cálculo de secciones circuitos",
              "href": null
            }
          ]
        },
        "Responsable": {
          "id": "notion%3A%2F%2Ftasks%2Fassign_property",
          "type": "people",
          "people": [
            {
              "object": "user",
              "id": "a0b1c2d3-e4f5-6789-0abc-def012345678",
              "name": "Ana López Martín",
              "avatar_url": null,
              "type": "person",
              "person": {
                "email": "ana.lopez@demo.com"
              }
            }
          ]
        },
        "Estado": {
          "id": "notion%3A%2F%2Ftasks%2Fstatus_property",
          "type": "status",
          "status": {
            "id": "done",
            "name": "Completado",
            "color": "green"
          }
        },
        "Fecha límite": {
          "id": "notion%3A%2F%2Ftasks%2Fdue_date_property",
          "type": "date",
          "date": {
            "start": "2026-03-23T12:30:00.000+01:00",
            "end": null,
            "time_zone": null
          }
        },
        "Prioridad": {
          "id": "notion%3A%2F%2Ftasks%2Fpriority_property",
          "type": "select",
          "select": {
            "id": "priority_high",
            "name": "Alta",
            "color": "red"
          }
        },
        "Sub-tasks": {
          "id": "notion%3A%2F%2Ftasks%2Fsub_task_relation",
          "type": "relation",
          "relation": [],
          "has_more": false
        },
        "Resumen": {
          "id": "notion%3A%2F%2Ftasks%2Fai_summary_property",
          "type": "rich_text",
          "rich_text": [
            {
              "type": "text",
              "text": {
                "content": "Tarea: Cálculo de secciones circuitos. Estado: Completado.",
                "link": null
              },
              "annotations": {
                "bold": false,
                "italic": false,
                "strikethrough": false,
                "underline": false,
                "code": false,
                "color": "default"
              },
              "plain_text": "Tarea: Cálculo de secciones circuitos. Estado: Completado.",
              "href": null
            }
          ]
        },
        "Tarea principal": {
          "id": "notion%3A%2F%2Ftasks%2Fparent_task_relation",
          "type": "relation",
          "relation": [],
          "has_more": false
        },
        "Proyecto": {
          "id": "notion%3A%2F%2Ftasks%2Ftask_to_project_relation",
          "type": "relation",
          "relation": [
            {
              "id": "a1b2c3d4-e5f6-7890-abcd-000100000000"
            }
          ],
          "has_more": false
        }
      },
      "url": "https://www.notion.so/demo-task-f1e2d3c4-b5a6-7890-abcd-006400000000",
      "public_url": null,
      "archived": false,
      "request_id": "demo-req-0"
    },
    {
      "object": "page",
      "id": "f1e2d3c4-b5a6-7890-abcd-006500000000",
      "created_time": "2026-02-27T09:00:00.000Z",
      "last_edited_time": "2026-03-19T16:00:00.000Z",
      "created_by": {
        "object": "user",
        "id": "a0b1c2d3-e4f5-6789-0abc-def012345678"
      },
      "last_edited_by": {
        "object": "user",
        "id": "a0b1c2d3-e4f5-6789-0abc-def012345678"
      },
      "cover": null,
      "icon": {
        "type": "external",
        "external": {
          "url": "https://www.notion.so/icons/clipping_lightgray.svg"
        }
      },
      "parent": {
        "type": "database_id",
        "database_id": "demo-tasks-db-000"
      },
      "in_trash": false,
      "is_archived": false,
      "is_locked": false,
      "properties": {
        "Cliente": {
          "id": "%40Jq%60",
          "type": "rollup",
          "rollup": {
            "type": "array",
            "array": [
              {
                "type": "multi_select",
                "multi_select": [
                  {
                    "id": "demo",
                    "name": "DEMO-CLIENT",
                    "color": "purple"
                  }
                ]
              }
            ],
            "function": "show_original"
          }
        },
        "Nombre de la tarea": {
          "id": "title",
          "type": "title",
          "title": [
            {
              "type": "text",
              "text": {
                "content": "Esquema unifilar revisión 2",
                "link": null
              },
              "annotations": {
                "bold": false,
                "italic": false,
                "strikethrough": false,
                "underline": false,
                "code": false,
                "color": "default"
              },
              "plain_text": "Esquema unifilar revisión 2",
              "href": null
            }
          ]
        },
        "Responsable": {
          "id": "notion%3A%2F%2Ftasks%2Fassign_property",
          "type": "people",
          "people": [
            {
              "object": "user",
              "id": "a0b1c2d3-e4f5-6789-0abc-def012345678",
              "name": "Ana López Martín",
              "avatar_url": null,
              "type": "person",
              "person": {
                "email": "ana.lopez@demo.com"
              }
            }
          ]
        },
        "Estado": {
          "id": "notion%3A%2F%2Ftasks%2Fstatus_property",
          "type": "status",
          "status": {
            "id": "done",
            "name": "Completado",
            "color": "green"
          }
        },
        "Fecha límite": {
          "id": "notion%3A%2F%2Ftasks%2Fdue_date_property",
          "type": "date",
          "date": {
            "start": "2026-03-23T17:30:00.000+01:00",
            "end": null,
            "time_zone": null
          }
        },
        "Prioridad": {
          "id": "notion%3A%2F%2Ftasks%2Fpriority_property",
          "type": "select",
          "select": {
            "id": "priority_high",
            "name": "Alta",
            "color": "red"
          }
        },
        "Sub-tasks": {
          "id": "notion%3A%2F%2Ftasks%2Fsub_task_relation",
          "type": "relation",
          "relation": [],
          "has_more": false
        },
        "Resumen": {
          "id": "notion%3A%2F%2Ftasks%2Fai_summary_property",
          "type": "rich_text",
          "rich_text": [
            {
              "type": "text",
              "text": {
                "content": "Tarea: Esquema unifilar revisión 2. Estado: Completado.",
                "link": null
              },
              "annotations": {
                "bold": false,
                "italic": false,
                "strikethrough": false,
                "underline": false,
                "code": false,
                "color": "default"
              },
              "plain_text": "Tarea: Esquema unifilar revisión 2. Estado: Completado.",
              "href": null
            }
          ]
        },
        "Tarea principal": {
          "id": "notion%3A%2F%2Ftasks%2Fparent_task_relation",
          "type": "relation",
          "relation": [],
          "has_more": false
        },
        "Proyecto": {
          "id": "notion%3A%2F%2Ftasks%2Ftask_to_project_relation",
          "type": "relation",
          "relation": [
            {
              "id": "a1b2c3d4-e5f6-7890-abcd-000100000000"
            }
          ],
          "has_more": false
        }
      },
      "url": "https://www.notion.so/demo-task-f1e2d3c4-b5a6-7890-abcd-006500000000",
      "public_url": null,
      "archived": false,
      "request_id": "demo-req-1"
    },
    {
      "object": "page",
      "id": "f1e2d3c4-b5a6-7890-abcd-006600000000",
      "created_time": "2026-02-28T09:00:00.000Z",
      "last_edited_time": "2026-03-18T16:00:00.000Z",
      "created_by": {
        "object": "user",
        "id": "a0b1c2d3-e4f5-6789-0abc-def012345678"
      },
      "last_edited_by": {
        "object": "user",
        "id": "a0b1c2d3-e4f5-6789-0abc-def012345678"
      },
      "cover": null,
      "icon": {
        "type": "external",
        "external": {
          "url": "https://www.notion.so/icons/clipping_lightgray.svg"
        }
      },
      "parent": {
        "type": "database_id",
        "database_id": "demo-tasks-db-000"
      },
      "in_trash": false,
      "is_archived": false,
      "is_locked": false,
      "properties": {
        "Cliente": {
          "id": "%40Jq%60",
          "type": "rollup",
          "rollup": {
            "type": "array",
            "array": [
              {
                "type": "multi_select",
                "multi_select": [
                  {
                    "id": "demo",
                    "name": "DEMO-CLIENT",
                    "color": "purple"
                  }
                ]
              }
            ],
            "function": "show_original"
          }
        },
        "Nombre de la tarea": {
          "id": "title",
          "type": "title",
          "title": [
            {
              "type": "text",
              "text": {
                "content": "Solicitud punto de conexión",
                "link": null
              },
              "annotations": {
                "bold": false,
                "italic": false,
                "strikethrough": false,
                "underline": false,
                "code": false,
                "color": "default"
              },
              "plain_text": "Solicitud punto de conexión",
              "href": null
            }
          ]
        },
        "Responsable": {
          "id": "notion%3A%2F%2Ftasks%2Fassign_property",
          "type": "people",
          "people": [
            {
              "object": "user",
              "id": "a0b1c2d3-e4f5-6789-0abc-def012345678",
              "name": "Ana López Martín",
              "avatar_url": null,
              "type": "person",
              "person": {
                "email": "ana.lopez@demo.com"
              }
            }
          ]
        },
        "Estado": {
          "id": "notion%3A%2F%2Ftasks%2Fstatus_property",
          "type": "status",
          "status": {
            "id": "in-progress",
            "name": "Por hacer",
            "color": "blue"
          }
        },
        "Fecha límite": {
          "id": "notion%3A%2F%2Ftasks%2Fdue_date_property",
          "type": "date",
          "date": {
            "start": "2026-03-24",
            "end": null,
            "time_zone": null
          }
        },
        "Prioridad": {
          "id": "notion%3A%2F%2Ftasks%2Fpriority_property",
          "type": "select",
          "select": {
            "id": "priority_high",
            "name": "Alta",
            "color": "red"
          }
        },
        "Sub-tasks": {
          "id": "notion%3A%2F%2Ftasks%2Fsub_task_relation",
          "type": "relation",
          "relation": [],
          "has_more": false
        },
        "Resumen": {
          "id": "notion%3A%2F%2Ftasks%2Fai_summary_property",
          "type": "rich_text",
          "rich_text": [
            {
              "type": "text",
              "text": {
                "content": "Tarea: Solicitud punto de conexión. Estado: Por hacer.",
                "link": null
              },
              "annotations": {
                "bold": false,
                "italic": false,
                "strikethrough": false,
                "underline": false,
                "code": false,
                "color": "default"
              },
              "plain_text": "Tarea: Solicitud punto de conexión. Estado: Por hacer.",
              "href": null
            }
          ]
        },
        "Tarea principal": {
          "id": "notion%3A%2F%2Ftasks%2Fparent_task_relation",
          "type": "relation",
          "relation": [],
          "has_more": false
        },
        "Proyecto": {
          "id": "notion%3A%2F%2Ftasks%2Ftask_to_project_relation",
          "type": "relation",
          "relation": [
            {
              "id": "a1b2c3d4-e5f6-7890-abcd-000100000000"
            }
          ],
          "has_more": false
        }
      },
      "url": "https://www.notion.so/demo-task-f1e2d3c4-b5a6-7890-abcd-006600000000",
      "public_url": null,
      "archived": false,
      "request_id": "demo-req-2"
    },
    {
      "object": "page",
      "id": "f1e2d3c4-b5a6-7890-abcd-006700000000",
      "created_time": "2026-03-01T09:00:00.000Z",
      "last_edited_time": "2026-03-17T16:00:00.000Z",
      "created_by": {
        "object": "user",
        "id": "a0b1c2d3-e4f5-6789-0abc-def012345678"
      },
      "last_edited_by": {
        "object": "user",
        "id": "a0b1c2d3-e4f5-6789-0abc-def012345678"
      },
      "cover": null,
      "icon": {
        "type": "external",
        "external": {
          "url": "https://www.notion.so/icons/clipping_lightgray.svg"
        }
      },
      "parent": {
        "type": "database_id",
        "database_id": "demo-tasks-db-000"
      },
      "in_trash": false,
      "is_archived": false,
      "is_locked": false,
      "properties": {
        "Cliente": {
          "id": "%40Jq%60",
          "type": "rollup",
          "rollup": {
            "type": "array",
            "array": [
              {
                "type": "multi_select",
                "multi_select": [
                  {
                    "id": "demo",
                    "name": "DEMO-CLIENT",
                    "color": "purple"
                  }
                ]
              }
            ],
            "function": "show_original"
          }
        },
        "Nombre de la tarea": {
          "id": "title",
          "type": "title",
          "title": [
            {
              "type": "text",
              "text": {
                "content": "Inspección OCA BT",
                "link": null
              },
              "annotations": {
                "bold": false,
                "italic": false,
                "strikethrough": false,
                "underline": false,
                "code": false,
                "color": "default"
              },
              "plain_text": "Inspección OCA BT",
              "href": null
            }
          ]
        },
        "Responsable": {
          "id": "notion%3A%2F%2Ftasks%2Fassign_property",
          "type": "people",
          "people": [
            {
              "object": "user",
              "id": "a0b1c2d3-e4f5-6789-0abc-def012345678",
              "name": "Ana López Martín",
              "avatar_url": null,
              "type": "person",
              "person": {
                "email": "ana.lopez@demo.com"
              }
            }
          ]
        },
        "Estado": {
          "id": "notion%3A%2F%2Ftasks%2Fstatus_property",
          "type": "status",
          "status": {
            "id": "qi>X",
            "name": "Programado",
            "color": "purple"
          }
        },
        "Fecha límite": {
          "id": "notion%3A%2F%2Ftasks%2Fdue_date_property",
          "type": "date",
          "date": {
            "start": "2026-03-25T12:00:00.000+01:00",
            "end": null,
            "time_zone": null
          }
        },
        "Prioridad": {
          "id": "notion%3A%2F%2Ftasks%2Fpriority_property",
          "type": "select",
          "select": {
            "id": "priority_high",
            "name": "Alta",
            "color": "red"
          }
        },
        "Sub-tasks": {
          "id": "notion%3A%2F%2Ftasks%2Fsub_task_relation",
          "type": "relation",
          "relation": [],
          "has_more": false
        },
        "Resumen": {
          "id": "notion%3A%2F%2Ftasks%2Fai_summary_property",
          "type": "rich_text",
          "rich_text": [
            {
              "type": "text",
              "text": {
                "content": "Tarea: Inspección OCA BT. Estado: Programado.",
                "link": null
              },
              "annotations": {
                "bold": false,
                "italic": false,
                "strikethrough": false,
                "underline": false,
                "code": false,
                "color": "default"
              },
              "plain_text": "Tarea: Inspección OCA BT. Estado: Programado.",
              "href": null
            }
          ]
        },
        "Tarea principal": {
          "id": "notion%3A%2F%2Ftasks%2Fparent_task_relation",
          "type": "relation",
          "relation": [],
          "has_more": false
        },
        "Proyecto": {
          "id": "notion%3A%2F%2Ftasks%2Ftask_to_project_relation",
          "type": "relation",
          "relation": [
            {
              "id": "a1b2c3d4-e5f6-7890-abcd-000100000000"
            }
          ],
          "has_more": false
        }
      },
      "url": "https://www.notion.so/demo-task-f1e2d3c4-b5a6-7890-abcd-006700000000",
      "public_url": null,
      "archived": false,
      "request_id": "demo-req-3"
    },
    {
      "object": "page",
      "id": "f1e2d3c4-b5a6-7890-abcd-006800000000",
      "created_time": "2026-03-02T09:00:00.000Z",
      "last_edited_time": "2026-03-16T16:00:00.000Z",
      "created_by": {
        "object": "user",
        "id": "a0b1c2d3-e4f5-6789-0abc-def012345678"
      },
      "last_edited_by": {
        "object": "user",
        "id": "a0b1c2d3-e4f5-6789-0abc-def012345678"
      },
      "cover": null,
      "icon": {
        "type": "external",
        "external": {
          "url": "https://www.notion.so/icons/clipping_lightgray.svg"
        }
      },
      "parent": {
        "type": "database_id",
        "database_id": "demo-tasks-db-000"
      },
      "in_trash": false,
      "is_archived": false,
      "is_locked": false,
      "properties": {
        "Cliente": {
          "id": "%40Jq%60",
          "type": "rollup",
          "rollup": {
            "type": "array",
            "array": [
              {
                "type": "multi_select",
                "multi_select": [
                  {
                    "id": "demo",
                    "name": "DEMO-CLIENT",
                    "color": "purple"
                  }
                ]
              }
            ],
            "function": "show_original"
          }
        },
        "Nombre de la tarea": {
          "id": "title",
          "type": "title",
          "title": [
            {
              "type": "text",
              "text": {
                "content": "Memoria técnica de diseño",
                "link": null
              },
              "annotations": {
                "bold": false,
                "italic": false,
                "strikethrough": false,
                "underline": false,
                "code": false,
                "color": "default"
              },
              "plain_text": "Memoria técnica de diseño",
              "href": null
            }
          ]
        },
        "Responsable": {
          "id": "notion%3A%2F%2Ftasks%2Fassign_property",
          "type": "people",
          "people": []
        },
        "Estado": {
          "id": "notion%3A%2F%2Ftasks%2Fstatus_property",
          "type": "status",
          "status": {
            "id": "in-progress",
            "name": "Por hacer",
            "color": "blue"
          }
        },
        "Fecha límite": {
          "id": "notion%3A%2F%2Ftasks%2Fdue_date_property",
          "type": "date",
          "date": {
            "start": "2026-03-26",
            "end": null,
            "time_zone": null
          }
        },
        "Prioridad": {
          "id": "notion%3A%2F%2Ftasks%2Fpriority_property",
          "type": "select",
          "select": {
            "id": "priority_high",
            "name": "Alta",
            "color": "red"
          }
        },
        "Sub-tasks": {
          "id": "notion%3A%2F%2Ftasks%2Fsub_task_relation",
          "type": "relation",
          "relation": [],
          "has_more": false
        },
        "Resumen": {
          "id": "notion%3A%2F%2Ftasks%2Fai_summary_property",
          "type": "rich_text",
          "rich_text": [
            {
              "type": "text",
              "text": {
                "content": "Tarea: Memoria técnica de diseño. Estado: Por hacer.",
                "link": null
              },
              "annotations": {
                "bold": false,
                "italic": false,
                "strikethrough": false,
                "underline": false,
                "code": false,
                "color": "default"
              },
              "plain_text": "Tarea: Memoria técnica de diseño. Estado: Por hacer.",
              "href": null
            }
          ]
        },
        "Tarea principal": {
          "id": "notion%3A%2F%2Ftasks%2Fparent_task_relation",
          "type": "relation",
          "relation": [],
          "has_more": false
        },
        "Proyecto": {
          "id": "notion%3A%2F%2Ftasks%2Ftask_to_project_relation",
          "type": "relation",
          "relation": [
            {
              "id": "a1b2c3d4-e5f6-7890-abcd-000100000000"
            }
          ],
          "has_more": false
        }
      },
      "url": "https://www.notion.so/demo-task-f1e2d3c4-b5a6-7890-abcd-006800000000",
      "public_url": null,
      "archived": false,
      "request_id": "demo-req-4"
    },
    {
      "object": "page",
      "id": "f1e2d3c4-b5a6-7890-abcd-006900000000",
      "created_time": "2026-03-03T09:00:00.000Z",
      "last_edited_time": "2026-03-15T16:00:00.000Z",
      "created_by": {
        "object": "user",
        "id": "a0b1c2d3-e4f5-6789-0abc-def012345678"
      },
      "last_edited_by": {
        "object": "user",
        "id": "a0b1c2d3-e4f5-6789-0abc-def012345678"
      },
      "cover": null,
      "icon": {
        "type": "external",
        "external": {
          "url": "https://www.notion.so/icons/clipping_lightgray.svg"
        }
      },
      "parent": {
        "type": "database_id",
        "database_id": "demo-tasks-db-000"
      },
      "in_trash": false,
      "is_archived": false,
      "is_locked": false,
      "properties": {
        "Cliente": {
          "id": "%40Jq%60",
          "type": "rollup",
          "rollup": {
            "type": "array",
            "array": [
              {
                "type": "multi_select",
                "multi_select": [
                  {
                    "id": "demo",
                    "name": "DEMO-CLIENT",
                    "color": "purple"
                  }
                ]
              }
            ],
            "function": "show_original"
          }
        },
        "Nombre de la tarea": {
          "id": "title",
          "type": "title",
          "title": [
            {
              "type": "text",
              "text": {
                "content": "Certificado final de instalación",
                "link": null
              },
              "annotations": {
                "bold": false,
                "italic": false,
                "strikethrough": false,
                "underline": false,
                "code": false,
                "color": "default"
              },
              "plain_text": "Certificado final de instalación",
              "href": null
            }
          ]
        },
        "Responsable": {
          "id": "notion%3A%2F%2Ftasks%2Fassign_property",
          "type": "people",
          "people": []
        },
        "Estado": {
          "id": "notion%3A%2F%2Ftasks%2Fstatus_property",
          "type": "status",
          "status": {
            "id": "B]PF",
            "name": "En espera",
            "color": "yellow"
          }
        },
        "Fecha límite": {
          "id": "notion%3A%2F%2Ftasks%2Fdue_date_property",
          "type": "date",
          "date": null
        },
        "Prioridad": {
          "id": "notion%3A%2F%2Ftasks%2Fpriority_property",
          "type": "select",
          "select": {
            "id": "priority_medium",
            "name": "Media",
            "color": "yellow"
          }
        },
        "Sub-tasks": {
          "id": "notion%3A%2F%2Ftasks%2Fsub_task_relation",
          "type": "relation",
          "relation": [],
          "has_more": false
        },
        "Resumen": {
          "id": "notion%3A%2F%2Ftasks%2Fai_summary_property",
          "type": "rich_text",
          "rich_text": [
            {
              "type": "text",
              "text": {
                "content": "Tarea: Certificado final de instalación. Estado: En espera.",
                "link": null
              },
              "annotations": {
                "bold": false,
                "italic": false,
                "strikethrough": false,
                "underline": false,
                "code": false,
                "color": "default"
              },
              "plain_text": "Tarea: Certificado final de instalación. Estado: En espera.",
              "href": null
            }
          ]
        },
        "Tarea principal": {
          "id": "notion%3A%2F%2Ftasks%2Fparent_task_relation",
          "type": "relation",
          "relation": [],
          "has_more": false
        },
        "Proyecto": {
          "id": "notion%3A%2F%2Ftasks%2Ftask_to_project_relation",
          "type": "relation",
          "relation": [
            {
              "id": "a1b2c3d4-e5f6-7890-abcd-000100000000"
            }
          ],
          "has_more": false
        }
      },
      "url": "https://www.notion.so/demo-task-f1e2d3c4-b5a6-7890-abcd-006900000000",
      "public_url": null,
      "archived": false,
      "request_id": "demo-req-5"
    },
    {
      "object": "page",
      "id": "f1e2d3c4-b5a6-7890-abcd-006a00000000",
      "created_time": "2026-03-04T09:00:00.000Z",
      "last_edited_time": "2026-03-14T16:00:00.000Z",
      "created_by": {
        "object": "user",
        "id": "a0b1c2d3-e4f5-6789-0abc-def012345678"
      },
      "last_edited_by": {
        "object": "user",
        "id": "a0b1c2d3-e4f5-6789-0abc-def012345678"
      },
      "cover": null,
      "icon": {
        "type": "external",
        "external": {
          "url": "https://www.notion.so/icons/clipping_lightgray.svg"
        }
      },
      "parent": {
        "type": "database_id",
        "database_id": "demo-tasks-db-000"
      },
      "in_trash": false,
      "is_archived": false,
      "is_locked": false,
      "properties": {
        "Cliente": {
          "id": "%40Jq%60",
          "type": "rollup",
          "rollup": {
            "type": "array",
            "array": [
              {
                "type": "multi_select",
                "multi_select": [
                  {
                    "id": "demo",
                    "name": "DEMO-CLIENT",
                    "color": "purple"
                  }
                ]
              }
            ],
            "function": "show_original"
          }
        },
        "Nombre de la tarea": {
          "id": "title",
          "type": "title",
          "title": [
            {
              "type": "text",
              "text": {
                "content": "Trámite legalización distribuidora",
                "link": null
              },
              "annotations": {
                "bold": false,
                "italic": false,
                "strikethrough": false,
                "underline": false,
                "code": false,
                "color": "default"
              },
              "plain_text": "Trámite legalización distribuidora",
              "href": null
            }
          ]
        },
        "Responsable": {
          "id": "notion%3A%2F%2Ftasks%2Fassign_property",
          "type": "people",
          "people": []
        },
        "Estado": {
          "id": "notion%3A%2F%2Ftasks%2Fstatus_property",
          "type": "status",
          "status": {
            "id": "B]PF",
            "name": "En espera",
            "color": "yellow"
          }
        },
        "Fecha límite": {
          "id": "notion%3A%2F%2Ftasks%2Fdue_date_property",
          "type": "date",
          "date": null
        },
        "Prioridad": {
          "id": "notion%3A%2F%2Ftasks%2Fpriority_property",
          "type": "select",
          "select": null
        },
        "Sub-tasks": {
          "id": "notion%3A%2F%2Ftasks%2Fsub_task_relation",
          "type": "relation",
          "relation": [],
          "has_more": false
        },
        "Resumen": {
          "id": "notion%3A%2F%2Ftasks%2Fai_summary_property",
          "type": "rich_text",
          "rich_text": [
            {
              "type": "text",
              "text": {
                "content": "Tarea: Trámite legalización distribuidora. Estado: En espera.",
                "link": null
              },
              "annotations": {
                "bold": false,
                "italic": false,
                "strikethrough": false,
                "underline": false,
                "code": false,
                "color": "default"
              },
              "plain_text": "Tarea: Trámite legalización distribuidora. Estado: En espera.",
              "href": null
            }
          ]
        },
        "Tarea principal": {
          "id": "notion%3A%2F%2Ftasks%2Fparent_task_relation",
          "type": "relation",
          "relation": [],
          "has_more": false
        },
        "Proyecto": {
          "id": "notion%3A%2F%2Ftasks%2Ftask_to_project_relation",
          "type": "relation",
          "relation": [
            {
              "id": "a1b2c3d4-e5f6-7890-abcd-000100000000"
            }
          ],
          "has_more": false
        }
      },
      "url": "https://www.notion.so/demo-task-f1e2d3c4-b5a6-7890-abcd-006a00000000",
      "public_url": null,
      "archived": false,
      "request_id": "demo-req-6"
    },
    {
      "object": "page",
      "id": "f1e2d3c4-b5a6-7890-abcd-006b00000000",
      "created_time": "2026-03-05T09:00:00.000Z",
      "last_edited_time": "2026-03-13T16:00:00.000Z",
      "created_by": {
        "object": "user",
        "id": "a0b1c2d3-e4f5-6789-0abc-def012345678"
      },
      "last_edited_by": {
        "object": "user",
        "id": "a0b1c2d3-e4f5-6789-0abc-def012345678"
      },
      "cover": null,
      "icon": {
        "type": "external",
        "external": {
          "url": "https://www.notion.so/icons/clipping_lightgray.svg"
        }
      },
      "parent": {
        "type": "database_id",
        "database_id": "demo-tasks-db-000"
      },
      "in_trash": false,
      "is_archived": false,
      "is_locked": false,
      "properties": {
        "Cliente": {
          "id": "%40Jq%60",
          "type": "rollup",
          "rollup": {
            "type": "array",
            "array": [
              {
                "type": "multi_select",
                "multi_select": [
                  {
                    "id": "demo",
                    "name": "DEMO-CLIENT",
                    "color": "purple"
                  }
                ]
              }
            ],
            "function": "show_original"
          }
        },
        "Nombre de la tarea": {
          "id": "title",
          "type": "title",
          "title": [
            {
              "type": "text",
              "text": {
                "content": "Planos de planta actualización",
                "link": null
              },
              "annotations": {
                "bold": false,
                "italic": false,
                "strikethrough": false,
                "underline": false,
                "code": false,
                "color": "default"
              },
              "plain_text": "Planos de planta actualización",
              "href": null
            }
          ]
        },
        "Responsable": {
          "id": "notion%3A%2F%2Ftasks%2Fassign_property",
          "type": "people",
          "people": []
        },
        "Estado": {
          "id": "notion%3A%2F%2Ftasks%2Fstatus_property",
          "type": "status",
          "status": {
            "id": "<Ti]",
            "name": "Bloqueado",
            "color": "red"
          }
        },
        "Fecha límite": {
          "id": "notion%3A%2F%2Ftasks%2Fdue_date_property",
          "type": "date",
          "date": null
        },
        "Prioridad": {
          "id": "notion%3A%2F%2Ftasks%2Fpriority_property",
          "type": "select",
          "select": null
        },
        "Sub-tasks": {
          "id": "notion%3A%2F%2Ftasks%2Fsub_task_relation",
          "type": "relation",
          "relation": [],
          "has_more": false
        },
        "Resumen": {
          "id": "notion%3A%2F%2Ftasks%2Fai_summary_property",
          "type": "rich_text",
          "rich_text": [
            {
              "type": "text",
              "text": {
                "content": "Tarea: Planos de planta actualización. Estado: Bloqueado.",
                "link": null
              },
              "annotations": {
                "bold": false,
                "italic": false,
                "strikethrough": false,
                "underline": false,
                "code": false,
                "color": "default"
              },
              "plain_text": "Tarea: Planos de planta actualización. Estado: Bloqueado.",
              "href": null
            }
          ]
        },
        "Tarea principal": {
          "id": "notion%3A%2F%2Ftasks%2Fparent_task_relation",
          "type": "relation",
          "relation": [],
          "has_more": false
        },
        "Proyecto": {
          "id": "notion%3A%2F%2Ftasks%2Ftask_to_project_relation",
          "type": "relation",
          "relation": [
            {
              "id": "a1b2c3d4-e5f6-7890-abcd-000100000000"
            }
          ],
          "has_more": false
        }
      },
      "url": "https://www.notion.so/demo-task-f1e2d3c4-b5a6-7890-abcd-006b00000000",
      "public_url": null,
      "archived": false,
      "request_id": "demo-req-7"
    }
  ],
  "detail_interactions": {
    "content": [
      {
        "id": "demo-int-01",
        "type": "heading_3",
        "text": "2026-03-14 "
      },
      {
        "id": "demo-int-02",
        "type": "bulleted_list_item",
        "text": "El instalador confirma que la estructura de soporte para los paneles ya está anclada. Pendiente la conexión del inversor."
      },
      {
        "id": "demo-int-03",
        "type": "bulleted_list_item",
        "text": "Se coordina con la distribuidora para programar el enganche la semana que viene."
      },
      {
        "id": "demo-int-04",
        "type": "heading_3",
        "text": "2026-03-12 "
      },
      {
        "id": "demo-int-05",
        "type": "bulleted_list_item",
        "text": "Revisión del circuito de protecciones completada. Se detectó un diferencial con calibre inadecuado que será sustituido mañana."
      },
      {
        "id": "demo-int-06",
        "type": "bulleted_list_item",
        "text": "Se confirma que la inspección puede programarse para la semana siguiente."
      },
      {
        "id": "demo-int-07",
        "type": "heading_3",
        "text": "2026-03-09 "
      },
      {
        "id": "demo-int-08",
        "type": "bulleted_list_item",
        "text": "Reunión con el técnico de la distribuidora para coordinar el punto de conexión. Confirma disponibilidad para la semana que viene."
      },
      {
        "id": "demo-int-09",
        "type": "bulleted_list_item",
        "text": "Se confirma que los trabajos estarán finalizados a lo largo de la semana."
      },
      {
        "id": "demo-int-10",
        "type": "heading_3",
        "text": "2026-03-04 "
      },
      {
        "id": "demo-int-11",
        "type": "bulleted_list_item",
        "text": "Se envía documentación de proyecto al organismo de control para la solicitud de inspección inicial."
      },
      {
        "id": "demo-int-12",
        "type": "heading_3",
        "text": "2026-03-03 "
      },
      {
        "id": "demo-int-13",
        "type": "bulleted_list_item",
        "text": "Inspección no favorable: 5 deficiencias menores detectadas. Se procede a corrección inmediata."
      },
      {
        "id": "demo-int-14",
        "type": "heading_3",
        "text": "2026-02-26 "
      },
      {
        "id": "demo-int-15",
        "type": "bulleted_list_item",
        "text": "Se programa inspección OCA para el 3 de marzo a las 10:00. Inspector asignado: Sr. García."
      }
    ],
    "related": [
      {
        "object": "page",
        "id": "demo-rel-01",
        "created_time": "2026-02-25T13:29:00.000Z",
        "last_edited_time": "2026-02-25T13:30:00.000Z",
        "created_by": {
          "object": "user",
          "id": "a0b1c2d3-e4f5-6789-0abc-def012345678"
        },
        "last_edited_by": {
          "object": "user",
          "id": "a0b1c2d3-e4f5-6789-0abc-def012345678"
        },
        "cover": null,
        "icon": null,
        "parent": {
          "type": "database_id",
          "database_id": "demo-hours-db-000"
        },
        "in_trash": false,
        "is_archived": false,
        "is_locked": false,
        "properties": {
          "Proyectos": {
            "id": "%3FjUc",
            "type": "relation",
            "relation": [
              {
                "id": "a1b2c3d4-e5f6-7890-abcd-000100000000"
              }
            ],
            "has_more": false
          },
          "Gastado (€)": {
            "id": "FYqt",
            "type": "formula",
            "formula": {
              "type": "number",
              "number": 62.5
            }
          },
          "Fecha": {
            "id": "JNzm",
            "type": "date",
            "date": {
              "start": "2026-02-25",
              "end": null,
              "time_zone": null
            }
          },
          "Tiempo (h)": {
            "id": "jlsF",
            "type": "number",
            "number": 0.5
          },
          "Nombre": {
            "id": "title",
            "type": "title",
            "title": [
              {
                "type": "text",
                "text": {
                  "content": "Gestiones administrativas y documentación",
                  "link": null
                },
                "annotations": {
                  "bold": false,
                  "italic": false,
                  "strikethrough": false,
                  "underline": false,
                  "code": false,
                  "color": "default"
                },
                "plain_text": "Gestiones administrativas y documentación",
                "href": null
              }
            ]
          }
        },
        "url": "https://www.notion.so/demo-related-01",
        "public_url": null,
        "archived": false,
        "request_id": "demo-rel-req-01"
      },
      {
        "object": "page",
        "id": "demo-rel-02",
        "created_time": "2026-03-03T21:43:00.000Z",
        "last_edited_time": "2026-03-03T21:43:00.000Z",
        "created_by": {
          "object": "user",
          "id": "a0b1c2d3-e4f5-6789-0abc-def012345678"
        },
        "last_edited_by": {
          "object": "user",
          "id": "a0b1c2d3-e4f5-6789-0abc-def012345678"
        },
        "cover": null,
        "icon": null,
        "parent": {
          "type": "database_id",
          "database_id": "demo-hours-db-000"
        },
        "in_trash": false,
        "is_archived": false,
        "is_locked": false,
        "properties": {
          "Proyectos": {
            "id": "%3FjUc",
            "type": "relation",
            "relation": [
              {
                "id": "a1b2c3d4-e5f6-7890-abcd-000100000000"
              }
            ],
            "has_more": false
          },
          "Gastado (€)": {
            "id": "FYqt",
            "type": "formula",
            "formula": {
              "type": "number",
              "number": 187.5
            }
          },
          "Fecha": {
            "id": "JNzm",
            "type": "date",
            "date": {
              "start": "2026-03-03",
              "end": null,
              "time_zone": null
            }
          },
          "Tiempo (h)": {
            "id": "jlsF",
            "type": "number",
            "number": 1.5
          },
          "Nombre": {
            "id": "title",
            "type": "title",
            "title": [
              {
                "type": "text",
                "text": {
                  "content": "Visita técnica con inspector",
                  "link": null
                },
                "annotations": {
                  "bold": false,
                  "italic": false,
                  "strikethrough": false,
                  "underline": false,
                  "code": false,
                  "color": "default"
                },
                "plain_text": "Visita técnica con inspector",
                "href": null
              }
            ]
          }
        },
        "url": "https://www.notion.so/demo-related-02",
        "public_url": null,
        "archived": false,
        "request_id": "demo-rel-req-02"
      }
    ]
  },
  "detail_deliveries": [
    {
      "id": "demo-del-01",
      "type": "heading_3",
      "text": "2026-03-04T16:18:00.000+01:00 "
    },
    {
      "id": "demo-del-02",
      "type": "bulleted_list_item",
      "text": "Informe de deficiencias al instalador"
    },
    {
      "id": "demo-del-03",
      "type": "paragraph",
      "text": "https://demo-files.demo-client.demo/deliveries/informe-deficiencias.pdf"
    },
    {
      "id": "demo-del-04",
      "type": "paragraph",
      "text": "2026-03-04T10:18:00.000+01:00 "
    },
    {
      "id": "demo-del-05",
      "type": "bulleted_list_item",
      "text": "Esquema unifilar y estudio de cargas"
    },
    {
      "id": "demo-del-06",
      "type": "paragraph",
      "text": "https://demo-files.demo-client.demo/deliveries/esquema-unifilar.pdf"
    }
  ],
  "detail_contacts": [
    {
      "id": "demo-contact-01",
      "name": "María García",
      "phone": "+34 600 00 00 01",
      "email": "maria.garcia@demo-cliente.com",
      "role": {
        "name": "Cliente",
        "color": "default"
      },
      "notes": "Persona de contacto principal"
    },
    {
      "id": "demo-contact-02",
      "name": "Pedro Sánchez Ruiz",
      "phone": "+34 600 00 00 02",
      "email": "pedro.sanchez@demo-instalador.com",
      "role": {
        "name": "Instalador",
        "color": "default"
      },
      "notes": null
    }
  ]
};
