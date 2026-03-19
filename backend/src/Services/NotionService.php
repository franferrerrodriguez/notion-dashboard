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
    curl_close($ch);

    if ($httpCode !== 200) {
        $_SESSION['last_notion_error'] = "Notion API Error ($httpCode): " . $response;
        return [];
    }

    $data = json_decode($response, true);
    $projects = [];

    if (isset($data['results'])) {
        foreach ($data['results'] as $page) {
            $props = $page['properties'];
            
            // Extraction based on the JSON provided by the user
            $name = $props['Nombre del proyecto']['title'][0]['plain_text'] ?? 'Sin nombre';
            
            $fase = $props['Fase']['status']['name'] ?? 'Varios';
            
            // Progress is a rollup (number 0 to 1, we want 0-100)
            $progress = 0;
            if (isset($props['Progreso']['rollup']['number'])) {
                $progress = round($props['Progreso']['rollup']['number'] * 100, 2);
            }

            // % Facturado is a formula (number 0 to 1)
            $facturado = 0;
            if (isset($props['% Facturado']['formula']['number'])) {
                $facturado = round($props['% Facturado']['formula']['number'] * 100, 2);
            }

            $projects[] = [
                'id' => $page['id'],
                'name' => $name,
                'phase' => $fase,
                'progress' => $progress,
                'billedAmount' => $facturado,
                'raw_properties' => $props
            ];
        }
    }

    return $projects;
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
    curl_close($ch);

    if ($httpCode !== 200) {
        return ['error' => "Error fetching page detail ($httpCode)"];
    }

    $data = json_decode($response, true);
    $properties = $data['properties'] ?? [];

    // Fetch main page content (Blocks)
    $pageContent = fetchPageContent($pageId, 50);

    // Fetch related Tareas (Limit to 10 to avoid timeout)
    $relatedTasks = [];
    if (isset($properties['Tareas']['relation'])) {
        $count = 0;
        foreach ($properties['Tareas']['relation'] as $rel) {
            if ($count >= 10) break;
            $taskDetail = fetchSimplePageDetail($rel['id']);
            if ($taskDetail) {
                $relatedTasks[] = $taskDetail;
                $count++;
            }
        }
    }

    // Fetch related Interacciones (Try different common names)
    $relatedInteractions = [];
    $intRels = $properties['Interacciones']['relation'] ?? $properties['Interacción']['relation'] ?? $properties['Control de horas']['relation'] ?? [];
    
    if (!empty($intRels)) {
        $count = 0;
        foreach ($intRels as $rel) {
            if ($count >= 10) break;
            $intDetail = fetchSimplePageDetail($rel['id']);
            if ($intDetail) {
                // If it was from 'Control de horas' and doesn't have an 'Asunto' but has a 'Nombre', use that
                $relatedInteractions[] = $intDetail;
                $count++;
            }
        }
    }

    return [
        'id' => $pageId,
        'raw_properties' => $properties,
        'page_content' => $pageContent,
        'related_tasks' => $relatedTasks,
        'related_interactions' => $relatedInteractions
    ];
}

/**
 * Fetch basic properties for any Notion Page with Timeout
 */
function fetchSimplePageDetail($pageId) {
    $apiKey = NOTION_API_KEY;
    $url = "https://api.notion.com/v1/pages/{$pageId}";

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5); // 5 sec max per page
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer {$apiKey}",
        "Notion-Version: 2022-06-28"
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) return null;

    $json = json_decode($response, true);
    $result = [
        'id' => $json['id'] ?? null,
        'properties' => $json['properties'] ?? []
    ];

    // If it's an interaction or has content to show, fetch blocks
    // We'll check if it has a 'Tipo' or 'Asunto' property to guess if it's an interaction
    if (isset($json['properties']['Asunto']) || isset($json['properties']['Tipo'])) {
        $result['content'] = fetchPageContent($pageId);
    }

    return $result;
}

/**
 * Fetch blocks (content) for a specific Notion Page
 */
function fetchPageContent($pageId) {
    $apiKey = NOTION_API_KEY;
    $url = "https://api.notion.com/v1/blocks/{$pageId}/children?page_size=20";

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer {$apiKey}",
        "Notion-Version: 2022-06-28"
    ]);

    $response = curl_exec($ch);
    curl_close($ch);

    $json = json_decode($response, true);
    $content = [];

    if (isset($json['results'])) {
        foreach ($json['results'] as $block) {
            $type = $block['type'];
            
            // If it's a child page named 'Interacciones', fetch its content too!
            if ($type === 'child_page' && ($block['child_page']['title'] === 'Interacciones' || $block['child_page']['title'] === 'Interacción')) {
                $subContent = fetchPageContent($block['id'], 50);
                foreach ($subContent as $sc) {
                    $content[] = $sc;
                }
                continue;
            }

            // Capture text from various block types
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
    }

    return $content;
}
/**
 * Fetch available options for the "Cliente" property from the Database Schema
 */
/**
 * Fetch unique client names currently present in the database rows
 */
function fetchNotionClientOptions($databaseId) {
    $apiKey = NOTION_API_KEY;
    $url = "https://api.notion.com/v1/databases/{$databaseId}/query";

    // We don't need all properties, but Notion returns them all in query
    $payload = [
        'page_size' => 100 // Adjust if you have thousands of projects
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer {$apiKey}",
        "Notion-Version: 2022-06-28",
        "Content-Type: application/json"
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        return [];
    }

    $data = json_decode($response, true);
    $uniqueClients = [];

    if (isset($data['results'])) {
        foreach ($data['results'] as $page) {
            $props = $page['properties'];
            
            // Check 'Cliente' (multi_select expected based on earlier logic)
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

    // Sort alphabetically
    ksort($uniqueClients);

    return array_values($uniqueClients);
}
?>
