# 🐳 Images Docker - WordPress Multisite Headless + Next.js

> **Sous-projet dédié** : Images Docker pour le déploiement de WordPress Multisite Headless avec backend API GraphQL/REST pour frontend Next.js sur TestopsFactory.

> ⚠️ **Séparation des contextes** : Ce sous-projet est spécialisé dans les **images Docker et le développement local**. Pour l'**infrastructure Terraform et les déploiements AWS EKS**, consultez la [documentation principale](../README.md).

## 🎯 Vue d'ensemble

Ce répertoire contient les **images Docker** pour l'infrastructure WordPress Multisite Headless de TestopsFactory, déployée sur AWS EKS avec authentification SAML 2.0 et Google Workspace.

### 🏗️ Architecture des Images

| Composant | Image | Description |
|-----------|-------|-------------|
| **WordPress Headless** | `wordpress:6.8.1` | CMS Multisite avec API GraphQL/REST |
| **MySQL** | `mysql:8.0` | Base de données Multisite |
| **Next.js Frontend** | `nextjs:latest` | Frontend avec routage par domaine |

### 🔧 Plugins Headless Intégrés

- **WPGraphQL** : API GraphQL pour le frontend Next.js
- **JWT Authentication** : Authentification REST API
- **WPGraphQL CORS** : Gestion CORS pour l'accès frontend
- **SAML 2.0** : Authentification SSO Google Workspace
- **WP-CLI** : Gestion en ligne de commande

## 📂 Structure des Environnements

```
docker-images/
├── Environments/
│   ├── DEV/
│   │   ├── Wordpress/          # WordPress Multisite Headless DEV
│   │   ├── Mysql/              # MySQL 8.0 pour développement
│   │   └── Nextjs/             # Frontend Next.js DEV
│   └── TEST/
│       ├── Wordpress/          # WordPress Multisite Headless TEST
│       ├── Mysql/              # MySQL 8.0 pour tests
│       └── Nextjs/             # Frontend Next.js TEST
└── README.md                   # Ce fichier
```

## 🚀 Développement Local

### 💻 Démarrage rapide (Environnement DEV)

```bash
# 1. Naviguer vers l'environnement WordPress DEV
cd Environments/DEV/Wordpress

# 2. Copier et configurer les variables d'environnement
cp .env.example .env
# Les valeurs par défaut fonctionnent pour le développement

# 3. Lancer l'environnement de développement
docker compose up -d --build

# 4. Attendre le démarrage des services (30 secondes)
# WordPress sera accessible sur http://localhost:8080
```

### 🔧 Configuration WordPress Multisite

```bash
# Se connecter au conteneur WordPress
docker compose exec wordpress_testopsfactory bash

# Installer WordPress
wp --allow-root core install \
  --url=http://localhost:8080 \
  --title="TestopsFactory DEV" \
  --admin_user=admin \
  --admin_password=admin123 \
  --admin_email=admin@testopsfactory.com

# Convertir en Multisite
wp --allow-root core multisite-convert \
  --url=http://localhost:8080 \
  --title="TestopsFactory Network" \
  --subdomains

# Activer les plugins headless
wp --allow-root plugin activate \
  wp-graphql wp-graphql-cors jwt-authentication-for-wp-rest-api --network
```

### 📋 Services Locaux

| Service | URL | Identifiants |
|---------|-----|-------------|
| WordPress Multisite | http://localhost:8080 | admin / admin123 |
| MySQL | localhost:3306 | exampleuser / examplepass |
| GraphQL API | http://localhost:8080/graphql | - |
| REST API | http://localhost:8080/wp-json/ | JWT requis |

## 🏗️ Build et Test des Images

### 📦 Build Manuel

```bash
# WordPress DEV
cd Environments/DEV/Wordpress
docker build -t wordpress-headless-dev:latest . --no-cache

# WordPress TEST
cd Environments/TEST/Wordpress
docker build -t wordpress-headless-test:latest . --no-cache
```

