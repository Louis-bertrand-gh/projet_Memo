'use client';

import { useState, useRef, useEffect } from "react";

const INITIAL_CARDS = [
  {
    id: 1,
    category: "Linux & Apache",
    icon: "🐧",
    color: "teal",
    sections: [
      {
        title: "Commandes de Base Linux",
        type: "table",
        headers: ["Catégorie", "Commande", "Description"],
        rows: [
          ["Navigation", "cd /etc/apache2", "Se déplacer dans un dossier"],
          ["Listing", "ls -lh", "Lister les fichiers avec détails (taille, droits)"],
          ["Édition", "sudo nano fichier.conf", "Modifier un fichier de configuration"],
          ["Permissions", "sudo chown -R www-data: /var/www", "Donner la propriété du dossier à Apache"],
          ["Droits", "sudo chmod 755 -R /var/www", "Appliquer les droits de lecture/exécution standards"],
          ["Surveillance", "htop", "Voir l'utilisation CPU/RAM en temps réel"],
          ["Espace Disque", "df -h", "Vérifier si le disque est plein"],
        ],
      },
      {
        title: "Gestion du Service Apache (systemctl)",
        type: "commands",
        items: [
          { label: "Démarrer", cmd: "sudo systemctl start apache2" },
          { label: "Arrêter", cmd: "sudo systemctl stop apache2" },
          { label: "Redémarrer", cmd: "sudo systemctl restart apache2", note: "Coupe les connexions en cours" },
          { label: "Recharger", cmd: "sudo systemctl reload apache2", note: "Applique la config sans coupure" },
          { label: "Statut", cmd: "sudo systemctl status apache2" },
        ],
      },
      {
        title: "Gestion des Sites (VirtualHosts)",
        type: "commands",
        items: [
          { label: "Activer un site", cmd: "sudo a2ensite nom_du_fichier.conf" },
          { label: "Désactiver un site", cmd: "sudo a2dissite nom_du_fichier.conf" },
          { label: "Activer un module", cmd: "sudo a2enmod nom_module", note: "ex: proxy, ssl, rewrite" },
          { label: "Désactiver un module", cmd: "sudo a2dismod nom_module" },
          { label: "Lister modules actifs", cmd: "apache2ctl -M" },
        ],
      },
      {
        title: "Vérification & Logs",
        type: "commands",
        items: [
          { label: "Vérifier syntaxe", cmd: "sudo apache2ctl configtest", note: "Toujours avant de redémarrer" },
          { label: "Logs erreurs", cmd: "sudo tail -f /var/log/apache2/error.log" },
          { label: "Logs accès", cmd: "sudo tail -f /var/log/apache2/access.log" },
        ],
      },
      {
        title: "Chemins Clés",
        type: "paths",
        items: [
          { label: "Configurations", path: "/etc/apache2/" },
          { label: "Sites disponibles", path: "/etc/apache2/sites-available/" },
          { label: "Racine Web", path: "/var/www/html/" },
          { label: "Journaux", path: "/var/log/apache2/" },
        ],
      },
    ],
  },
  {
    id: 2,
    category: "Reverse Proxy",
    icon: "🌐",
    color: "amber",
    sections: [
      {
        title: "Activation des Modules Proxy",
        type: "table",
        headers: ["Commande", "Rôle"],
        rows: [
          ["sudo a2enmod proxy", "Active le moteur de proxy de base"],
          ["sudo a2enmod proxy_http", "Support HTTP → Node, Docker, etc."],
          ["sudo a2enmod proxy_balancer", "Optionnel : répartition de charge"],
          ["sudo a2enmod proxy_connect", "Support SSL en tunnel (CONNECT)"],
        ],
      },
      {
        title: "Directives Clés de Configuration",
        type: "code",
        lang: "apache",
        content: `# Dans <VirtualHost *:80>
ProxyPreserveHost On
ProxyPass / http://127.0.0.1:8080/
ProxyPassReverse / http://127.0.0.1:8080/`,
      },
      {
        title: "Tests de Connectivité",
        type: "table",
        headers: ["Action", "Commande", "Pourquoi ?"],
        rows: [
          ["Test de port", "nc -zv 127.0.0.1 8080", "Vérifie si le port de destination écoute"],
          ["Appel local", "curl -I http://127.0.0.1:8080", "Vérifie que le service répond (HTTP 200)"],
          ["Ports actifs", "ss -tulpn", "Liste tous les services qui écoutent"],
          ["Logs Apache", "tail -f /var/log/apache2/error.log", "Raison d'un 502 Bad Gateway"],
        ],
      },
      {
        title: "Workflow Zéro Erreur",
        type: "steps",
        items: [
          { step: 1, label: "Modifier", cmd: "sudo nano /etc/apache2/sites-available/mon-site.conf" },
          { step: 2, label: "Vérifier", cmd: "sudo apache2ctl configtest" },
          { step: 3, label: "Appliquer", cmd: "sudo systemctl reload apache2", note: "Si le test est OK" },
          { step: 4, label: "Surveiller", cmd: "sudo tail -n 20 /var/log/apache2/error.log" },
        ],
      },
      {
        title: "Pare-feu UFW",
        type: "commands",
        items: [
          { label: "Autoriser Apache", cmd: "sudo ufw allow 'Apache Full'" },
        ],
      },
    ],
  },
  {
    id: 3,
    category: "DNS Autoritaire (BIND9)",
    icon: "🔍",
    color: "coral",
    sections: [
      {
        title: "Installation & Arborescence",
        type: "table",
        headers: ["Commande / Chemin", "Rôle"],
        rows: [
          ["sudo apt install bind9 bind9utils", "Installation du service et des outils de test"],
          ["/etc/bind/named.conf.local", "Déclaration des zones (domaines)"],
          ["/etc/bind/named.conf.options", "Configuration globale (forwarders, sécurité)"],
          ["/var/cache/bind/", "Stockage des zones répliquées (Esclave)"],
        ],
      },
      {
        title: "Serveur Primaire — Déclaration de Zone",
        type: "code",
        lang: "dns",
        content: `zone "mon-domaine.lan" {
    type master;
    file "/etc/bind/db.mon-domaine.lan";
    allow-transfer { IP_DU_SECONDAIRE; };
    also-notify { IP_DU_SECONDAIRE; };
};`,
      },
      {
        title: "Fichier de Zone",
        type: "code",
        lang: "dns",
        content: `$TTL 604800
@   IN  SOA  ns1.mon-domaine.lan. admin.mon-domaine.lan. (
                  2023102701 ; Serial ← INCRÉMENTER À CHAQUE MAJ
                  604800     ; Refresh
                  86400      ; Retry
                  2419200    ; Expire
                  604800 )   ; Negative Cache TTL

@   IN  NS   ns1.mon-domaine.lan.
@   IN  NS   ns2.mon-domaine.lan.
ns1 IN  A    IP_SERVEUR_MAITRE
ns2 IN  A    IP_SERVEUR_ESCLAVE
www IN  A    IP_DU_SERVEUR_WEB`,
      },
      {
        title: "Serveur Secondaire — Déclaration de Zone",
        type: "code",
        lang: "dns",
        content: `zone "mon-domaine.lan" {
    type slave;
    file "/var/cache/bind/db.mon-domaine.lan";
    masters { IP_DU_MAITRE; };
};`,
      },
      {
        title: "Vérification (Vital)",
        type: "commands",
        items: [
          { label: "Syntaxe globale", cmd: "sudo named-checkconf" },
          { label: "Fichier de zone", cmd: "sudo named-checkzone mon-domaine.lan /etc/bind/db.mon-domaine.lan" },
          { label: "Recharger les zones", cmd: "sudo rndc reload" },
          { label: "Logs de transfert", cmd: "tail -f /var/log/syslog | grep named" },
        ],
      },
      {
        title: "Diagnostic avec dig",
        type: "commands",
        items: [
          { label: "Tester local", cmd: "dig @localhost www.mon-domaine.lan" },
          { label: "Tester transfert (AXFR)", cmd: "dig axfr mon-domaine.lan @IP_DU_MAITRE" },
          { label: "Vérifier SOA", cmd: "dig mon-domaine.lan SOA" },
        ],
      },
    ],
  },
];

