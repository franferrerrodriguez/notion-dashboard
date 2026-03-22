<?php
// notion_helper.php - Integrated Notion API Handler

require_once __DIR__ . '/../../config/secrets.php';

/**
 * Fetch projects from a Notion Database filtered by Client ID
 */
function fetchNotionProjects($databaseId, $clientId, $type = 'projects', $forceManualFilter = false) {
    $apiKey = NOTION_API_KEY;
    
    // Notion API Endpoint for querying a database
    $url = "https://api.notion.com/v1/databases/{$databaseId}/query";

    // Default filter for multi_select (Projects/Offers)
    $filter = [
        'property' => 'Cliente', 
        'multi_select' => [
            'contains' => $clientId
        ]
    ];

    // For Invoices and Tasks, we remove the Notion filter to avoid the 400 Rollup error 
    // or because they might not have a direct 'Cliente' property.
    if ($type === 'invoices' || $type === 'tasks' || $forceManualFilter) {
        $filter = null;
    }

    $filterData = $filter ? ['filter' => $filter] : (object)[];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($filterData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer {$apiKey}",
        "Notion-Version: 2022-06-28",
        "Content-Type: application/json",
        "Cache-Control: no-cache",
        "Pragma: no-cache"
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    if ($httpCode !== 200) {
        $_SESSION['last_notion_error'] = "Notion API Error ($httpCode): " . $response;
        return [];
    }

    $data = json_decode($response, true);
    $projects = [];

    if (isset($data['results'])) {
        foreach ($data['results'] as $page) {
            $props = $page['properties'];
            $transformed = ($type === 'tasks') ? transformTask($props) : transformProject($props);
            
            // Manual filtering for Invoices and Tasks (client data isolation)
            if (($type === 'invoices' || $type === 'tasks') && !empty($clientId)) {
                $clientName = $transformed['client']['details']['name'] ?? '';
                // For tasks, we might need a more robust check if client name is not direct
                // but usually they have a rollup from Project.
                if (stripos($clientName, $clientId) === false) continue;
            }

            $projects[] = array_merge([
                'id' => $page['id'],
                'last_edited_time' => $page['last_edited_time'] ?? null
            ], $transformed);
        }
    }

    return $projects;
}

/**
 * Maps raw Notion properties to a standardized BFF model
 */
/**
 * Transforms a raw Notion project into a professional, domain-driven domain model.
 * This decouples the application from Notion's internal property names and structures.
 */
function transformTask($props) {
    $get = function($names) use ($props) {
        if (!is_array($names)) $names = [$names];
        foreach ($names as $name) {
            $cleanName = trim(mb_strtolower($name));
            if (isset($props[$name])) return $props[$name];
            foreach ($props as $key => $val) {
                if (trim(mb_strtolower($key)) === $cleanName) return $val;
            }
        }
        return null;
    };

    $name = 'Tarea sin nombre';
    foreach ($props as $p) {
        if (($p['type'] ?? '') === 'title') {
            $name = extractText($p) ?: 'Tarea sin nombre';
            break;
        }
    }

    // Extract Date and Time
    $dateProp = $get(['Fecha', 'Date', 'Deadline', 'Fecha límite']);
    $dateData = null;
    if ($dateProp && $dateProp['type'] === 'date') {
        $start = $dateProp['date']['start'];
        $hasTime = strpos($start, 'T') !== false;
        $time = null;
        if ($hasTime) {
            $parts = explode('T', $start);
            $time = substr($parts[1], 0, 5);
            $start = $parts[0];
        }
        $dateData = ['date' => $start, 'time' => $time];
    }

    // Extract Status & Priority
    $statusObj = extractStatus($get(['Estado', 'Status', 'Situación'])) ?: ['name' => 'Sin empezar', 'color' => 'default'];
    $priority = extractText($get(['Prioridad', 'Priority', 'Urgencia'])) ?: 'Media';

    // Extract Client (for filtering) - Usually a rollup from Project
    $client = extractText($get(['Cliente', 'Client']));

    // Extract Related Project IDs
    $projectRelation = extractRelationIds($get(['Proyecto', 'Project', '↗ Proyecto']));

    return [
        'identification' => [
            'name' => $name,
            'project_relation' => $projectRelation,
        ],
        'status' => [
            'main' => $statusObj,
            'priority' => ['name' => $priority, 'color' => null],
        ],
        'date' => $dateData['date'] ?? null,
        'time' => $dateData['time'] ?? null,
        'client' => [
            'details' => ['name' => $client]
        ],
        'metadata' => extractRemainingProperties($props)
    ];
}

function transformProject($props) {
    // Helper to find property by name (case-insensitive and trimmed)
    $get = function($names) use ($props) {
        if (!is_array($names)) $names = [$names];
        foreach ($names as $name) {
            $cleanName = trim(mb_strtolower($name));
            if (isset($props[$name])) return $props[$name];
            // Case-insensitive & Trimmed search
            foreach ($props as $key => $val) {
                if (trim(mb_strtolower($key)) === $cleanName) return $val;
            }
        }
        return null;
    };

    // 1. Identify Title Property (Name)
    $name = 'Sin nombre';
    foreach ($props as $p) {
        if (($p['type'] ?? '') === 'title') {
            $name = extractText($p) ?: 'Sin nombre';
            break;
        }
    }

    // 2. Map Status and Phase (Grouping)
    $mainStatus = extractStatus($get(['Estado', 'Status', 'Estado factura', 'Situación'])) ?: null;

    // Fallback: If no status found by name, try finding the FIRST status or select property type
    if (!$mainStatus) {
        foreach ($props as $p) {
            $type = $p['type'] ?? '';
            if ($type === 'status' || $type === 'select') {
                $mainStatus = extractStatus($p);
                if ($mainStatus) break;
            }
        }
    }

    if (!$mainStatus) {
        $mainStatus = ['name' => 'Sin estado', 'color' => 'default'];
    }
    $phase = extractStatus($get(['Fase', 'Phase']));
    
    // Fallback: If no Phase, use Status for grouping (Unified Design)
    if (!$phase || $phase['name'] === 'Sin Fase') {
        $phase = $mainStatus;
    }

    return [
        'identification' => [
            'name' => $name,
            'project_relation' => extractRelationIds($get(['Proyecto', 'Project'])),
            'offer_relation' => extractRelationIds($get(['Vínculo oferta', 'Oferta vinculada', '↗ Oferta', 'Vínculo of...'])),
        ],
        'status' => [
            'main' => $mainStatus,
            'phase' => $phase,
            'progress' => extractNumber($get(['Progreso', 'Progress', '% completado', '% facturado', '% cobrado']), 100),
        ],
        'client' => [
            'details' => extractMultiSelect($get(['Cliente', 'Client']), true)[0] ?? ['name' => 'Sin Cliente', 'color' => 'default'],
        ],
        'financials' => [
            'totalOffered' => extractFinancial($get(['Total Ofertado', 'Importe neto', 'Base imponible', 'Importe factura'])),
            'totalBilled' => extractFinancial($get(['Total Facturado', 'Facturado', 'Cobrado'])),
            'totalPending' => extractFinancial($get(['Pendiente Facturar', 'Pendiente de cobro'])),
            'billingPercentage' => extractNumber($get(['% Facturado', '% facturado', '% cobrado']), 100),
        ],
        'assets' => [
            'projectSheet' => extractFile($get(['Hoja Proyecto', 'Ficha'])),
            'offerFile' => extractFile($get(['Oferta', 'Presupuesto', 'Factura PDF'])),
            'offerCode' => extractRollupTitle($get(['Código oferta', 'Nº Factura'])),
            'offerLink' => extractRollupTitle($get(['Vínculo Ofertas', 'Enlace'])),
        ],
        'metadata' => extractRemainingProperties($props)
    ];
}

/**
 * Extraction Helpers to ensure safety and type consistency.
 */

function extractText($prop) {
    if (!$prop) return null;
    $type = $prop['type'] ?? null;
    if ($type === 'title') return $prop['title'][0]['plain_text'] ?? null;
    if ($type === 'rich_text') return $prop['rich_text'][0]['plain_text'] ?? null;
    if ($type === 'people') return $prop['people'][0]['name'] ?? null;
    if ($type === 'email') return $prop['email'] ?? null;
    if ($type === 'phone_number') return $prop['phone_number'] ?? null;
    if ($type === 'select') return $prop['select']['name'] ?? null;
    if ($type === 'status') return $prop['status']['name'] ?? null;
    if ($type === 'checkbox') return $prop['checkbox'] ? 'Sí' : 'No';
    if ($type === 'url') return $prop['url'] ?? null;
    if ($type === 'number') return (string)($prop['number'] ?? '');
    
    if ($type === 'multi_select') {
        $names = array_map(function($s) { return $s['name']; }, $prop['multi_select'] ?? []);
        return implode(', ', $names);
    }
    
    if ($type === 'relation') {
        $rels = $prop['relation'] ?? [];
        if (empty($rels)) return null;
        // Optimization: Do NOT fetch details for relations in list views.
        // This avoids dozens of extra API calls that slow down the system and cause 500 errors.
        $id = $rels[0]['id'];
        return 'ID:' . substr($id, 0, 8);
    }

    if ($type === 'formula') {
        $f = $prop['formula'];
        return $f['string'] ?? (string)($f['number'] ?? ($f['boolean'] ? 'true' : ($f['date'] ? $f['date']['start'] : null)));
    }
    
    if ($type === 'rollup') {
        $r = $prop['rollup'];
        if (isset($r['number'])) return (string)$r['number'];
        if (isset($r['string'])) return $r['string'];
        if (isset($r['date'])) return $r['date']['start'];
        
        if ($r['type'] === 'array') {
            $texts = [];
            foreach ($r['array'] as $item) {
                $txt = extractText($item);
                if ($txt) $texts[] = $txt;
            }
            return implode(', ', array_unique($texts));
        }
    }
    // If we're here, we couldn't extract text. Let's see if it's one of the common types without a wrapper
    if (isset($prop['plain_text'])) return $prop['plain_text'];
    if (isset($prop['name'])) return $prop['name'];

    return null;
}

function transformContact($page) {
    $props = $page['properties'];
    $data = [
        'id' => $page['id'],
        'name' => 'Sin nombre',
        'phone' => null,
        'email' => null,
        'role' => null,
        'notes' => null
    ];
    
    $nameFromKey = false;
    $titleVal = null;

    foreach ($props as $key => $p) {
        $type = $p['type'] ?? '';
        $lowKey = mb_strtolower($key);
        $val = extractText($p);
        
        if ($type === 'title') {
            $titleVal = $val;
        }

        if ($lowKey === 'contacto' || $lowKey === 'nombre') {
            if ($val) {
                $data['name'] = $val;
                $nameFromKey = true;
            }
        } 
        
        if ($type === 'phone_number' || strpos($lowKey, 'tel') !== false) {
            if ($val) $data['phone'] = $val;
        }
        
        if ($type === 'email' || strpos($lowKey, 'mail') !== false || strpos($lowKey, 'correo') !== false) {
            if ($val) $data['email'] = $val;
        }
        
        if ($lowKey === 'rol' || $lowKey === 'puesto' || $lowKey === 'cargo') {
            $data['role'] = extractStatus($p) ?: ['name' => $val, 'color' => ($val ? 'default' : 'transparent')];
        }
        
        if ($lowKey === 'notas' || $lowKey === 'comentarios') {
            if ($val) $data['notes'] = $val;
        }
    }
    
    if (!$nameFromKey && $titleVal) {
        $data['name'] = $titleVal;
    }

    return $data;
}

function extractStatus($prop) {
    if (!$prop || !isset($prop['type'])) return null;
    $type = $prop['type'];

    // Handle Rollups (Recursive check)
    if ($type === 'rollup' && isset($prop['rollup']['array'])) {
        foreach ($prop['rollup']['array'] as $rollupItem) {
            $status = extractStatus($rollupItem);
            if ($status) return $status;
        }
    }

    // Handle Formula result
    if ($type === 'formula') {
        $f = $prop['formula'];
        $val = $f['string'] ?? (string)($f['number'] ?? null);
        if ($val) return ['name' => $val, 'color' => 'default'];
    }

    // Handle explicit Status or Select
    if (isset($prop['status']) || isset($prop['select'])) {
        $data = $prop['status'] ?? $prop['select'];
        return [
            'name' => $data['name'],
            'color' => $data['color'] ?? 'default'
        ];
    }

    // Fallback: Use generic text extraction
    $txt = extractText($prop);
    if ($txt) return ['name' => $txt, 'color' => 'default'];

    return null;
}

function extractNumber($prop, $multiplier = 1) {
    $val = $prop['number'] ?? $prop['formula']['number'] ?? $prop['rollup']['number'] ?? 0;
    return round($val * $multiplier, 2);
}

function extractFinancial($prop) {
    if (isset($prop['type']) && $prop['type'] === 'rollup' && isset($prop['rollup']['array'])) {
        foreach ($prop['rollup']['array'] as $rollupItem) {
            if (isset($rollupItem['number'])) return $rollupItem['number'];
            if (isset($rollupItem['formula']['number'])) return $rollupItem['formula']['number'];
        }
    }
    return $prop['formula']['number'] ?? $prop['number'] ?? $prop['rollup']['number'] ?? 0;
}

function extractRelationIds($prop) {
    if (!$prop || $prop['type'] !== 'relation') return [];
    $ids = [];
    foreach ($prop['relation'] as $r) {
        if (isset($r['id'])) {
            $ids[] = $r['id'];
        }
    }
    return $ids;
}

function extractFile($prop) {
    if (!isset($prop['files'][0])) return null;
    $file = $prop['files'][0];
    return [
        'name' => $file['name'],
        'url' => $file['file']['url'] ?? $file['external']['url'] ?? null
    ];
}

function extractRollupTitle($prop) {
    return $prop['rollup']['array'][0]['title'][0]['plain_text'] ?? null;
}

function extractMultiSelect($prop, $asObject = false) {
    // Rollup support
    if (isset($prop['type']) && $prop['type'] === 'rollup' && isset($prop['rollup']['array'])) {
        $items = [];
        foreach ($prop['rollup']['array'] as $rollupItem) {
            if (isset($rollupItem['multi_select'])) {
                foreach ($rollupItem['multi_select'] as $ms) $items[] = $ms;
            } else if (isset($rollupItem['select'])) {
                $items[] = $rollupItem['select'];
            }
        }
        return array_map(function($m) use ($asObject) {
            return $asObject ? ['name' => $m['name'], 'color' => $m['color']] : $m['name'];
        }, $items);
    }

    if (!isset($prop['multi_select'])) return [];
    return array_map(function($m) use ($asObject) {
        return $asObject ? ['name' => $m['name'], 'color' => $m['color']] : $m['name'];
    }, $prop['multi_select']);
}

function extractRemainingProperties($props) {
    $mainKeys = [
        'Nombre del proyecto', 'Estado', 'Fase', 'Progreso', 'Cliente', 
        'Total Ofertado', 'Total Facturado', 'Pendiente Facturar', '% Facturado',
        'Hoja Proyecto', 'Oferta', 'Código oferta', 'Vínculo Ofertas',
        // System/Internal fields
        'Tareas', 'Interacciones', 'Interacción', 'Control de horas', 'Entregas'
    ];
    
    $blacklist = [
        'Responsable', 'Periodo', 'Resumen', 'Coste interno', 'Historial técnico', 'Margen',
        'Proyecto', 'Project', 'Nombre de la tarea', 'Task name', '↗ Proyecto'
    ];
    
    $additional = [];
    foreach ($props as $key => $prop) {
        if (!in_array($key, $mainKeys) && !in_array($key, $blacklist)) {
            $value = null;
            switch ($prop['type']) {
                case 'rich_text': $value = $prop['rich_text'][0]['plain_text'] ?? null; break;
                case 'title': $value = $prop['title'][0]['plain_text'] ?? null; break;
                case 'number': $value = $prop['number']; break;
                case 'select': $value = $prop['select']['name'] ?? null; break;
                case 'multi_select': $value = extractMultiSelect($prop); break;
                case 'date': $value = $prop['date']['start'] ?? null; break;
                case 'email': $value = $prop['email']; break;
                case 'phone_number': $value = $prop['phone_number']; break;
                case 'url': $value = $prop['url']; break;
                case 'formula': 
                    $f = $prop['formula'];
                    $value = $f['string'] ?? $f['number'] ?? $f['boolean'] ?? $f['date']['start'] ?? null;
                    break;
                case 'relation':
                    // Extract the IDs of the related pages
                    $value = array_column($prop['relation'] ?? [], 'id');
                    break;
                case 'rollup':
                    $r = $prop['rollup'];
                    $type = $r['type'];
                    if ($type === 'number') $value = $r['number'];
                    elseif ($type === 'date') $value = $r['date']['start'] ?? null;
                    elseif ($type === 'array') {
                        // Extract meaningsful values from rollup array
                        $items = [];
                        foreach ($r['array'] as $item) {
                            $it = $item['type'] ?? null;
                            if ($it === 'title') $items[] = $item['title'][0]['plain_text'] ?? '';
                            elseif ($it === 'rich_text') $items[] = $item['rich_text'][0]['plain_text'] ?? '';
                            elseif ($it === 'number') $items[] = $item['number'] ?? '';
                            elseif ($it === 'select') $items[] = $item['select']['name'] ?? '';
                            elseif ($it === 'multi_select') {
                                foreach (($item['multi_select'] ?? []) as $ms) $items[] = $ms['name'];
                            }
                            elseif ($it === 'date') $items[] = $item['date']['start'] ?? '';
                            elseif ($it === 'formula') {
                                $f = $item['formula'];
                                $items[] = $f['string'] ?? $f['number'] ?? $f['boolean'] ?? $f['date']['start'] ?? '';
                            }
                            elseif ($it === 'relation') {
                                foreach (($item['relation'] ?? []) as $rel) $items[] = $rel['id'];
                            }
                        }
                        // Flatten and remove duplicates
                        $value = !empty($items) ? array_unique(array_filter($items)) : null;
                    }
                    break;
            }
            
            if ($value !== null) {
                $additional[] = [
                    'label' => $key,
                    'value' => $value,
                    'type' => $prop['type']
                ];
            }
        }
    }
    return $additional;
}

/**
 * Fetch extended detail for a specific Notion Page (Project)
 * Including related tasks and interactions
 */
function fetchNotionPageDetail($pageId) {
    $apiKey = NOTION_API_KEY;
    $url = "https://api.notion.com/v1/pages/{$pageId}";

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer {$apiKey}",
        "Notion-Version: 2022-06-28"
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    if ($httpCode !== 200) {
        return ['error' => "Error fetching page detail ($httpCode)"];
    }

    $data = json_decode($response, true);
    $properties = $data['properties'] ?? [];

    // Fetch main page blocks to find child pages or direct content
    $blocks = fetchBlocks($pageId);
    
    $pageContent = [];
    $interactionsContent = [];
    $deliveriesContent = [];
    $contactsDatabaseId = null;

    foreach ($blocks as $block) {
        $type = $block['type'];
        
        if ($type === 'child_page') {
            $title = $block[$type]['title'] ?? '';
            if ($title === 'Interacciones' || $title === 'Interacción') {
                $interactionsContent = fetchPageContentRecursive($block['id']);
            } elseif ($title === 'Entregas' || $title === 'Entrega') {
                $deliveriesContent = fetchPageContentRecursive($block['id']);
            } else {
                $pageContent[] = ['type' => $type, 'text' => $title];
            }
        } elseif ($type === 'child_database') {
            $title = $block[$type]['title'] ?? '';
            if ($title === 'Contactos Proyecto' || $title === 'Contactos') {
                $contactsDatabaseId = $block['id'];
            }
        } elseif (isset($block[$type]['rich_text'])) {
            $text = "";
            foreach ($block[$type]['rich_text'] as $rt) {
                $text .= $rt['plain_text'];
            }
            if ($text || $type === 'divider') {
                $pageContent[] = [
                    'type' => $type,
                    'text' => $text
                ];
            }
        }
    }

    // Fetch related Tareas
    $relatedTasks = [];
    if (isset($properties['Tareas']['relation'])) {
        foreach ($properties['Tareas']['relation'] as $rel) {
            if (count($relatedTasks) >= 10) break;
            $taskDetail = fetchSimplePageDetail($rel['id']);
            if ($taskDetail) $relatedTasks[] = $taskDetail;
        }
    }

    // Fetch related Interacciones (backwards compatibility for page properties)
    $relatedInteractions = [];
    $intRels = $properties['Interacciones']['relation'] ?? $properties['Interacción']['relation'] ?? $properties['Control de horas']['relation'] ?? [];
    foreach ($intRels as $rel) {
        if (count($relatedInteractions) >= 10) break;
        $intDetail = fetchSimplePageDetail($rel['id']);
        if ($intDetail) $relatedInteractions[] = $intDetail;
    }

    // Fetch Project Contacts (Priority 1: Child Database found in blocks)
    $projectContacts = [];
    
    if ($contactsDatabaseId) {
        $contactPages = queryDatabase($contactsDatabaseId);
        if (!isset($contactPages['error'])) {
            foreach ($contactPages as $page) {
                $projectContacts[] = transformContact($page);
            }
        }
    }

    // Fallback/Priority 2: Global Database (12e95a89...) filtered by current Project
    if (empty($projectContacts)) {
        $globalContactsDbId = '12e95a89fc5547fb82ff33fc904eb78a';
        $filter = [
            'property' => 'Proyectos', 
            'relation' => ['contains' => $pageId]
        ];
        $contactPages = queryDatabase($globalContactsDbId, $filter);
        if (!isset($contactPages['error'])) {
            foreach ($contactPages as $page) {
                $projectContacts[] = transformContact($page);
            }
        }
    }

    // Fallback/Priority 2: Relation property (Existing logic)
    if (empty($projectContacts)) {
        $contactRels = $properties['Contactos Proyecto']['relation'] ?? $properties['Contactos']['relation'] ?? [];
        foreach ($contactRels as $rel) {
            if (count($projectContacts) >= 15) break;
            $contactDetail = fetchSimplePageDetail($rel['id']);
            if ($contactDetail) {
                $cProps = $contactDetail['properties'];
                $projectContacts[] = [
                    'id' => $contactDetail['id'],
                    'name' => extractText($cProps['Contacto'] ?? $cProps['Nombre'] ?? null) ?: 'Sin nombre',
                    'phone' => $cProps['Teléfono']['phone_number'] ?? null,
                    'email' => $cProps['mail']['email'] ?? $cProps['Email']['email'] ?? null,
                    'role' => extractStatus($cProps['Rol'] ?? null),
                    'notes' => extractText($cProps['Notas'] ?? null)
                ];
            }
        }
    }
    return [
        'id' => $pageId,
        'last_edited_time' => $data['last_edited_time'] ?? null,
        'project' => transformProject($properties),
        'page_content' => $pageContent,
        'interactions_content' => $interactionsContent,
        'deliveries_content' => $deliveriesContent,
        'related_tasks' => $relatedTasks,
        'related_interactions' => $relatedInteractions,
        'project_contacts' => $projectContacts
    ];
}

/**
 * Fetch basic properties for any Notion Page with Timeout
 */
function fetchSimplePageDetail($pageId) {
    if (!$pageId) return null;
    $apiKey = NOTION_API_KEY;
    $url = "https://api.notion.com/v1/pages/{$pageId}";

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer {$apiKey}",
        "Notion-Version: 2022-06-28",
        "Content-Type: application/json",
        "User-Agent: PHP-Dashboard/1.0",
        "Cache-Control: no-cache",
        "Pragma: no-cache"
    ]);

    $response = curl_exec($ch);
    if (curl_errno($ch)) {
        $error = curl_error($ch);
        return ['error' => "cURL: $error"];
    }
    
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    $data = json_decode($response, true);
    if ($httpCode >= 400) {
        return ['error' => "Notion API $httpCode: " . ($data['message'] ?? 'Unknown error')];
    }
    
    return $data;
}

