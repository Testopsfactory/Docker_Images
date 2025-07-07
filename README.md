# WordPress Image for Testops Factory (Pierre Pellegrini)

## Description :

Ce repository sert à la création d'une image WordPress à destination des docker.
Vous trouverez ci-dessous l'ensemble des ressources et indications pour procéder à l'update / push des nouvelles
versions de l'image

* 1ère version: release-0.0.1

## Sources / Documentations :

* Github repository : https://github.com/docker-library/wordpress
* Modèle Dockerfile: https://github.com/docker-library/wordpress/blob/master/latest/php8.4/apache/Dockerfile
* modèle Dockerhub: https://hub.docker.com/_/wordpress/

## Maintenance / mises à jour :
* installez dependabot sur votre projet (déjà installé sur le projet principal)

## Lancement :
* Déplacez-vous dans le dossier souhaité (exemple : Wordpress)

```bash
cd Wordpress
```

* Créez le fichier .env sur la base du fichier .env.example

```bash
cp .env.example .env
```
* Modifiez le fichier .env à votre convenance.
* !!! Veillez à ne pas lancer sans modification préalable !!!
* Lancer le service dans docker-compose.yml si vous êtes sur un IDE Jetbrains. 
* Enjoy ! 
