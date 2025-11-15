# Skill : Architecture Multi-Agents avec Claude SDK

## Description

Ce skill vous permet de maîtriser la création de systèmes multi-agents avec Claude Agent SDK pour TypeScript. Vous apprendrez à construire des agents spécialisés qui communiquent entre eux via un orchestrateur, suivant les meilleures pratiques d'Anthropic.

## Quand utiliser ce skill

- Vous voulez créer des workflows IA complexes avec plusieurs agents spécialisés
- Vous avez besoin d'agents qui collaborent pour accomplir une tâche
- Vous voulez structurer votre projet selon les standards Claude SDK
- Vous préparez une architecture pour intégration backend (Convex, etc.)

## Concepts Fondamentaux

### 1. Architecture Multi-Agents

```
TypeScript Orchestrator
    ↓
Blog Orchestrator Agent (.claude/agents/blog-orchestrator.md)
    ↓
    ├─→ Writer Agent (.claude/agents/writer.md)
    │   └─→ article-draft.md
    └─→ Formatter Agent (.claude/agents/formatter.md)
        └─→ article.html
```

**Principes clés :**
- **Spécialisation** : Chaque agent a un rôle unique et précis
- **Modularité** : Agents dans des fichiers séparés, faciles à maintenir
- **Orchestration** : Un agent coordonne les autres via l'outil `Task`
- **Communication indirecte** : Via fichiers et délégation (pas de communication directe)

### 2. Structure de Projet Standard

```
votre-projet/
├── .claude/
│   ├── agents/              # Définitions d'agents (*.md)
│   │   ├── orchestrator.md  # Agent principal coordinateur
│   │   ├── writer.md        # Agent spécialisé 1
│   │   └── formatter.md     # Agent spécialisé 2
│   └── skills/              # Documentation skills
│       └── multi-agent-sdk.md
├── package.json
├── votre-script.ts          # Point d'entrée TypeScript
└── README.md
```

## Installation

### 1. Installer les dépendances

```bash
npm install @anthropic-ai/claude-agent-sdk
npm install -D tsx typescript
```

### 2. Configuration package.json

```json
{
  "name": "votre-projet",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "tsx votre-script.ts",
    "dev": "tsx votre-script.ts"
  },
  "dependencies": {
    "@anthropic-ai/claude-agent-sdk": "^0.1.0"
  },
  "devDependencies": {
    "tsx": "^4.7.0",
    "typescript": "^5.3.0"
  }
}
```

### 3. Configurer la clé API

**Windows (PowerShell):**
```powershell
$env:ANTHROPIC_API_KEY="sk-ant-..."
```

**Mac/Linux:**
```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

## Deux Approches pour Définir les Agents

Le Claude Agent SDK offre **deux méthodes** pour définir vos agents :

### 1. Approche Programmatique (Recommandée pour SDK)

Définissez les agents directement dans votre code TypeScript via le paramètre `agents` :

```typescript
import { query } from '@anthropic-ai/claude-agent-sdk';

const result = query({
  prompt: "Review the authentication module for security issues",
  options: {
    agents: {
      'code-reviewer': {
        description: 'Expert code review specialist. Use for quality, security, and maintainability reviews.',
        prompt: `You are a code review specialist with expertise in security, performance, and best practices.

When reviewing code:
- Identify security vulnerabilities
- Check for performance issues
- Verify adherence to coding standards
- Suggest specific improvements

Be thorough but concise in your feedback.`,
        tools: ['Read', 'Grep', 'Glob'],
        model: 'sonnet'
      },
      'test-runner': {
        description: 'Runs and analyzes test suites. Use for test execution and coverage analysis.',
        prompt: `You are a test execution specialist. Run tests and provide clear analysis of results.`,
        tools: ['Bash', 'Read', 'Grep'],
      }
    }
  }
});

for await (const message of result) {
  console.log(message);
}
```

**Configuration AgentDefinition :**

| Champ         | Type                                         | Requis | Description                                                      |
| :------------ | :------------------------------------------- | :----- | :--------------------------------------------------------------- |
| `description` | `string`                                     | Oui    | Description en langage naturel de quand utiliser cet agent       |
| `prompt`      | `string`                                     | Oui    | Le system prompt de l'agent définissant son rôle                 |
| `tools`       | `string[]`                                   | Non    | Liste des outils autorisés. Si omis, hérite tous les outils     |
| `model`       | `'sonnet' \| 'opus' \| 'haiku' \| 'inherit'` | Non    | Modèle spécifique. Si omis, utilise le modèle principal         |

**Avantages de l'approche programmatique :**
- ✅ Intégration directe dans votre code
- ✅ Agents configurables dynamiquement
- ✅ Pas de dépendance au système de fichiers
- ✅ Parfait pour les applications SDK
- ✅ Configuration versionnée avec votre code
- ✅ Agents prioritaires sur les fichiers filesystem

### 2. Approche Filesystem (Alternative)

Créez des fichiers markdown dans `.claude/agents/`. Voici le template :

```markdown
# Nom de l'Agent

Description courte du rôle de l'agent.