### 🧪 Tests Locaux

```bash
# Test complet avec Docker Compose
cd Environments/DEV/Wordpress
docker compose up -d --build

# Vérifier l'accessibilité
curl -I http://localhost:8080

# Tester l'API GraphQL (peut retourner 500 en développement)
curl -I http://localhost:8080/graphql

# Vérifier les services
docker compose ps
```

## ⚙️ Pipelines CI/CD

### 🔄 GitHub Actions (`docker-images-validate.yml`)

**Déclenchement automatique :**
- Push/PR vers `main` ou `develop` avec modifications dans `docker-images/**`
- Déclenchement manuel avec choix d'environnement (DEV, TEST, ALL)

**Tests effectués :**
- Build et validation des images Docker
- Tests de démarrage avec Docker Compose
- Installation WordPress + conversion Multisite
- Activation et validation des plugins headless
- Tests d'accessibilité et endpoints API
- Security scans (Trivy, Docker Scout)
- Validation Dockerfile (hadolint)

### 🛡️ Sécurité et Qualité

- **Trivy Scanner** : Détection des vulnérabilités
- **Docker Scout** : Analyse sécuritaire avancée
- **Hadolint** : Best practices Dockerfile
- **SARIF Reports** : Upload automatique vers GitHub Security

## 🔧 Configuration Avancée

### 📝 Variables d'Environnement

Fichier `.env` configurable :

```bash
# Base de données
WORDPRESS_DB_HOST=db
WORDPRESS_DB_USER=exampleuser
WORDPRESS_DB_PASSWORD=examplepass
WORDPRESS_DB_NAME=exampledb
MYSQL_ROOT_PASSWORD=dbpassword

# Configuration Headless
GRAPHQL_JWT_AUTH_SECRET_KEY=your-secret-key
JWT_AUTH_SECRET_KEY=your-jwt-key
DISABLE_WP_CRON=false

# Multisite
DOMAIN_CURRENT_SITE=localhost:8080
WORDPRESS_DEBUG=0
```

### 🔌 Plugins et Extensions

- **Plugin SAML 2.0** : Authentification Google Workspace
- **WPGraphQL** : API GraphQL complète
- **JWT Auth** : Sécurisation REST API
- **CORS Support** : Accès frontend cross-origin
- **WP-CLI** : Automatisation et gestion

## 📚 Sources et Documentation

### 🔗 Références Techniques

- **WordPress Official** : https://github.com/docker-library/wordpress
- **Dockerfile Base** : WordPress 6.8.1 + PHP 8.4 + Apache
- **WPGraphQL** : https://www.wpgraphql.com/
- **Documentation Projet** : `/docs/01-installation.md`

### 🆔 Versions et Tags

- **Version actuelle** : v1.1.24 (WordPress Multisite Headless)
- **Base WordPress** : 6.8.1
- **PHP Version** : 8.4
- **MySQL Version** : 8.0
- **Dernière mise à jour** : 2025-08-13

## 🚨 Notes Importantes

### ⚠️ Sécurité

- **Ne jamais committer** le fichier `.env` avec des vraies credentials
- **Changer les clés JWT** en production
- **Utiliser des mots de passe forts** pour MySQL
- **Interface WordPress admin** accessible uniquement via VPN/IP restreintes

### 🐛 Problèmes Connus

- **GraphQL Endpoint 500** : Normal en développement, se résout après activation des plugins
- **Apache ServerName Warning** : Cosmétique, n'affecte pas le fonctionnement
- **MySQL Deprecated Warnings** : Versions transitoires, pas d'impact fonctionnel

## 🆘 Support et Troubleshooting

```bash
# Vérifier les logs
docker compose logs wordpress_testopsfactory --tail=50
docker compose logs db --tail=30

# Redémarrer les services
docker compose down && docker compose up -d

# Nettoyer les volumes (⚠️ perte de données)
docker compose down -v
```

Pour plus d'aide : consultez `/docs/01-installation.md` ou les GitHub Actions logs.
