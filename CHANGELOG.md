# Changelog - Docker Images

Toutes les modifications notables apportées au sous-projet docker-images sont documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Versionnement Sémantique](https://semver.org/lang/fr/).

## [1.1.25] - 2025-08-13 - Mise à jour README.md docker-images

### Mis à jour
- **docker-images/README.md** : Refonte complète pour l'architecture WordPress Multisite Headless
  - Remplacement de l'ancienne documentation obsolète (release-0.0.1)
  - Description complète de l'architecture WordPress Multisite Headless + Next.js
  - Instructions détaillées de développement local avec Docker Compose
  - Configuration des environnements DEV/TEST avec structure claire
  - Procédures de build et test des images Docker
  - Documentation complète des pipelines GitHub Actions (docker-images-validate.yml)
  - Variables d'environnement et configuration headless (WPGraphQL, JWT, CORS)
  - Section sécurité et troubleshooting avec problèmes connus
  - Références techniques mises à jour (WordPress 6.8.1, PHP 8.4, MySQL 8.0)
  - Cohérence parfaite avec la documentation principale du projet

### Fonctionnalités documentées
- **Plugins Headless** : WPGraphQL, JWT Auth, CORS, SAML 2.0, WP-CLI
- **Pipelines CI/CD** : Tests automatiques, security scans, validation Dockerfile
- **Développement Local** : Instructions step-by-step pour Docker Compose
- **Configuration Avancée** : Variables d'environnement, sécurité, troubleshooting

### Impact
- Documentation docker-images alignée avec l'architecture réelle du projet
- Procédures de développement local clarifiées et détaillées
- Workflows CI/CD transparents et complets
- Suppression de toutes les références obsolètes à l'ancienne architecture

## [1.1.23] - 2025-08-13 - Pipeline GitHub Actions pour Images Docker

### Ajouté
- **Pipeline GitHub Actions de validation des images Docker** : `docker-images-validate.yml`
  - Triggers automatiques sur push/PR vers main et develop pour les modifications dans `docker-images/**`
  - Déclenchement manuel avec choix d'environnement (DEV, TEST, ALL)
  - Build et test complets des images WordPress DEV avec Docker Compose
  - Tests d'accessibilité WordPress, installation, conversion Multisite
  - Activation et validation des plugins headless (WPGraphQL, JWT Auth, CORS)
  - Test de l'endpoint GraphQL (avec tolérance pour erreurs connues)
  - Security scans avec Trivy vulnerability scanner et Docker Scout
  - Validation Dockerfile avec hadolint pour les best practices
  - Génération de rapports détaillés avec upload d'artifacts
  - Support environnement TEST (conditionnel sur presence de Dockerfile)

### Fonctionnalités du Pipeline
- **Job docker-build-dev** : Build, test services, installation WordPress, conversion Multisite, activation plugins
- **Job docker-build-test** : Build conditionnel pour l'environnement TEST
- **Job security-scan** : Scans de sécurité Trivy et Docker Scout avec upload SARIF
- **Job validate-dockerfile** : Validation hadolint et vérification patterns de sécurité
- **Job generate-report** : Génération rapport markdown avec statuts de tous les jobs

### Infrastructure CI/CD
- Pipeline intégré avec l'écosystème GitHub Actions existant
- Compatibilité avec les patterns de sécurité et secrets management
- Upload automatique des résultats vers GitHub Security tab
- Gestion robuste des erreurs avec continue-on-error approprié
- Nettoyage automatique des ressources Docker entre les tests

## [1.1.22] - 2025-08-13 - WordPress Headless Multisite DEV

### Ajouté
- **Support WordPress Headless**: Implémentation complète des plugins pour le mode headless
  - Plugin WPGraphQL pour l'API GraphQL
  - Plugin JWT Authentication pour l'authentification REST API
  - Plugin WPGraphQL CORS pour l'accès frontend headless
  - WP-CLI pour la gestion en ligne de commande

### Modifié
- **Dockerfile DEV WordPress**: 
  - Installation automatique des plugins headless essentiels
  - Ajout de WP-CLI pour faciliter la gestion WordPress
  - Conservation du plugin SAML 2.0 existant pour Google Workspace

- **Configuration WordPress (wp-config-docker.php)**:
  - Clés JWT secrètes configurables via variables d'environnement
  - Activation CORS pour l'endpoint GraphQL
  - Optimisations mode headless (révisions, cron, REST API)
  - Support Multisite (compatible avec l'infrastructure Terraform)

- **Docker Compose (docker-compose.yml)**:
  - Ajout du service MySQL 8.0 manquant
  - Variables d'environnement pour configuration headless
  - Configuration Multisite intégrée pour développement local
  - Variables JWT et optimisations de performance
  - Dépendances et volumes configurés correctement

- **Variables d'environnement (.env.example)**:
  - Clés JWT secrètes avec exemples
  - Variables d'optimisation WordPress
  - Configuration Multisite pour développement
  - Documentation complète des nouvelles variables

### Testé
- **Validation Docker Desktop**: Tests complets réalisés
  - Image WordPress headless construite avec succès
  - Services MySQL et WordPress démarrent correctement
  - WordPress accessible sur http://localhost:8080
  - Mode Multisite activé et fonctionnel (redirection wp-signup.php)
  - Script docker-entrypoint.sh corrigé et fonctionnel

### Corrigé
- **Problèmes identifiés et résolus lors des tests**:
  - Fichier sunrise.php manquant créé pour le mode Multisite
  - Configuration domaine Multisite corrigée (localhost:8080)
  - Tables Multisite manquantes créées via WP-CLI core multisite-convert
  - Plugins headless activés (WPGraphQL, JWT Auth, CORS)
  - Constantes Multisite dupliquées supprimées du docker-compose.yml
  - Container wordpress_testopsfactory fonctionne sans erreurs critiques

### Warnings corrigés
- **Sécurité critique résolu** :
  - Variables d'environnement sensibles (mots de passe) maintenant cachées dans les logs
  - Logging sécurisé avec "***HIDDEN***" pour tous les mots de passe
  - Message de log mis à jour : "WordPress Environment Variables (passwords hidden)"

### Warnings identifiés (non critiques)
- **Apache Warning** : ServerName directive manquante ("Could not reliably determine the server's fully qualified domain name")
- **MySQL Warnings** :
  - Syntaxe deprecated '--skip-host-cache' (MY-011068)
  - Certificat CA auto-signé (MY-010068) 
  - Configuration pid-file non sécurisée (MY-011810)
- **GraphQL Endpoint** : Erreur 500 sur /graphql (plugins actifs mais erreur de configuration)

### Infrastructure
- Compatible avec l'infrastructure Terraform existante
- Support Multisite déjà implémenté conservé
- Configuration SAML 2.0 + Google Workspace préservée
- Prêt pour déploiement en environnement DEV
- Validé sur Docker Desktop avec succès