<?php
// notion_helper.php - Integrated Notion API Handler

require_once __DIR__ . '/../../config/secrets.php';

/**
 * Fetch projects from a Notion Database filtered by Client ID
 */
function fetchNotionProjects($databaseId, $clientId) {
    $apiKey = NOTION_API_KEY;
    
    // Notion API Endpoint for querying a database
    $url = "https://api.notion.com/v1/databases/{$databaseId}/query";

    // Filtering logic: Updated to multi_select to match your Notion column type
    $filterData = [
        'filter' => [
            'property' => 'Cliente', 
            'multi_select' => [
                'contains' => $clientId
            ]
        ]
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($filterData, JSON_FORCE_OBJECT));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer {$apiKey}",
        "Notion-Version: 2022-06-28",
        "Content-Type: application/json"
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
            $transformed = transformProject($props);
            
            $projects[] = array_merge([
                'id' => $page['id']
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
function transformProject($props) {
    return [
        'identification' => [
            'name' => extractText($props['Nombre del proyecto'] ?? null) ?: 'Sin nombre',
        ],
        'status' => [
            'main' => extractStatus($props['Estado'] ?? null) ?: ['name' => 'Sin estado', 'color' => 'default'],
            'phase' => extractStatus($props['Fase'] ?? null) ?: ['name' => 'Sin Fase', 'color' => 'default'],
            'progress' => extractNumber($props['Progreso'] ?? null, 100),
        ],
        'client' => [
            'details' => extractMultiSelect($props['Cliente'] ?? null, true)[0] ?? ['name' => 'Sin Cliente', 'color' => 'default'],
        ],
        'financials' => [
            'totalOffered' => extractFinancial($props['Total Ofertado'] ?? null),
            'totalBilled' => extractFinancial($props['Total Facturado'] ?? null),
            'totalPending' => extractFinancial($props['Pendiente Facturar'] ?? null),
            'billingPercentage' => extractNumber($props['% Facturado'] ?? null, 100),
        ],
        'assets' => [
            'projectSheet' => extractFile($props['Hoja Proyecto'] ?? null),
            'offerFile' => extractFile($props['Oferta'] ?? null),
            'offerCode' => extractRollupTitle($props['Código oferta'] ?? null),
            'offerLink' => extractRollupTitle($props['Vínculo Ofertas'] ?? null),
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
        static $titleCache = [];
        $id = $rels[0]['id'];
        if (isset($titleCache[$id])) return $titleCache[$id];
        
        $detail = fetchSimplePageDetail($id);
        if ($detail && isset($detail['properties'])) {
            foreach ($detail['properties'] as $p) {
                if (($p['type'] ?? '') === 'title') {
                    $title = $p['title'][0]['plain_text'] ?? 'Sin título';
                    $titleCache[$id] = $title;
                    return $title;
                }
            }
        }
        return 'Relación: ' . substr($id, 0, 8);
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

function transformContact($page, &$debug = null) {
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
    if (!isset($prop['status']) && !isset($prop['select'])) return null;
    $data = $prop['status'] ?? $prop['select'];
    return [
        'name' => $data['name'],
        'color' => $data['color'] ?? 'default'
    ];
}

function extractNumber($prop, $multiplier = 1) {
    $val = $prop['number'] ?? $prop['formula']['number'] ?? $prop['rollup']['number'] ?? 0;
    return round($val * $multiplier, 2);
}

function extractFinancial($prop) {
    return $prop['formula']['number'] ?? $prop['number'] ?? 0;
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
    
    $blacklist = ['Responsable', 'Periodo', 'Resumen', 'Coste interno', 'Historial técnico', 'Margen'];
    
    $additional = [];
    foreach ($props as $key => $prop) {
        if (!in_array($key, $mainKeys) && !in_array($key, $blacklist)) {
            $value = null;
            switch ($prop['type']) {
                case 'rich_text': $value = $prop['rich_text'][0]['plain_text'] ?? null; break;
                case 'number': $value = $prop['number']; break;
                case 'select': $value = $prop['select']['name'] ?? null; break;
                case 'multi_select': $value = extractMultiSelect($prop); break;
                case 'date': $value = $prop['date']['start'] ?? null; break;
                case 'email': $value = $prop['email']; break;
                case 'phone_number': $value = $prop['phone_number']; break;
                case 'url': $value = $prop['url']; break;
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
    $debugLog = [];
    
    if ($contactsDatabaseId) {
        $contactPages = queryDatabase($contactsDatabaseId);
        if (isset($contactPages['error'])) {
            $debugLog[] = "Child DB query error: " . $contactPages['error'];
            $contactPages = [];
        }
        if (!empty($contactPages)) {
            $debugLog[] = "Contact Keys: " . implode(', ', array_keys($contactPages[0]['properties']));
        }
        foreach ($contactPages as $page) {
            $projectContacts[] = transformContact($page, $debugLog);
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
        if (isset($contactPages['error'])) {
            $debugLog[] = "Global DB query error: " . $contactPages['error'];
            $contactPages = [];
        }
        foreach ($contactPages as $page) {
            $projectContacts[] = transformContact($page, $debugLog);
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
        'project' => transformProject($properties),
        'page_content' => $pageContent,
        'interactions_content' => $interactionsContent,
        'deliveries_content' => $deliveriesContent,
        'related_tasks' => $relatedTasks,
        'related_interactions' => $relatedInteractions,
        'project_contacts' => $projectContacts,
        'debug_contacts' => $debugLog
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
        "User-Agent: PHP-Dashboard/1.0"
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
?>