## Description
Utilise cet agent quand [contexte d'utilisation]...

## Rôle

Tu es un [expert/spécialiste] en [domaine].

### Responsabilités principales :
- Responsabilité 1
- Responsabilité 2
- Responsabilité 3

### Format de sortie attendu :
[Décrire exactement ce que l'agent doit produire]

### Outils disponibles :
- `Read` : Pour lire des fichiers
- `Write` : Pour créer/modifier des fichiers
- `Task` : Pour déléguer à d'autres agents (orchestrateur uniquement)
- `Bash` : Pour exécuter des commandes shell

### Consignes importantes :
1. [Consigne 1]
2. [Consigne 2]
3. [Consigne 3]

### Modèle
Haiku (ou Sonnet selon les besoins)
```

### Exemple Concret : Agent Writer

```markdown
# Writer Agent

Expert en rédaction d'articles de blog engageants et informatifs.

## Description
Utilise cet agent quand tu as besoin de rédiger un article de blog professionnel sur un sujet donné.

## Rôle

Tu es un rédacteur expert spécialisé dans les articles de blog de qualité.

### Responsabilités principales :
- Rédiger des articles structurés et engageants
- Respecter une longueur cible (500-700 mots)
- Créer un contenu informatif et pertinent
- Sauvegarder l'article au format markdown

### Format de sortie attendu :

Un fichier markdown avec la structure suivante :
```
# Titre principal accrocheur

## Introduction
Paragraphe introductif captivant...

## Section 1 : [Titre descriptif]
Contenu de la section...

## Section 2 : [Titre descriptif]
Contenu de la section...

## Conclusion
Résumé et ouverture...
```

### Fichier de sortie :
**Nom** : `article-draft.md`
**Emplacement** : Racine du projet

### Outils disponibles :
- `Read` : Lire des fichiers de référence si nécessaire
- `Write` : Écrire l'article final

### Consignes importantes :
1. Commence TOUJOURS par un titre H1 accrocheur
2. Structure en sections claires (H2)
3. Longueur : 500-700 mots minimum
4. Utilise des exemples concrets
5. Termine par une conclusion inspirante
6. Sauvegarde dans `article-draft.md` à la racine

### Modèle
Haiku (rapide et efficace pour la rédaction)
```

### Exemple Concret : Agent Orchestrateur

```markdown
# Blog Orchestrator Agent

Agent orchestrateur intelligent qui coordonne les agents Writer et Formatter.

## Description
Utilise cet agent quand tu veux créer un article de blog complet de A à Z.

## Rôle

Tu es un chef de projet expert en création de contenu qui coordonne une équipe d'agents spécialisés.

### Ton workflow de travail :

**Phase 1 : Planification**
- Analyser le sujet demandé
- Identifier les étapes nécessaires
- Planifier la délégation aux agents appropriés

**Phase 2 : Rédaction (Délégation à Writer)**
- Utiliser l'outil `Task` pour lancer l'agent **writer**
- Lui donner des instructions claires sur le sujet et les attentes
- Attendre que l'agent writer termine et crée le fichier `article-draft.md`
- Vérifier que le fichier a bien été créé

**Phase 3 : Mise en page (Délégation à Formatter)**
- Une fois l'article rédigé, utiliser l'outil `Task` pour lancer l'agent **formatter**
- Lui demander de transformer `article-draft.md` en `article.html`
- Attendre que l'agent formatter termine
- Vérifier que le fichier HTML a bien été créé

**Phase 4 : Validation et rapport**
- Vérifier que les deux fichiers existent
- Lire rapidement les fichiers pour confirmer la qualité
- Fournir un résumé du travail accompli

### Instructions importantes :

1. **Délégation via Task** :
   ```
   Utilise l'outil Task avec subagent_type="writer" pour la rédaction
   Utilise l'outil Task avec subagent_type="formatter" pour la mise en page
   ```

2. **Communication claire** :
   - Donne des instructions précises aux sous-agents
   - Spécifie les noms de fichiers attendus
   - Indique les critères de qualité

3. **Gestion du workflow** :
   - Exécute les étapes dans l'ordre : writer → formatter
   - Ne lance pas formatter avant que writer ait terminé
   - Vérifie les fichiers entre chaque étape

4. **Gestion des erreurs** :
   - Si un agent échoue, diagnostique le problème
   - Relance l'agent avec des instructions ajustées si nécessaire
   - Rapporte clairement les problèmes rencontrés

### Format de délégation aux agents :

**Pour l'agent Writer :**
```
description: "Rédiger l'article de blog"
prompt: "Rédige un article de blog complet sur [SUJET].
- Longueur: 500-700 mots
- Structure: Introduction, 2-3 sections, Conclusion
- Enregistre dans 'article-draft.md'"
subagent_type: "writer"
```

**Pour l'agent Formatter :**
```
description: "Mettre en page l'article en HTML"
prompt: "Transforme le fichier 'article-draft.md' en page HTML élégante.
- Design moderne et responsive
- Enregistre dans 'article.html'"
subagent_type: "formatter"
```

### Outils disponibles :
- `Task` : Pour déléguer aux agents writer et formatter
- `Read` : Pour vérifier les fichiers créés
- `Write` : Si tu as besoin de créer des fichiers de coordination

### Modèle
Haiku (rapide pour coordonner les autres agents)
```

## Code TypeScript : Point d'Entrée

### Pattern Essentiel

```typescript
import { query } from '@anthropic-ai/claude-agent-sdk';

async function executeWorkflow(userInput: string) {
  console.log(`🚀 Démarrage du workflow : "${userInput}"\n`);

  try {
    // Lance l'agent orchestrateur qui va coordonner tout le workflow
    const orchestratorQuery = query({
      prompt: `Tu es l'agent orchestrateur. Ton objectif : ${userInput}

Ton workflow :
1. Délègue à l'agent "agent1" pour [tâche 1]
2. Une fois terminé, délègue à l'agent "agent2" pour [tâche 2]
3. Rapporte le résultat final

Lance les agents dans l'ordre et coordonne leur travail.`,
      options: {
        // CRITIQUE : Charge les agents depuis .claude/agents/
        settingSources: ['project'],

        // Mode de permission pour éditer les fichiers
        permissionMode: 'acceptEdits',

        // Outils disponibles pour l'orchestrateur
        // Task permet de déléguer aux sous-agents
        allowedTools: ['Task', 'Read', 'Write'],

        // Utilise le preset Claude Code pour le comportement standard
        systemPrompt: {
          type: 'preset',
          preset: 'claude_code'
        }
      }
    });

    // Stream des messages de l'orchestrateur et des sous-agents
    for await (const message of orchestratorQuery) {
      // Afficher les messages de l'orchestrateur
      if (message.type === 'assistant' && message.message.content) {
        for (const content of message.message.content) {
          if (content.type === 'text') {
            console.log('🤖', content.text);
          } else if (content.type === 'tool_use') {
            console.log(`\n🔧 Outil utilisé : ${content.name}`);
            if (content.name === 'Task') {
              console.log(`   └─ Délégation à un sous-agent...`);
            }
          }
        }
      }

      // Afficher les résultats des outils
      if (message.type === 'user' && message.message.content) {
        for (const content of message.message.content) {
          if (content.type === 'tool_result' && content.content) {
            const resultText = typeof content.content === 'string'
              ? content.content
              : JSON.stringify(content.content);
            console.log(`\n📄 Résultat : ${resultText.substring(0, 200)}...`);
          }
        }
      }

      // Résultat final
      if (message.type === 'result') {
        console.log('\n✅ Workflow terminé avec succès\n');
        console.log('📊 Métriques :');
        console.log(`   💰 Coût total : $${message.total_cost_usd.toFixed(4)}`);
        console.log(`   📥 Input tokens : ${message.usage.input_tokens.toLocaleString()}`);
        console.log(`   📤 Output tokens : ${message.usage.output_tokens.toLocaleString()}`);
        console.log(`   ⏱️  Durée : ${(message.duration_ms / 1000).toFixed(2)}s\n`);
      }
    }

  } catch (error) {
    console.error('\n❌ Erreur:', error);
    throw error;
  }
}

// Configuration et exécution
const input = process.argv[2] || "Valeur par défaut";
executeWorkflow(input).catch(console.error);
```

### Options Complètes de `query()`

Référence complète des options disponibles pour configurer votre agent :

```typescript
import { query } from '@anthropic-ai/claude-agent-sdk';

const result = query({
  prompt: "Your task here",
  options: {
    // ============================================
    // AGENTS & SUBAGENTS
    // ============================================

    // Définition programmatique des agents (RECOMMANDÉ)
    agents: {
      'agent-name': {
        description: 'When to use this agent',
        prompt: 'Agent system prompt',
        tools: ['Read', 'Write'],
        model: 'sonnet'
      }
    },

    // Sources de configuration filesystem (optionnel)
    // Par défaut : [] (aucun chargement)
    // Pour charger .claude/agents/*.md : ['project']
    // Pour CLAUDE.md : doit inclure 'project'
    settingSources: ['user', 'project', 'local'],

    // ============================================
    // PERMISSIONS
    // ============================================

    // Mode de permission
    permissionMode: 'acceptEdits',  // 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan'

    // Fonction de permission personnalisée
    canUseTool: async (toolName, input, options) => {
      // Logique personnalisée
      return {
        behavior: 'allow',
        updatedInput: input,
        updatedPermissions: []
      };
    },

    // ============================================
    // OUTILS (TOOLS)
    // ============================================

    // Outils autorisés (si omis : tous les outils)
    allowedTools: ['Task', 'Read', 'Write', 'Edit', 'Bash', 'Grep', 'Glob'],

    // Outils interdits
    disallowedTools: ['WebSearch'],

    // ============================================
    // MODÈLES
    // ============================================

    // Modèle principal
    model: 'sonnet',  // 'haiku' | 'sonnet' | 'opus'

    // Modèle de secours si le principal échoue
    fallbackModel: 'haiku',

    // ============================================
    // SYSTEM PROMPT
    // ============================================

    // Option 1 : Preset Claude Code (recommandé)
    systemPrompt: {
      type: 'preset',
      preset: 'claude_code',
      append: 'Additional instructions here...'  // Optionnel
    },

    // Option 2 : Prompt personnalisé
    // systemPrompt: 'Your custom system prompt',

    // ============================================
    // CONTEXTE & ENVIRONNEMENT
    // ============================================

    // Répertoire de travail
    cwd: process.cwd(),

    // Répertoires additionnels accessibles
    additionalDirectories: ['/path/to/extra/dir'],

    // Variables d'environnement
    env: process.env,

    // ============================================
    // STREAMING & MESSAGES
    // ============================================

    // Inclure les messages partiels dans le stream
    includePartialMessages: false,

    // ============================================
    // LIMITATIONS
    // ============================================

    // Nombre maximum de tours de conversation
    maxTurns: 50,

    // Tokens maximum pour le raisonnement
    maxThinkingTokens: 10000,

    // ============================================
    // SESSION & CONTINUATION
    // ============================================

    // Continuer la conversation la plus récente
    continue: false,

    // Reprendre une session spécifique par ID
    resume: 'session-uuid-here',

    // Fork la session au lieu de continuer
    forkSession: false,

    // ============================================
    // MCP SERVERS
    // ============================================

    mcpServers: {
      'server-name': {
        // STDIO server
        type: 'stdio',
        command: 'npx',
        args: ['-y', 'mcp-server-package'],
        env: { API_KEY: 'xxx' }
      },
      'sse-server': {
        // SSE server
        type: 'sse',
        url: 'http://localhost:3000/sse',
        headers: { Authorization: 'Bearer xxx' }
      },
      'http-server': {
        // HTTP server
        type: 'http',
        url: 'http://localhost:3000',
        headers: {}
      },
      'sdk-server': {
        // SDK server (in-process)
        type: 'sdk',
        name: 'My SDK Server',
        instance: mcpServerInstance
      }
    },

    // Validation MCP stricte
    strictMcpConfig: false,

    // ============================================
    // PLUGINS
    // ============================================

    plugins: [
      { type: 'local', path: './my-plugin' },
      { type: 'local', path: '/absolute/path/to/plugin' }
    ],

    // ============================================
    // HOOKS
    // ============================================

    hooks: {
      PreToolUse: [
        {
          matcher: 'Read',  // Optionnel : filtre par nom d'outil
          hooks: [
            async (input, toolUseID, { signal }) => {
              console.log('Before tool use:', input);
              return { continue: true };
            }
          ]
        }
      ],
      PostToolUse: [
        {
          hooks: [
            async (input, toolUseID, { signal }) => {
              console.log('After tool use:', input);
              return { continue: true };
            }
          ]
        }
      ],
      UserPromptSubmit: [
        {
          hooks: [
            async (input, toolUseID, { signal }) => {
              console.log('User submitted:', input.prompt);
              return {
                continue: true,
                hookSpecificOutput: {
                  hookEventName: 'UserPromptSubmit',
                  additionalContext: 'Extra context for the agent'
                }
              };
            }
          ]
        }
      ]
    },

    // ============================================
    // CONTRÔLE D'EXÉCUTION
    // ============================================

    // Contrôleur pour annuler les opérations
    abortController: new AbortController(),

    // ============================================
    // CALLBACKS
    // ============================================

    // Callback pour stderr
    stderr: (data: string) => {
      console.error('STDERR:', data);
    },

    // ============================================
    // CONFIGURATION AVANCÉE
    // ============================================

    // Exécutable JavaScript
    executable: 'node',  // 'node' | 'bun' | 'deno'

    // Arguments pour l'exécutable
    executableArgs: ['--max-old-space-size=4096'],

    // Chemin vers l'exécutable Claude Code
    pathToClaudeCodeExecutable: '/custom/path/to/claude',

    // Arguments supplémentaires
    extraArgs: {
      customArg: 'value'
    },

    // Nom d'outil MCP pour les prompts de permission
    permissionPromptToolName: 'ask_user_permission'
  }
});

for await (const message of result) {
  // Traiter les messages
}
```

### Options Essentielles par Cas d'Usage

**Application SDK simple (pas de filesystem) :**
```typescript
options: {
  agents: { /* agents programmatiques */ },
  allowedTools: ['Read', 'Write', 'Task'],
  permissionMode: 'bypassPermissions'
}
```

**Charger agents depuis .claude/agents/ :**
```typescript
options: {
  settingSources: ['project'],
  systemPrompt: { type: 'preset', preset: 'claude_code' },
  allowedTools: ['Task', 'Read', 'Write']
}
```

**CI/CD (pas d'interactions) :**
```typescript
options: {
  settingSources: ['project'],
  permissionMode: 'bypassPermissions',
  maxTurns: 100
}
```

**Analyse en lecture seule :**
```typescript
options: {
  allowedTools: ['Read', 'Grep', 'Glob'],
  permissionMode: 'default'
}
```

## Communication Entre Agents

### L'outil `Task`

C'est l'outil **critique** qui permet à un agent de déléguer du travail à un autre agent.

**Utilisation dans le prompt de l'orchestrateur :**

```markdown
Pour déléguer au writer :
- Utilise l'outil `Task`
- Paramètre `subagent_type`: "writer"
- Paramètre `description`: "Rédiger l'article"
- Paramètre `prompt`: "Rédige un article sur [sujet]..."
```

**Comment ça fonctionne :**

1. L'orchestrateur appelle `Task` avec :
   - `subagent_type`: Nom du fichier agent (sans `.md`) dans `.claude/agents/`
   - `prompt`: Instructions spécifiques pour cette tâche
   - `description`: Description courte de la tâche

2. Claude SDK charge l'agent depuis `.claude/agents/{subagent_type}.md`

3. L'agent spécialisé s'exécute avec son propre contexte et outils

4. Le résultat est renvoyé à l'orchestrateur

5. L'orchestrateur peut alors déléguer au prochain agent

### Workflow de Communication

```
┌─────────────────────────────────────────┐
│  TypeScript : executeWorkflow()         │
│  Lance l'orchestrateur avec query()     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Orchestrator Agent                     │
│  (.claude/agents/orchestrator.md)       │
│                                         │
│  1. Analyse la tâche                    │
│  2. Planifie le workflow                │
└──────────────┬──────────────────────────┘
               │
               │ Utilise Task tool
               │ subagent_type: "writer"
               ▼
┌─────────────────────────────────────────┐
│  Writer Agent                           │
│  (.claude/agents/writer.md)             │
│                                         │
│  - Rédige le contenu                    │
│  - Sauvegarde dans article-draft.md     │
└──────────────┬──────────────────────────┘
               │
               │ Retourne à l'orchestrateur
               ▼
┌─────────────────────────────────────────┐
│  Orchestrator Agent                     │
│  Vérifie article-draft.md               │
└──────────────┬──────────────────────────┘
               │
               │ Utilise Task tool
               │ subagent_type: "formatter"
               ▼
┌─────────────────────────────────────────┐
│  Formatter Agent                        │
│  (.claude/agents/formatter.md)          │
│                                         │
│  - Lit article-draft.md                 │
│  - Crée article.html                    │
└──────────────┬──────────────────────────┘
               │
               │ Retourne à l'orchestrateur
               ▼
┌─────────────────────────────────────────┐
│  Orchestrator Agent                     │
│  Rapport final du workflow              │
└─────────────────────────────────────────┘
```

## Exécution

### Commandes de base

```bash
# Installation
npm install

# Configuration API key (Windows)
$env:ANTHROPIC_API_KEY="sk-ant-..."

# Configuration API key (Mac/Linux)
export ANTHROPIC_API_KEY="sk-ant-..."

# Exécution avec sujet par défaut
npm start

# Exécution avec sujet personnalisé
npm start "Votre sujet ici"

# Ou directement avec tsx
tsx votre-script.ts "Votre sujet ici"
```

### Exemple de sortie console

```
╔═══════════════════════════════════════════════════╗
║   Système Multi-Agents Claude SDK                 ║
╚═══════════════════════════════════════════════════╝

📌 Sujet : Les architectures multi-agents
🤖 Architecture : Orchestrateur → Writer → Formatter
📂 Configuration : .claude/agents/

🚀 Démarrage du workflow...

🎭 Lancement de l'agent Orchestrateur...
   L'orchestrateur va coordonner les agents Writer et Formatter

⏳ Orchestrateur en cours d'exécution...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 Je vais coordonner la création d'un article sur ce sujet

🔧 Outil utilisé : Task
   └─ Délégation à un sous-agent...

📄 Résultat : Article rédigé avec succès dans article-draft.md

🤖 Étape 1/2 terminée. Lancement du formatter...

🔧 Outil utilisé : Task
   └─ Délégation à un sous-agent...

📄 Résultat : Page HTML créée dans article.html

✅ Workflow terminé avec succès

📊 Métriques :
   💰 Coût total : $0.5234
   📥 Input tokens : 21
   📤 Output tokens : 1,678
   ⏱️  Durée : 219.34s

═══════════════════════════════════════════════════
🎉 SUCCÈS ! Workflow multi-agents terminé

📄 Fichiers générés :
   📝 article-draft.md  (version markdown)
   🌐 article.html      (version HTML)

🎭 Architecture utilisée :
   Orchestrateur → Writer → Formatter
═══════════════════════════════════════════════════
```

## Métriques et Coûts

### Comparaison des architectures

**Architecture Séquentielle (sans orchestrateur) :**
- TypeScript lance Writer → attend → lance Formatter
- Coût : ~$0.39
- Tokens : ~1,200 input + output
- Pas de communication entre agents

**Architecture Orchestrée (avec orchestrateur) :**
- TypeScript lance Orchestrateur → Orchestrateur délègue aux autres
- Coût : ~$0.52 (+33%)
- Tokens : ~1,700 input + output
- Communication complète via Task tool

**Trade-off :**
- L'orchestrateur coûte plus cher (~33% de plus)
- MAIS vous obtenez une véritable autonomie des agents
- Workflow intelligent qui peut s'adapter aux erreurs
- Architecture évolutive et maintenable

### Optimisation des coûts

1. **Choix du modèle par agent :**
   - Orchestrateur : Haiku (rapide, coordination simple)
   - Tasks complexes : Sonnet
   - Tasks très simples : Haiku

2. **Réutilisation des résultats :**
   - Sauvegarde les résultats intermédiaires dans des fichiers
   - Évite de re-générer le même contenu

3. **Instructions précises :**
   - Plus vos instructions sont claires, moins de tokens sont utilisés
   - Spécifiez exactement le format de sortie attendu

## Cas d'Usage Avancés

### 1. Système de Documentation Automatisée

```
Orchestrateur
  ├─→ Code Reader Agent (lit le code source)
  ├─→ Architecture Analyzer Agent (extrait les patterns)
  ├─→ Documentation Writer Agent (génère la doc)
  └─→ Markdown Formatter Agent (met en page)
```

### 2. Assistant de Développement

```
Orchestrateur
  ├─→ Git Agent (gère les requêtes Git)
  ├─→ Bug Analyzer Agent (analyse les bugs)
  ├─→ Code Generator Agent (génère du code)
  └─→ Test Writer Agent (écrit les tests)
```

### 3. Pipeline de Création de Contenu

```
Orchestrateur
  ├─→ Research Agent (recherche d'informations)
  ├─→ Content Structurer Agent (structure le contenu)
  ├─→ Writer Agent (rédige les sections)
  ├─→ Style Optimizer Agent (révise et optimise)
  └─→ SEO Agent (optimise pour le référencement)
```

### 4. Système d'Analyse de Données

```
Orchestrateur
  ├─→ Data Extractor Agent (extrait les données)
  ├─→ Data Cleaner Agent (nettoie et transforme)
  ├─→ Statistical Analyzer Agent (analyse statistique)
  └─→ Visualization Agent (génère visualisations et rapports)
```

## Intégration Backend

### Préparation pour Convex

L'architecture multi-agents est **parfaitement adaptée** pour une intégration avec Convex :

```typescript
// Exemple futur avec Convex
import { action } from './_generated/server';
import { query } from '@anthropic-ai/claude-agent-sdk';

export const generateContent = action({
  args: { topic: v.string() },
  handler: async (ctx, { topic }) => {
    // Utiliser le système multi-agents
    const result = await executeWorkflow(topic);

    // Stocker les résultats dans Convex
    await ctx.db.insert('articles', {
      topic,
      markdown: result.markdown,
      html: result.html,
      createdAt: Date.now(),
      cost: result.cost,
      tokensUsed: result.tokens
    });

    return { success: true, articleId: insertedId };
  }
});
```

**Avantages pour Convex :**
- Actions Convex peuvent lancer des workflows multi-agents
- Résultats stockés dans la base de données
- Métriques de coût et performance trackées
- Workflow asynchrone via actions

## Debugging et Résolution de Problèmes

### Problème : Agent non trouvé

**Erreur :** `Agent "writer" not found`

**Solutions :**
1. Vérifiez que le fichier `.claude/agents/writer.md` existe
2. Vérifiez que `settingSources: ['project']` est dans les options
3. Le nom du fichier doit correspondre exactement au `subagent_type`

### Problème : Outil Task non disponible

**Erreur :** `Tool "Task" is not available`

**Solutions :**
1. Ajoutez `'Task'` dans `allowedTools` de l'orchestrateur
2. Vérifiez que vous utilisez `systemPrompt: { type: 'preset', preset: 'claude_code' }`

### Problème : Agents ne communiquent pas

**Symptôme :** Agents s'exécutent mais ne se passent pas d'informations

**Solutions :**
1. Vérifiez que l'orchestrateur utilise bien l'outil `Task`
2. Assurez-vous que les fichiers intermédiaires sont créés
3. Lisez les fichiers entre chaque étape dans l'orchestrateur

### Problème : Coûts trop élevés

**Solutions :**
1. Utilisez `model: 'haiku'` pour les tâches simples
2. Réduisez la longueur des prompts
3. Réutilisez les résultats déjà générés
4. Cachez les réponses fréquentes

## Tous les Outils Disponibles (Built-in Tools)

Le SDK Claude Code fournit de nombreux outils intégrés. Voici la liste complète :

### Outils de Gestion de Fichiers

**`Read`** - Lire des fichiers (texte, images, PDF, notebooks)
```typescript
{
  file_path: string,    // Chemin absolu
  offset?: number,      // Ligne de départ
  limit?: number        // Nombre de lignes
}
```

**`Write`** - Créer/écraser des fichiers
```typescript
{
  file_path: string,    // Chemin absolu
  content: string       // Contenu à écrire
}
```

**`Edit`** - Remplacements exacts dans les fichiers
```typescript
{
  file_path: string,
  old_string: string,
  new_string: string,
  replace_all?: boolean  // Remplacer toutes les occurrences
}
```

**`NotebookEdit`** - Éditer des cellules Jupyter
```typescript
{
  notebook_path: string,
  cell_id?: string,
  new_source: string,
  cell_type?: 'code' | 'markdown',
  edit_mode?: 'replace' | 'insert' | 'delete'
}
```

### Outils de Recherche

**`Glob`** - Recherche de fichiers par pattern
```typescript
{
  pattern: string,      // Pattern glob (ex: "**/*.ts")
  path?: string         // Répertoire de recherche (défaut: cwd)
}
```

**`Grep`** - Recherche de contenu avec regex
```typescript
{
  pattern: string,                    // Pattern regex
  path?: string,                      // Fichier/dossier
  glob?: string,                      // Filtre de fichiers
  type?: string,                      // Type (js, py, etc.)
  output_mode?: 'content' | 'files_with_matches' | 'count',
  '-i'?: boolean,                     // Case insensitive
  '-n'?: boolean,                     // Line numbers
  '-A'?: number,                      // Lines after
  '-B'?: number,                      // Lines before
  '-C'?: number,                      // Lines before+after
  multiline?: boolean,                // Multiline mode
  head_limit?: number                 // Limit output
}
```

### Outils d'Exécution

**`Bash`** - Exécuter des commandes shell
```typescript
{
  command: string,
  timeout?: number,           // Max 600000ms
  description?: string,       // Description courte
  run_in_background?: boolean // Exécution en arrière-plan
}
```

**`BashOutput`** - Récupérer output d'un shell en arrière-plan
```typescript
{
  bash_id: string,
  filter?: string  // Regex pour filtrer les lignes
}
```

**`KillBash`** - Terminer un shell en arrière-plan
```typescript
{
  shell_id: string
}
```

### Outils de Coordination

**`Task`** - Déléguer à un sous-agent (ESSENTIEL pour multi-agents)
```typescript
{
  description: string,    // Description courte (3-5 mots)
  prompt: string,         // Instructions pour l'agent
  subagent_type: string   // Nom de l'agent (fichier .md ou clé dans agents)
}
```

**`TodoWrite`** - Gérer une liste de tâches
```typescript
{
  todos: Array<{
    content: string,
    status: 'pending' | 'in_progress' | 'completed',
    activeForm: string
  }>
}
```

**`ExitPlanMode`** - Sortir du mode planification
```typescript
{
  plan: string  // Le plan à soumettre à l'utilisateur
}
```

### Outils Web

**`WebFetch`** - Récupérer et traiter du contenu web
```typescript
{
  url: string,
  prompt: string  // Prompt pour analyser le contenu
}
```

**`WebSearch`** - Recherche web
```typescript
{
  query: string,
  allowed_domains?: string[],
  blocked_domains?: string[]
}
```

### Outils MCP (Model Context Protocol)

**`ListMcpResources`** - Lister les ressources MCP
```typescript
{
  server?: string  // Nom du serveur (optionnel)
}
```

**`ReadMcpResource`** - Lire une ressource MCP
```typescript
{
  server: string,
  uri: string
}
```

### Restriction d'Outils par Agent

**Agents en lecture seule (analyse, review) :**
```typescript
tools: ['Read', 'Grep', 'Glob']
```

**Agents de test :**
```typescript
tools: ['Bash', 'Read', 'Grep']
```

**Agents de modification de code :**
```typescript
tools: ['Read', 'Edit', 'Write', 'Grep', 'Glob']
```

**Orchestrateurs :**
```typescript
tools: ['Task', 'Read', 'Write']
```

## Types de Messages SDK

Le SDK retourne différents types de messages via le stream :

### `SDKAssistantMessage`
Message de réponse de l'assistant
```typescript
{
  type: 'assistant',
  uuid: string,
  session_id: string,
  message: APIAssistantMessage,
  parent_tool_use_id: string | null
}
```

### `SDKUserMessage`
Message de l'utilisateur
```typescript
{
  type: 'user',
  uuid?: string,
  session_id: string,
  message: APIUserMessage,
  parent_tool_use_id: string | null
}
```

### `SDKResultMessage`
Message de résultat final
```typescript
{
  type: 'result',
  subtype: 'success' | 'error_max_turns' | 'error_during_execution',
  uuid: string,
  session_id: string,
  duration_ms: number,
  duration_api_ms: number,
  is_error: boolean,
  num_turns: number,
  result?: string,
  total_cost_usd: number,
  usage: {
    input_tokens: number,
    output_tokens: number,
    cache_creation_input_tokens?: number,
    cache_read_input_tokens?: number
  },
  permission_denials: Array<{
    tool_name: string,
    tool_use_id: string,
    tool_input: any
  }>
}
```

### `SDKSystemMessage`
Message d'initialisation système
```typescript
{
  type: 'system',
  subtype: 'init',
  uuid: string,
  session_id: string,
  apiKeySource: 'user' | 'project' | 'org' | 'temporary',
  cwd: string,
  tools: string[],
  mcp_servers: Array<{ name: string, status: string }>,
  model: string,
  permissionMode: string,
  slash_commands: string[],
  output_style: string
}
```

### `SDKPartialAssistantMessage`
Message partiel en streaming (si `includePartialMessages: true`)
```typescript
{
  type: 'stream_event',
  event: RawMessageStreamEvent,
  parent_tool_use_id: string | null,
  uuid: string,
  session_id: string
}
```

### Traitement des Messages

```typescript
for await (const message of query({ prompt: "...", options: {} })) {
  switch (message.type) {
    case 'assistant':
      // Réponse de l'assistant
      for (const content of message.message.content) {
        if (content.type === 'text') {
          console.log('💬', content.text);
        } else if (content.type === 'tool_use') {
          console.log('🔧', content.name, content.input);
        }
      }
      break;

    case 'user':
      // Message utilisateur (ou résultat d'outil)
      for (const content of message.message.content) {
        if (content.type === 'tool_result') {
          console.log('📊', content.content);
        }
      }
      break;

    case 'result':
      // Résultat final
      console.log('✅ Terminé');
      console.log('💰 Coût:', message.total_cost_usd);
      console.log('📊 Tokens:', message.usage);
      console.log('⏱️ Durée:', message.duration_ms);
      break;

    case 'system':
      // Initialisation système
      if (message.subtype === 'init') {
        console.log('🚀 Session:', message.session_id);
        console.log('🔧 Outils:', message.tools);
      }
      break;

    case 'stream_event':
      // Événement de streaming partiel
      console.log('📡 Stream event:', message.event);
      break;
  }
}
```

## Patterns Avancés

### 1. Agents Configurables Dynamiquement

```typescript
function createAgent(level: 'junior' | 'senior'): AgentDefinition {
  return {
    description: `${level} code reviewer`,
    prompt: level === 'senior'
      ? 'You are a senior code reviewer with 10+ years experience...'
      : 'You are a junior code reviewer focusing on basics...',
    tools: level === 'senior'
      ? ['Read', 'Edit', 'Grep', 'Bash']
      : ['Read', 'Grep'],
    model: level === 'senior' ? 'opus' : 'haiku'
  };
}

const result = query({
  prompt: "Review this code",
  options: {
    agents: {
      'reviewer': createAgent('senior')
    }
  }
});
```

### 2. Gestion d'Erreurs avec Retry

```typescript
async function executeWithRetry(prompt: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = query({ prompt, options: { maxTurns: 50 } });

      for await (const message of result) {
        if (message.type === 'result' && !message.is_error) {
          return message;
        }
      }
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### 3. Parallélisation avec Agents

```typescript
async function parallelReview(files: string[]) {
  const reviews = await Promise.all(
    files.map(file =>
      query({
        prompt: `Review ${file}`,
        options: {
          agents: {
            'reviewer': {
              description: 'Code reviewer',
              prompt: 'Review code for issues',
              tools: ['Read', 'Grep']
            }
          }
        }
      })
    )
  );

  for (const review of reviews) {
    for await (const message of review) {
      if (message.type === 'result') {
        console.log('Review done:', message.result);
      }
    }
  }
}
```

### 4. Streaming avec Interruption

```typescript
const abortController = new AbortController();
const query = query({
  prompt: "Long running task",
  options: {
    abortController,
    includePartialMessages: true
  }
});

// Interrompre après 30 secondes
setTimeout(() => {
  abortController.abort();
  console.log('Task interrupted');
}, 30000);

for await (const message of query) {
  console.log(message);
}
```

### 5. Hooks pour Monitoring

```typescript
const result = query({
  prompt: "Analyze codebase",
  options: {
    hooks: {
      PreToolUse: [{
        hooks: [async (input) => {
          console.log(`🔍 About to use ${input.tool_name}`);
          console.log('📊 Input:', input.tool_input);
          return { continue: true };
        }]
      }],
      PostToolUse: [{
        hooks: [async (input) => {
          console.log(`✅ Finished ${input.tool_name}`);
          console.log('📊 Output:', input.tool_response);
          return { continue: true };
        }]
      }]
    }
  }
});
```

## Checklist de Validation

Avant de considérer votre système multi-agents comme prêt :

- [ ] Structure `.claude/agents/` créée avec tous les fichiers `.md`
- [ ] Chaque agent a une description claire et des instructions précises
- [ ] Orchestrateur utilise l'outil `Task` pour déléguer
- [ ] `settingSources: ['project']` est configuré dans le code TypeScript
- [ ] `'Task'` est dans `allowedTools` de l'orchestrateur
- [ ] System prompt utilise le preset `'claude_code'`
- [ ] Testé avec un sujet simple et ça fonctionne
- [ ] Fichiers de sortie générés correctement
- [ ] Métriques de coût affichées et acceptables
- [ ] README.md documente l'architecture et l'utilisation
- [ ] Package.json configuré avec les bonnes dépendances
- [ ] API key Anthropic configurée dans l'environnement

## Ressources

### Documentation Officielle

- [Claude Agent SDK - TypeScript](https://docs.claude.com/en/docs/agent-sdk/typescript)
- [Subagents Guide](https://docs.claude.com/en/docs/agent-sdk/guides/subagents)
- [Tool Use Documentation](https://docs.claude.com/en/docs/build-with-claude/tool-use)
- [API Reference](https://docs.anthropic.com/en/api)

### Exemples de Projets

- **Blog Generator** : Système à 3 agents (orchestrateur, writer, formatter)
- **Code Documenter** : Analyse et documente automatiquement le code
- **Content Pipeline** : Recherche, rédaction, et publication automatisée

### Communauté

- [GitHub - Claude Agent SDK](https://github.com/anthropics/claude-agent-sdk)
- [Discord Anthropic](https://discord.gg/anthropic)
- [Forum Discussions](https://community.anthropic.com)

## Conclusion

Ce skill vous permet de maîtriser complètement l'architecture multi-agents avec Claude SDK. Vous savez maintenant :

✅ Créer des agents spécialisés dans `.claude/agents/`
✅ Utiliser l'outil `Task` pour la délégation
✅ Configurer un orchestrateur qui coordonne tout
✅ Gérer les workflows complexes
✅ Optimiser les coûts et performances
✅ Préparer l'intégration backend avec Convex

**Prochaines étapes suggérées :**
1. Créez votre premier système à 2-3 agents
2. Testez avec différents types de tâches
3. Mesurez les coûts et optimisez
4. Ajoutez des agents supplémentaires selon vos besoins
5. Intégrez avec votre backend (Convex, etc.)

**Rappelez-vous :** L'architecture multi-agents brille quand chaque agent a un rôle clair et spécialisé. Pensez modularité et réutilisabilité !
