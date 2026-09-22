# 📖 Documentation ETI_bot

Ce document rassemble l'intégralité du fonctionnement, des systèmes et des commandes de **ETI_bot**, un bot Discord dédié à la gestion d'événements intra-serveur, de tableaux de bords synchronisés, et de tracking par groupe.

---

## 🔒 1. Système de Permissions

Le bot n'utilise pas les permissions natives de Discord pour bloquer l'apparition des commandes. À la place, il intègre un système robuste basé sur la **hiérarchie des rôles Discord** et une logique de vérification en interne.

- **Le Master (Accès Total) :** 
  - L'utilisateur ayant l'ID `727770618090487808` peut exécuter **absolument toutes les commandes** et cliquer sur n'importe quel bouton, quels que soient ses rôles.
  
- **Le Niveau Administrateur :** 
  - Réservé au rôle ID `1327007554659946527` **ET** à tous les rôles situés *au-dessus* de lui dans la hiérarchie du serveur. 
  - Donne accès aux commandes de configuration (Setup, Scan, Clear).

- **Le Niveau Utilisateur :** 
  - Réservé au rôle ID `1360409289382166699` **ET** à tous les rôles situés *au-dessus* de lui.
  - Donne accès aux commandes du quotidien (Event, Groupes) ainsi qu'à la permission de cliquer sur les boutons de gestion.

*Note : Si un membre clique sur un bouton ou lance une commande sans avoir la permission requise, le bot refusera silencieusement l'action.*

---

## ⚙️ 2. Commandes Administrateur (Setup & Config)

Ces commandes sont essentielles pour configurer le bot sur le serveur.

### `/setup_rappels`
- **Utilité :** Crée le tableau de bord "Public". 
- **Fonctionnement :** Envoie un message incrusté (Embed) dans le salon actuel qui listera automatiquement tous les events à venir (Aujourd'hui & Demain). Ce message sera actualisé dynamiquement dès qu'un event est créé, modifié, validé ou supprimé.

### `/setup_gestion`
- **Utilité :** Définit le salon "Panneau de Contrôle".
- **Fonctionnement :** Désigne le salon actuel comme l'endroit où atterriront tous les "blocs individuels" et interactifs des events.

<img width="447" height="283" alt="image" src="https://github.com/user-attachments/assets/8a02c19b-e5f5-412b-ba4b-24b728fde38b" />

### `/scan`
- **Utilité :** Enregistre un Groupe.
- **Fonctionnement :** À taper dans un des salons d'une catégorie. Le bot va aspirer le nom de la catégorie ainsi que le nom de tous les autres salons situés dedans (vos différent gangs) pour les mémoriser. C'est nécessaire pour le suivi via `/groupes`.

### `/clear`
- **Utilité :** Remise à zéro.
- **Fonctionnement :** Supprime instantanément tous les events (rappels) de la base de données.

---

## 👥 3. Commandes Utilisateur (Le Quotidien)

### `/event [date] [heure]`
- **Utilité :** Déclarer un événement.
- **Fonctionnement :** 
  1. Le membre indique une date (`Aujourd'hui`, `Demain`, `24/10`) et une heure (`21h30`).
  2. L'event s'ajoute dynamiquement sur le **tableau de bord public**. Le créateur est automatiquement listé comme participant.
  3. Un **bloc interactif** est envoyé dans le salon de gestion privé (défini par `/setup_gestion`).

<img width="352" height="353" alt="image" src="https://github.com/user-attachments/assets/db5af5c8-604c-4185-a25e-01157f86b36f" />


### `/groupes [mois] [année]`
- **Utilité :** Suivi de l'activité des Groupes.
- **Fonctionnement :** Affiche un classement/rapport répertoriant toutes les catégories enregistrées via `/scan`. Pour chaque salon (groupe), le bot vérifie combien d'events ont été réalisés dans le mois sélectionné (par défaut, le mois actuel).
  - `0 event` = ❌
  - `1 event` = ✅
  - `2 events` = ✅✅ (et ainsi de suite).

---

## 🕹️ 4. Le Panneau de Gestion Interactif

<img width="509" height="606" alt="image" src="https://github.com/user-attachments/assets/e7e97718-0b06-4fa6-b80d-cfddd9f2c85c" />


C'est le cœur du système de suivi. À chaque fois qu'un `/event` est créé, un bloc sous forme d'Embed apparaît dans le salon de gestion. Ce bloc dispose de 3 boutons et d'un menu :

1. **✅ Valider :** 
   - Marque l'événement comme terminé. 
   - Le bloc de gestion est **grisé** visuellement.
   - L'event disparaît du tableau de bord public. 
   - *(Note : L'event continue de compter dans l'historique pour l'affichage de la commande `/groupes`).*

2. **✏️ Éditer :** 
   - Ouvre une petite fenêtre pop-up (Modal) sur l'écran de l'utilisateur pour modifier la Date ou l'Heure en quelques secondes. 
   - Toutes les interfaces (bloc et tableau de bord) s'actualisent instantanément.

3. **🗑️ Supprimer :** 
   - Efface complètement l'événement de la base de données et supprime le bloc de gestion visuel.

4. **👥 Ajouter des participants (Menu déroulant) :** 
   - Permet de chercher et de sélectionner d'autres membres du serveur pour les rattacher à l'événement.
   - Les membres ajoutés seront mentionnés sur le bloc de gestion, et une mention spéciale (ex: `+ 2`) sera ajoutée à côté du nom du créateur sur le grand tableau de bord public.