/**
 * Query a Notion Database
 */
function queryDatabase($databaseId, $filter = null) {
    $apiKey = NOTION_API_KEY;
    $url = "https://api.notion.com/v1/databases/{$databaseId}/query";

    $payload = [];
    if ($filter) $payload['filter'] = $filter;

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload, JSON_FORCE_OBJECT));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer {$apiKey}",
        "Notion-Version: 2022-06-28",
        "Content-Type: application/json"
    ]);

    $response = curl_exec($ch);

    $json = json_decode($response, true);
    if (isset($json['object']) && $json['object'] === 'error') {
        return ['error' => $json['message'] ?? 'Unknown Notion Error'];
    }
    return $json['results'] ?? [];
}

/**
 * Fetch blocks (children) for a specific Notion Page/Block
 */
function fetchBlocks($parentId) {
    $apiKey = NOTION_API_KEY;
    $url = "https://api.notion.com/v1/blocks/{$parentId}/children?page_size=100";

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer {$apiKey}",
        "Notion-Version: 2022-06-28",
        "Content-Type: application/json"
    ]);

    $response = curl_exec($ch);

    $json = json_decode($response, true);
    return $json['results'] ?? [];
}

/**
 * Fetch content recursively (useful for child pages)
 */
function fetchPageContentRecursive($pageId) {
    $blocks = fetchBlocks($pageId);
    $content = [];

    foreach ($blocks as $block) {
        $type = $block['type'];
        
        if ($type === 'child_page') {
            $subContent = fetchPageContentRecursive($block['id']);
            foreach ($subContent as $sc) {
                $content[] = $sc;
            }
            continue;
        }

        if (isset($block[$type]['rich_text'])) {
            $text = "";
            foreach ($block[$type]['rich_text'] as $rt) {
                $text .= $rt['plain_text'];
            }
            if ($text || $type === 'divider') {
                $content[] = [
                    'id' => $block['id'],
                    'type' => $type,
                    'text' => $text
                ];
            }
        }
    }
    return $content;
}