const COLOR_MAP = {
  teal: { bg: "#0d2b22", accent: "#1aff9c", border: "#0f4a38", tag: "#0d3d2e", text: "#6effc4" },
  amber: { bg: "#2a1f00", accent: "#ffbf00", border: "#4a3700", tag: "#3d2e00", text: "#ffd966" },
  coral: { bg: "#2b1208", accent: "#ff6b47", border: "#4a2010", tag: "#3d1a0d", text: "#ff9980" },
  purple: { bg: "#1a1030", accent: "#c084fc", border: "#3b2560", tag: "#2a1a50", text: "#d8b4fe" },
  blue: { bg: "#0a1628", accent: "#60a5fa", border: "#1e3a5f", tag: "#122040", text: "#93c5fd" },
};

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  };
  return (
    <button onClick={copy} title="Copier" style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 6px", borderRadius: 4, fontSize: 11, color: copied ? "#4ade80" : "#666", transition: "color 0.2s" }}>
      {copied ? "✓ copié" : "⧉"}
    </button>
  );
}

function CodeBlock({ content, color }) {
  return (
    <div style={{ position: "relative", marginTop: 8 }}>
      <pre style={{ background: "#0a0a0a", border: `1px solid ${COLOR_MAP[color].border}`, borderRadius: 6, padding: "12px 14px", fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 12, lineHeight: 1.6, color: COLOR_MAP[color].text, overflowX: "auto", margin: 0 }}>
        <code>{content}</code>
      </pre>
      <div style={{ position: "absolute", top: 6, right: 8 }}><CopyBtn text={content} /></div>
    </div>
  );
}