/**
 * Legacy wrapper
 */
function fetchPageContent($pageId) {
    return fetchPageContentRecursive($pageId);
}

/**
 * Fetch unique client names currently present in the database rows
 */
function fetchNotionClientOptions($databaseId) {
    $apiKey = NOTION_API_KEY;
    $url = "https://api.notion.com/v1/databases/{$databaseId}/query";

    $payload = ['page_size' => 100];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload, JSON_FORCE_OBJECT));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer {$apiKey}",
        "Notion-Version: 2022-06-28",
        "Content-Type: application/json"
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    if ($httpCode !== 200) return [];

    $data = json_decode($response, true);
    $uniqueClients = [];

    if (isset($data['results'])) {
        foreach ($data['results'] as $page) {
            $props = $page['properties'];
            if (isset($props['Cliente']['multi_select'])) {
                foreach ($props['Cliente']['multi_select'] as $client) {
                    $name = $client['name'];
                    if (!isset($uniqueClients[$name])) {
                        $uniqueClients[$name] = [
                            'id' => $name,
                            'name' => $name,
                            'color' => $client['color'] ?? 'default'
                        ];
                    }
                }
            }
        }
    }

    ksort($uniqueClients);
    return array_values($uniqueClients);
}

/**
 * Search Notion for ANY item matching the client name.
 * This is a fallback to catch edits in related pages (Interactions) 
 * that don't update the parent project's last_edited_time.
 */
function searchRecentNotionEdits() {
    $apiKey = NOTION_API_KEY;
    $url = "https://api.notion.com/v1/search";
    
    $payload = [
        'sort' => [
            'direction' => 'descending',
            'timestamp' => 'last_edited_time'
        ],
        'page_size' => 25
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer {$apiKey}",
        "Notion-Version: 2022-06-28",
        "Content-Type: application/json",
        "Cache-Control: no-cache",
        "Pragma: no-cache"
    ]);

    $response = curl_exec($ch);
    $data = json_decode($response, true);
    
    return $data['results'] ?? [];
}
?>