function CommandItem({ label, cmd, note, color, step }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "7px 0", borderBottom: "1px solid #1a1a1a" }}>
      {step !== undefined && (
        <div style={{ minWidth: 22, height: 22, borderRadius: "50%", background: COLOR_MAP[color].accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#000", marginTop: 1, flexShrink: 0 }}>
          {step}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        {label && <div style={{ fontSize: 11, color: "#666", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>}
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#0a0a0a", borderRadius: 5, padding: "4px 10px", border: `1px solid ${COLOR_MAP[color].border}` }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: COLOR_MAP[color].accent, flex: 1, wordBreak: "break-all" }}>{cmd}</span>
          <CopyBtn text={cmd} />
        </div>
        {note && <div style={{ fontSize: 11, color: "#888", marginTop: 3, fontStyle: "italic" }}>⚡ {note}</div>}
      </div>
    </div>
  );
}

function Section({ section, color }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ marginBottom: 16 }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${COLOR_MAP[color].border}` }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: COLOR_MAP[color].text, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" }}>
          ▸ {section.title}
        </span>
        <span style={{ fontSize: 12, color: "#555" }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{ paddingTop: 10 }}>
          {section.type === "table" && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                <thead>
                  <tr>
                    {section.headers.map((h, i) => (
                      <th key={i} style={{ textAlign: "left", padding: "5px 10px", background: COLOR_MAP[color].tag, color: COLOR_MAP[color].text, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.rows.map((row, ri) => (
                    <tr key={ri} style={{ background: ri % 2 === 0 ? "#111" : "#0c0c0c" }}>
                      {row.map((cell, ci) => (
                        <td key={ci} style={{ padding: "6px 10px", color: ci === 0 ? COLOR_MAP[color].accent : "#ccc", fontFamily: ci > 0 ? "inherit" : "'JetBrains Mono', monospace", fontSize: ci > 0 ? 12.5 : 12, borderBottom: "1px solid #1a1a1a", verticalAlign: "top" }}>
                          {ci === 1 && section.headers.length >= 2 ? (
                            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <code style={{ fontFamily: "'JetBrains Mono', monospace", color: COLOR_MAP[color].accent }}>{cell}</code>
                              <CopyBtn text={cell} />
                            </span>
                          ) : cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {section.type === "commands" && section.items.map((item, i) => (
            <CommandItem key={i} {...item} color={color} />
          ))}
          {section.type === "steps" && section.items.map((item, i) => (
            <CommandItem key={i} {...item} color={color} step={item.step} />
          ))}
          {section.type === "code" && <CodeBlock content={section.content} color={color} />}
          {section.type === "paths" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 4 }}>
              {section.items.map((item, i) => (
                <div key={i} style={{ background: "#0a0a0a", border: `1px solid ${COLOR_MAP[color].border}`, borderRadius: 6, padding: "8px 12px" }}>
                  <div style={{ fontSize: 11, color: "#666", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: COLOR_MAP[color].accent }}>
                    {item.path} <CopyBtn text={item.path} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Card({ card, onDelete }) {
  const col = COLOR_MAP[card.color] || COLOR_MAP.teal;
  return (
    <div style={{ background: col.bg, border: `1px solid ${col.border}`, borderRadius: 10, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>{card.icon}</span>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: col.accent, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.04em" }}>{card.category}</h2>
        </div>
        {onDelete && (
          <button onClick={() => onDelete(card.id)} title="Supprimer" style={{ background: "none", border: "none", cursor: "pointer", color: "#444", fontSize: 14, padding: 4 }}>✕</button>
        )}
      </div>
      {card.sections.map((sec, i) => <Section key={i} section={sec} color={card.color} />)}
    </div>
  );
}

const COLORS = ["teal", "amber", "coral", "purple", "blue"];

function GenerateForm({ onGenerate, loading }) {
  const [topic, setTopic] = useState("");
  const [color, setColor] = useState("teal");
  const [icon, setIcon] = useState("⚙️");

  const handleSubmit = () => {
    if (!topic.trim()) return;
    onGenerate({ topic: topic.trim(), color, icon });
    setTopic("");
  };

  return (
    <div style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 10, padding: "20px 22px" }}>
      <h3 style={{ margin: "0 0 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        ⚡ Générer une nouvelle fiche
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label style={{ fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 4 }}>Sujet / Technologie</label>
          <input
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder="ex: Docker, Nginx, PostgreSQL, Kubernetes..."
            style={{ width: "100%", boxSizing: "border-box", background: "#0a0a0a", border: "1px solid #333", borderRadius: 6, padding: "9px 12px", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#eee", outline: "none" }}
          />
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 4 }}>Couleur</label>
            <div style={{ display: "flex", gap: 6 }}>
              {COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} title={c} style={{ width: 24, height: 24, borderRadius: "50%", background: COLOR_MAP[c].accent, border: color === c ? "2px solid #fff" : "2px solid transparent", cursor: "pointer", transition: "border 0.15s" }} />
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 4 }}>Icône</label>
            <div style={{ display: "flex", gap: 4 }}>
              {["⚙️", "🔐", "📦", "🐳", "🗄️", "🔧", "🚀"].map(em => (
                <button key={em} onClick={() => setIcon(em)} style={{ background: icon === em ? "#222" : "none", border: `1px solid ${icon === em ? "#444" : "transparent"}`, borderRadius: 5, cursor: "pointer", fontSize: 16, padding: "2px 4px" }}>{em}</button>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading || !topic.trim()}
          style={{ background: loading || !topic.trim() ? "#1a1a1a" : "#1aff9c22", border: `1px solid ${loading || !topic.trim() ? "#333" : "#1aff9c66"}`, borderRadius: 6, padding: "10px 18px", color: loading || !topic.trim() ? "#555" : "#1aff9c", cursor: loading || !topic.trim() ? "not-allowed" : "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, transition: "all 0.2s", letterSpacing: "0.05em" }}
        >
          {loading ? "⟳ Génération en cours..." : "▶ Générer la fiche"}
        </button>
      </div>
    </div>
  );
}

function parseAICard(raw, { topic, color, icon }) {
  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return { id: Date.now(), color, icon, ...parsed };
  } catch {
    return {
      id: Date.now(),
      category: topic,
      icon,
      color,
      sections: [
        {
          title: "Commandes Essentielles",
          type: "commands",
          items: raw.match(/`([^`]+)`/g)?.slice(0, 8).map(m => ({ label: "", cmd: m.replace(/`/g, "") })) || [
            { label: "Référence", cmd: "# Voir la documentation officielle" }
          ]
        }
      ]
    };
  }
}

const SYSTEM_PROMPT = `Tu es un expert SysAdmin. Génère une fiche mémo technique pour la technologie demandée.
Réponds UNIQUEMENT avec un objet JSON valide (aucun autre texte, aucun markdown) ayant cette structure exacte :
{
  "category": "Nom de la catégorie",
  "sections": [
    {
      "title": "Titre de section",
      "type": "commands",
      "items": [
        { "label": "Description courte", "cmd": "la_commande --exemple", "note": "explication optionnelle" }
      ]
    },
    {
      "title": "Tableau exemple",
      "type": "table",
      "headers": ["Col1", "Col2", "Col3"],
      "rows": [
        ["val1", "val2", "val3"]
      ]
    },
    {
      "title": "Code exemple",
      "type": "code",
      "lang": "bash",
      "content": "# Contenu du bloc de code\\ncommande --option"
    }
  ]
}
Inclus 3 à 5 sections variées (commands, table, code). Toutes les commandes doivent être réelles et utiles pour un SysAdmin.`;

export default function Home() {
  const [cards, setCards] = useState(INITIAL_CARDS);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState(null);

  const filtered = cards.filter(c =>
    c.category.toLowerCase().includes(search.toLowerCase()) ||
    c.sections?.some(s => s.title.toLowerCase().includes(search.toLowerCase()))
  );

  const handleGenerate = async ({ topic, color, icon }) => {
    setLoading(true);
    setError("");
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: `Génère une fiche mémo SysAdmin pour : ${topic}` }]
        })
      });
      const data = await resp.json();
      const raw = data.content?.find(b => b.type === "text")?.text || "";
      const card = parseAICard(raw, { topic, color, icon });
      setCards(prev => [card, ...prev]);
      setActiveId(card.id);
    } catch (e) {
      setError("Erreur lors de la génération. Vérifie ta connexion.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => setCards(prev => prev.filter(c => c.id !== id));

  return (
    <div style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace", background: "#080808", minHeight: "100vh", color: "#ccc" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #1a1a1a", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#080808", zIndex: 10 }}>
        <div>
          <div style={{ fontSize: 11, color: "#444", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 2 }}>root@memo:~$</div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#eee", letterSpacing: "0.04em" }}>
            <span style={{ color: "#1aff9c" }}>SysAdmin</span> MémoFiches
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, color: "#444" }}>{filtered.length} fiche{filtered.length > 1 ? "s" : ""}</span>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#1aff9c", boxShadow: "0 0 8px #1aff9c" }} />
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Search + Generate */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Rechercher</label>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Linux, proxy, DNS..."
              style={{ width: "100%", boxSizing: "border-box", background: "#111", border: "1px solid #222", borderRadius: 6, padding: "9px 12px", fontFamily: "inherit", fontSize: 13, color: "#eee", outline: "none" }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {cards.map(c => (
                <button key={c.id} onClick={() => { setActiveId(activeId === c.id ? null : c.id); setSearch(""); }}
                  style={{ background: activeId === c.id ? COLOR_MAP[c.color].tag : "#111", border: `1px solid ${activeId === c.id ? COLOR_MAP[c.color].border : "#222"}`, borderRadius: 20, padding: "4px 12px", cursor: "pointer", fontSize: 12, color: activeId === c.id ? COLOR_MAP[c.color].accent : "#666", transition: "all 0.15s" }}>
                  {c.icon} {c.category}
                </button>
              ))}
            </div>
          </div>
        </div>

        <GenerateForm onGenerate={handleGenerate} loading={loading} />
        {error && <div style={{ background: "#1a0a0a", border: "1px solid #4a1010", borderRadius: 6, padding: "10px 14px", color: "#f87171", fontSize: 13 }}>⚠ {error}</div>}

        {/* Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {(activeId ? filtered.filter(c => c.id === activeId) : filtered).map(card => (
            <Card key={card.id} card={card} onDelete={card.id > 3 ? handleDelete : null} />
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#444", fontSize: 14 }}>
              Aucune fiche trouvée pour « {search} »
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
